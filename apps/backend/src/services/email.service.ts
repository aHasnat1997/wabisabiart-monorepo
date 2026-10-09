import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Transporter } from 'nodemailer';
import * as nodemailer from 'nodemailer';
import Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

interface EmailOptions {
  to: string | string[];
  subject: string;
  templateName: string;
  context: any;
  text?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content?: Buffer | string;
    path: string;
    cid?: string;
  }>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;
  private templatesDir = path.resolve(process.cwd(), 'src/view/templates');

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const config = {
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: this.configService.get<boolean>('SMTP_SECURE'),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    };

    this.transporter = nodemailer.createTransport(config);
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection verified successfully');
    } catch (error: unknown) {
      this.logger.error('SMTP connection failed', error);
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const templatePath = path.join(
        this.templatesDir,
        `${options.templateName}.hbs`,
      );
      const templateSource = fs.readFileSync(templatePath, 'utf8');
      const compiledTemplate = Handlebars.compile(templateSource);
      const htmlContent = compiledTemplate(options.context);

      const mailOptions = {
        from: options.from || this.configService.get<string>('SMTP_FROM'),
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: htmlContent,
        cc: options.cc,
        bcc: options.bcc,
        attachments: options.attachments,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`📨 Email sent successfully`);
      return true;
    } catch (error: unknown) {
      this.logger.error('❌ Failed to send email', error);
      return false;
    }
  }
}
