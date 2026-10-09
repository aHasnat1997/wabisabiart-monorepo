import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ZipArchive } from 'archiver';
import * as unzipper from 'unzipper';
import { stringify } from 'csv-stringify/sync';
import { parse } from 'csv-parse/sync';
import { PassThrough } from 'stream';
import { PrismaService } from '@wabisabiart/db';
import type { DMMF } from '@wabisabiart/db';

interface ModelConfig {
  name: string;
  delegate: string;
}

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  constructor(private readonly prisma: PrismaService) {}

  private getDmmf(): DMMF.Document {
    return (this.prisma as any).$dmmf as DMMF.Document;
  }

  async debugDmmfShape(): Promise<void> {
    const dmmf = this.getDmmf();
    console.log('--- DMMF Diagnostic ---');
    console.log(
      'Total models found:',
      dmmf?.datamodel?.models?.length ?? 'dmmf.datamodel.models is undefined!',
    );
    for (const model of dmmf?.datamodel?.models ?? []) {
      console.log(`\nModel: ${model.name}`);
      for (const field of model.fields) {
        console.log(
          `  - ${field.name}: kind=${field.kind}, type=${field.type}, isId=${field.isId}, isList=${field.isList}, relationFromFields=${JSON.stringify(field.relationFromFields)}`,
        );
      }
    }
  }

  private getModels(): ModelConfig[] {
    const dmmf = this.getDmmf();
    if (!dmmf?.datamodel?.models) {
      throw new Error(
        'Prisma DMMF not available (dmmf.datamodel.models is undefined). ' +
          'Run debugDmmfShape() to inspect.',
      );
    }
    return dmmf.datamodel.models.map((m: any) => ({
      name: m.name,
      delegate: m.name.charAt(0).toLowerCase() + m.name.slice(1),
    }));
  }

  private getScalarFields(
    modelName: string,
  ): Array<{ name: string; type: string; isList: boolean }> {
    const dmmf = this.getDmmf();
    const model = dmmf.datamodel.models.find((m: any) => m.name === modelName);
    if (!model) return [];
    return (model.fields as any[])
      .filter((f: any) => f.kind === 'scalar' || f.kind === 'enum')
      .map((f: any) => ({
        name: f.name,
        type: f.type,
        isList: Boolean(f.isList),
      }));
  }

  private getPrimaryKeyFields(modelName: string): string[] {
    const dmmf = this.getDmmf();
    const model = dmmf.datamodel.models.find((m: any) => m.name === modelName);
    if (!model) return [];
    const idFields = (model.fields as any[])
      .filter((f: any) => f.isId)
      .map((f: any) => f.name);
    if (idFields.length > 0) return idFields;
    const pkFields = (model as any).primaryKey?.fields;
    if (pkFields?.length) return [...pkFields];
    return [];
  }

  private getRestoreOrder(): string[] {
    const dmmf = this.getDmmf();
    const models = dmmf.datamodel.models as unknown as Array<{
      name: string;
      fields: any[];
    }>;

    const dependencies = new Map<string, Set<string>>();
    for (const m of models) {
      const deps = new Set<string>();
      for (const f of m.fields) {
        if (f.kind === 'object' && f.relationFromFields?.length > 0) {
          deps.add(f.type);
        }
      }
      deps.delete(m.name);
      dependencies.set(m.name, deps);
    }

    const ordered: string[] = [];
    const visited = new Set<string>();

    const visit = (name: string) => {
      if (visited.has(name)) return;
      visited.add(name);
      for (const dep of dependencies.get(name) ?? []) visit(dep);
      ordered.push(name);
    };

    for (const m of models) visit(m.name);
    return ordered;
  }

  async exportBackup(): Promise<Buffer> {
    const models = this.getModels();
    const archive = new ZipArchive({ zlib: { level: 9 } });
    const chunks: Buffer[] = [];
    const passthrough = new PassThrough();
    const zipBufferPromise = new Promise<Buffer>((resolve, reject) => {
      passthrough.on('data', (chunk: Buffer) => chunks.push(chunk));
      passthrough.once('end', () => resolve(Buffer.concat(chunks)));
      passthrough.once('error', reject);
      archive.once('error', reject);
      archive.once('warning', (warning) => {
        this.logger.warn(warning.message);
      });
    });

    archive.pipe(passthrough);

    for (const model of models) {
      const delegate = (this.prisma as any)[model.delegate];
      if (!delegate) {
        this.logger.warn(
          `Skipping ${model.name}: no delegate found on PrismaClient`,
        );
        continue;
      }

      const rows: Record<string, any>[] = await delegate.findMany();
      const fields = this.getScalarFields(model.name);

      const csvRows = rows.map((row) => {
        const out: Record<string, string> = {};
        for (const f of fields) out[f.name] = this.serializeValue(row[f.name]);
        return out;
      });

      const csv = stringify(csvRows, {
        header: true,
        columns: fields.map((f) => f.name),
      });

      archive.append(csv, { name: `${model.name}.csv` });
      this.logger.log(`Exported ${rows.length} rows from ${model.name}`);
    }

    await archive.finalize();
    return zipBufferPromise;
  }

  private serializeValue(value: any): string {
    if (value === null || value === undefined) return '';
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  async restoreBackup(
    zipBuffer: Buffer,
  ): Promise<{ restored: Record<string, number> }> {
    const csvByModel = await this.extractCsvFiles(zipBuffer);
    const restoreOrder = this.getRestoreOrder();
    const includedModels = new Set(
      [...csvByModel.keys()].map((filename) => filename.replace(/\.csv$/, '')),
    );
    const results: Record<string, number> = {};

    await this.prisma.$transaction(
      async (tx) => {
        await this.clearExistingBackupData(tx, restoreOrder, includedModels);

        for (const modelName of restoreOrder) {
          const csvContent = csvByModel.get(`${modelName}.csv`);
          if (!csvContent) continue;

          const delegate = (tx as any)[
            modelName.charAt(0).toLowerCase() + modelName.slice(1)
          ];
          if (!delegate) continue;

          const fields = this.getScalarFields(modelName);
          const records: Record<string, string>[] = parse(csvContent, {
            columns: true,
            skip_empty_lines: true,
          });

          const data = records.map((record) =>
            this.deserializeRow(record, fields),
          );
          let count = 0;
          if (data.length > 0) {
            const result = await delegate.createMany({ data });
            count = result.count;
          }

          results[modelName] = count;
          this.logger.log(`Restored ${count} rows into ${modelName}`);
        }
      },
      { timeout: 5 * 60 * 1000 },
    );

    return { restored: results };
  }

  private async clearExistingBackupData(
    tx: unknown,
    restoreOrder: string[],
    includedModels: Set<string>,
  ): Promise<void> {
    for (const modelName of [...restoreOrder].reverse()) {
      if (!includedModels.has(modelName)) continue;
      const delegate = (tx as any)[
        modelName.charAt(0).toLowerCase() + modelName.slice(1)
      ];
      if (!delegate) continue;
      const result = await delegate.deleteMany();
      this.logger.log(`Cleared ${result.count} rows from ${modelName}`);
    }
  }

  private async extractCsvFiles(
    zipBuffer: Buffer,
  ): Promise<Map<string, string>> {
    const files = new Map<string, string>();
    const directory = await unzipper.Open.buffer(zipBuffer);
    for (const entry of directory.files) {
      if (!entry.path.endsWith('.csv')) continue;
      const content = await entry.buffer();
      files.set(entry.path, content.toString('utf-8'));
    }
    if (files.size === 0) {
      throw new BadRequestException('No CSV files found in uploaded ZIP');
    }
    return files;
  }

  private deserializeRow(
    record: Record<string, string>,
    fields: Array<{ name: string; type: string; isList: boolean }>,
  ): Record<string, any> {
    const out: Record<string, any> = {};
    for (const f of fields) {
      const raw = record[f.name];
      if (f.isList) {
        out[f.name] = this.deserializeListValue(raw);
        continue;
      }
      if (raw === '' || raw === undefined) {
        out[f.name] = null;
        continue;
      }
      switch (f.type) {
        case 'Int':
          out[f.name] = parseInt(raw, 10);
          break;
        case 'BigInt':
          out[f.name] = BigInt(raw);
          break;
        case 'Float':
        case 'Decimal':
          out[f.name] = this.deserializeNumberValue(raw);
          break;
        case 'Boolean':
          out[f.name] = raw === 'true' || raw === 'TRUE' || raw === '1';
          break;
        case 'DateTime':
          out[f.name] = new Date(raw);
          break;
        case 'Json':
          try {
            out[f.name] = JSON.parse(raw);
          } catch {
            out[f.name] = raw;
          }
          break;
        default:
          out[f.name] = raw;
      }
    }
    return out;
  }

  private deserializeListValue(raw: string | undefined): unknown[] {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return raw
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
    }
  }

  private deserializeNumberValue(raw: string): number {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = raw;
    }
    const value = typeof parsed === 'number' ? parsed : Number(parsed);
    return Number.isNaN(value) ? 0 : value;
  }
}
