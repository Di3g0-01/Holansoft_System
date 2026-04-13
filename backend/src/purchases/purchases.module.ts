import { Module } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { PurchasesController } from './purchases.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Purchase } from '../entities/purchase.entity';
import { PurchaseItem } from '../entities/purchase-item.entity';
import { Product } from '../entities/product.entity';
import { Provider } from '../entities/provider.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Purchase, PurchaseItem, Product, Provider])],
  controllers: [PurchasesController],
  providers: [PurchasesService],
})
export class PurchasesModule {}
