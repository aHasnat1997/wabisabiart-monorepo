import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto.js';
import { PrismaService } from '@wabisabiart/db';

@Injectable()
export class AddressService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createAddressDto: CreateAddressDto) {
    const address = await this.prisma.address.create({
      data: {
        ...createAddressDto,
        userId,
      },
    });

    return address;
  }

  async findAll(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
    });
  }

  async findOne(id: string) {
    return this.prisma.address.findUnique({
      where: { id },
    });
  }

  async update(
    id: string,
    authUser: string,
    updateAddressDto: UpdateAddressDto,
  ) {
    const getAddress = await this.prisma.address.findUnique({
      where: { id },
    });

    if (!getAddress) {
      throw new Error('Address not found');
    }

    if (getAddress.userId !== authUser) {
      throw new BadRequestException('Unauthorized to update this address');
    }

    return this.prisma.address.update({
      where: { id },
      data: updateAddressDto,
    });
  }

  async remove(id: string, authUser: string) {
    const getAddress = await this.prisma.address.findUnique({
      where: { id },
    });

    if (!getAddress) {
      throw new Error('Address not found');
    }

    if (getAddress.userId !== authUser) {
      throw new BadRequestException('Unauthorized to delete this address');
    }

    return this.prisma.address.delete({
      where: { id },
    });
  }

  async findDefaultShippingAddress(userId: string) {
    return this.prisma.address.findFirst({
      where: { userId, isDefaultShipping: true },
    });
  }

  async findDefaultBillingAddress(userId: string) {
    return this.prisma.address.findFirst({
      where: { userId, isDefaultBilling: true },
    });
  }

  async setDefaultShippingAddress(id: string, userId: string) {
    const address = await this.prisma.address.findUnique({
      where: { id },
    });

    if (!address) {
      throw new Error('Address not found');
    }

    if (address.userId !== userId) {
      throw new BadRequestException(
        'Unauthorized to set this address as default shipping',
      );
    }

    await this.prisma.address.updateMany({
      where: { userId },
      data: { isDefaultShipping: false },
    });

    return await this.prisma.address.update({
      where: { id },
      data: { isDefaultShipping: true },
    });
  }

  async setDefaultBillingAddress(id: string, userId: string) {
    const address = await this.prisma.address.findUnique({
      where: { id },
    });

    if (!address) {
      throw new Error('Address not found');
    }

    if (address.userId !== userId) {
      throw new BadRequestException(
        'Unauthorized to set this address as default billing',
      );
    }

    await this.prisma.address.updateMany({
      where: { userId },
      data: { isDefaultBilling: false },
    });

    return await this.prisma.address.update({
      where: { id },
      data: { isDefaultBilling: true },
    });
  }
}
