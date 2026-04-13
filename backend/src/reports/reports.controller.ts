import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales')
  getSales(@Query('start') start: string, @Query('end') end: string) {
    return this.reportsService.getSales(start, end);
  }

  @Get('purchases')
  getPurchases(@Query('start') start: string, @Query('end') end: string) {
    return this.reportsService.getPurchases(start, end);
  }
}
