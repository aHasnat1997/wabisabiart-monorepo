import { Controller, Get, Param, Patch, Body, Req } from '@nestjs/common';
import { CustomersService } from './customers.service.js';
import { Auth } from '../../../src/decorators/auth.decorator.js';
import {
  QueryBuilder,
  ParsedQuery,
} from '../../../src/decorators/query-builder.decorator.js';
import { UserRole } from '@wabisabiart/db';
import { User } from '@wabisabiart/db';
import { ActivateDeactivateDto } from './dto/customer.dto.js';
import type { Request } from 'express';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  // ─────────────────────────────────────────────────────────────────────────
  // SELLER ROUTES (specific paths first)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * GET /customers/seller
   * Get all customers who have purchased from this seller
   * QueryBuilder format with pagination, sorting, filtering
   */
  @Get('seller')
  @Auth(UserRole.seller)
  async getSellerCustomers(
    @Req() req: Request,
    @QueryBuilder<User>({
      searchFields: ['fullName', 'email'],
      enumFields: ['isActive'],
      booleanFields: ['isActive'],
      defaultSort: { field: 'createdAt', order: 'desc' },
      defaultLimit: 10,
      maxLimit: 100,
    })
    query: ParsedQuery & { page: number; limit: number },
  ) {
    const sellerId = req.user?.sellerProfile?.id as string;
    const result = await this.customersService.getSellerCustomers(
      sellerId,
      query,
    );

    return {
      message: 'Customers fetched successfully 👍',
      data: {
        items: result.customers,
        page: query.page,
        limit: query.limit,
        total: result.total,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ADMIN ROUTES (specific paths before parameterized)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * GET /customers/admin
   * Get all customers in the system (admin view)
   * QueryBuilder format with pagination, sorting, filtering
   */
  @Get('admin')
  @Auth(UserRole.admin)
  async getAllCustomersAdmin(
    @QueryBuilder<User>({
      searchFields: ['fullName', 'email', 'phoneNumber'],
      booleanFields: ['isActive'],
      defaultSort: { field: 'createdAt', order: 'desc' },
      defaultLimit: 10,
      maxLimit: 100,
    })
    query: ParsedQuery & { page: number; limit: number },
  ) {
    const result = await this.customersService.getAllCustomers(query);

    return {
      message: 'All customers fetched successfully 👍',
      data: {
        items: result.customers,
        page: query.page,
        limit: query.limit,
        total: result.total,
      },
    };
  }

  /**
   * GET /customers/admin/:customerId
   * Get detailed customer information with order history and statistics
   */
  @Get('admin/:customerId')
  @Auth(UserRole.admin)
  async getCustomerDetailLegacy(@Param('customerId') customerId: string) {
    const result = await this.customersService.getCustomerDetail(customerId);
    return {
      message: 'Customer fetched successfully 👍',
      data: result,
    };
  }

  /**
   * PATCH /customers/:customerId/status
   * Activate or deactivate a customer
   * Body: { isActive: boolean }
   */
  @Patch(':customerId/status')
  @Auth(UserRole.admin)
  async activateDeactivateCustomer(
    @Param('customerId') customerId: string,
    @Body() dto: ActivateDeactivateDto,
  ) {
    const result = await this.customersService.activateDeactivateCustomer(
      customerId,
      dto.isActive,
    );
    return {
      message: `Customer ${dto.isActive ? 'activated' : 'deactivated'} successfully 👍`,
      data: result,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DEFAULT ROUTES (Refine simple-rest dataProvider compatible - generic paths last)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * GET /customers
   * Get all customers (admin view - Refine compatible)
   * Query: _start=0&_end=10&_sort=createdAt&_order=DESC
   */
  @Get()
  @Auth(UserRole.admin)
  async list(
    @QueryBuilder<User>({
      searchFields: ['fullName', 'email', 'phoneNumber'],
      booleanFields: ['isActive'],
      defaultSort: { field: 'createdAt', order: 'desc' },
      defaultLimit: 10,
      maxLimit: 100,
    })
    query: ParsedQuery & { page: number; limit: number },
  ) {
    const result = await this.customersService.getAllCustomers(query);

    return {
      message: 'Customers fetched successfully 👍',
      data: {
        items: result.customers,
        page: query.page,
        limit: query.limit,
        total: result.total,
      },
    };
  }

  /**
   * GET /customers/:id
   * Get detailed customer information
   */
  @Get(':id')
  @Auth(UserRole.admin)
  async detail(@Param('id') customerId: string) {
    const result = await this.customersService.getCustomerDetail(customerId);
    return {
      message: 'Customer fetched successfully 👍',
      data: result,
    };
  }
}
