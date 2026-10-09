import { Module } from '@nestjs/common';
import { AddressService } from './address.service.js';
import { AddressController } from './address.controller.js';
import { PrismaService } from '@wabisabiart/db';

@Module({
  controllers: [AddressController],
  providers: [AddressService, PrismaService],
})
export class AddressModule {}
