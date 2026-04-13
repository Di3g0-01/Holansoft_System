import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('categories')
  getCategories() {
    return this.analyticsService.getCategoryDistribution();
  }

  @Get('weekly-sales')
  getWeeklySales(@Query('period') period?: string, @Query('lang') lang?: string) {
    return this.analyticsService.getSalesByPeriod(period, lang);
  }

  @Get('stock-status')
  getStockStatus() {
    return this.analyticsService.getStockStatus();
  }

  @Get('weekly-purchases')
  getWeeklyPurchases(@Query('period') period?: string, @Query('lang') lang?: string) {
    return this.analyticsService.getPurchasesByPeriod(period, lang);
  }

  @Get('summary')
  getSummary() {
    return this.analyticsService.getSummaryStats();
  }
}
