/**
 * @wabisabiart/db
 * Exports the Prisma client and Nest service to be used across apps.
 *
 * Usage in apps/backend:
 *   import { prisma } from '@wabisabiart/db';
 */

import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated/prisma/client.js";
export type { DMMF } from "@prisma/generator-helper";
import pg from "pg";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly pool: pg.Pool;

  constructor() {
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    super({ adapter: new PrismaPg(pool) });
    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}

export * from "../prisma/generated/prisma/client.js";
export { seedAdmin } from "./seed/admin.seed.js";
export { seedCategories } from "./seed/category.seed.js";
