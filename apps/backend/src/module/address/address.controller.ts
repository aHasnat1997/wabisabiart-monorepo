import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { AddressService } from './address.service.js';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto.js';
import { Auth } from '../../../src/decorators/auth.decorator.js';
import type { Request } from 'express';

@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @Auth()
  async create(
    @Req() req: Request,
    @Body() createAddressDto: CreateAddressDto,
  ) {
    const authUser = req.user?.id;
    if (!authUser) {
      throw new Error('Unauthorized');
    }
    return await this.addressService.create(authUser, createAddressDto);
  }

  @Get()
  @Auth()
  async findAll(@Req() req: Request) {
    const authUser = req.user?.id;
    if (!authUser) {
      throw new Error('Unauthorized');
    }
    return await this.addressService.findAll(authUser);
  }

  @Get('default')
  @Auth()
  async findDefaultShippingAddress(
    @Req() req: Request,
    @Query('type') type: 'shipping' | 'billing',
  ) {
    const authUser = req.user?.id;
    if (!authUser) {
      throw new Error('Unauthorized');
    }
    if (type === 'billing') {
      return await this.addressService.findDefaultBillingAddress(authUser);
    }
    if (type === 'shipping') {
      return await this.addressService.findDefaultShippingAddress(authUser);
    }
  }

  @Get(':id')
  @Auth()
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const authUser = req.user?.id;
    if (!authUser) {
      throw new Error('Unauthorized');
    }
    return await this.addressService.findOne(id);
  }

  @Patch(':id')
  @Auth()
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    const authUser = req.user?.id;
    if (!authUser) {
      throw new Error('Unauthorized');
    }
    return await this.addressService.update(id, authUser, updateAddressDto);
  }

  @Delete(':id')
  @Auth()
  async remove(@Req() req: Request, @Param('id') id: string) {
    const authUser = req.user?.id;
    if (!authUser) {
      throw new Error('Unauthorized');
    }
    return await this.addressService.remove(id, authUser);
  }

  @Patch('default/:id')
  @Auth()
  async setDefaultAddress(
    @Req() req: Request,
    @Param('id') id: string,
    @Query('type') type: 'shipping' | 'billing',
  ) {
    const authUser = req.user?.id;
    if (!authUser) {
      throw new Error('Unauthorized');
    }
    if (type === 'billing') {
      return await this.addressService.setDefaultBillingAddress(id, authUser);
    }
    if (type === 'shipping') {
      return await this.addressService.setDefaultShippingAddress(id, authUser);
    }
  }
}
