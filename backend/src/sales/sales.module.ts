import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from '../entities/sale.entity';
import { SaleItem } from '../entities/sale-item.entity';
import { Product } from '../entities/product.entity';
import { Client } from '../entities/client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, SaleItem, Product, Client])],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
