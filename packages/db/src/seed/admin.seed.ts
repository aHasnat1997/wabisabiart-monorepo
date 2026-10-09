import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../prisma/generated/prisma/client.js';
import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

export async function seedAdmin() {
  const connectionString = `${process.env.DATABASE_URL}`;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const isAdminSeeded = await prisma.user.findUnique({
      where: { email: process.env.ADMIN_EMAIL as string },
    });

    if (isAdminSeeded) {
      Logger.log('🫅 Admin is already seeded...', 'Seed Admin');
      return;
    }

    const admin = await prisma.user.create({
      data: {
        email: process.env.ADMIN_EMAIL as string,
        fullName: process.env.ADMIN_FULL_NAME as string,
        avatarUrl: process.env.ADMIN_AVATAR_URL as string,
        passwordHash: await bcrypt.hash(
          process.env.ADMIN_PASSWORD as string,
          10,
        ),
        role: 'admin',
        emailVerified: true,
      },
    });

    Logger.log(`🫅 Admin seeded with id: ${admin.id}`, 'Seed Admin');
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}
