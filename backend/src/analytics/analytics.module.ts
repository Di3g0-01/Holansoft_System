import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Product } from '../entities/product.entity';
import { Sale } from '../entities/sale.entity';
import { Category } from '../entities/category.entity';
import { Purchase } from '../entities/purchase.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Sale, Category, Purchase])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService]
})
export class AnalyticsModule {}
