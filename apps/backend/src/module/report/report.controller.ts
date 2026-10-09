import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { Auth } from '../../decorators/auth.decorator.js';
import { CurrentUser } from '../../decorators/current-user.decorator.js';
import { ReportService } from './report.service.js';
import { ApproveReportDto, CreateReportDto } from './dto/report.dto.js';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @Auth('customer', 'seller')
  async createReport(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateReportDto,
  ) {
    const result = await this.reportService.createReport(userId, dto);
    return { message: 'Report submitted successfully 👍', data: result };
  }

  @Get('admin')
  @Auth('admin')
  async adminListReports() {
    const result = await this.reportService.adminListReports();
    return { message: 'Reports fetched successfully 👍', data: result };
  }

  @Get('admin/:id')
  @Auth('admin')
  async adminGetReport(@Param('id') reportId: string) {
    const result = await this.reportService.adminGetReport(reportId);
    return { message: 'Report fetched successfully 👍', data: result };
  }

  @Patch('admin/:id/approve')
  @Auth('admin')
  async adminApproveReport(
    @Param('id') reportId: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: ApproveReportDto,
  ) {
    const result = await this.reportService.adminApproveReport(reportId, adminId, dto);
    return { message: result.message, data: null };
  }

  @Patch('admin/:id/reject')
  @Auth('admin')
  async adminRejectReport(
    @Param('id') reportId: string,
    @CurrentUser('id') adminId: string,
  ) {
    const result = await this.reportService.adminRejectReport(reportId, adminId);
    return { message: 'Report rejected successfully 👍', data: result };
  }

  @Patch('admin/product/:id/inactive')
  @Auth('admin')
  async adminForceProductInactive(@Param('id') productId: string) {
    const result = await this.reportService.adminForceProductInactive(productId);
    return { message: 'Product set to inactive 👍', data: result };
  }

  @Patch('admin/shop/:id/freeze')
  @Auth('admin')
  async adminFreezeShop(@Param('id') shopId: string) {
    const result = await this.reportService.adminFreezeShop(shopId);
    return { message: 'Shop frozen successfully 👍', data: result };
  }

  @Patch('admin/shop/:id/unfreeze')
  @Auth('admin')
  async adminUnfreezeShop(@Param('id') shopId: string) {
    const result = await this.reportService.adminUnfreezeShop(shopId);
    return { message: 'Shop unfrozen successfully 👍', data: result };
  }
}
