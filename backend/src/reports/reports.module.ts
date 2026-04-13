import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from '../entities/sale.entity';
import { Purchase } from '../entities/purchase.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, Purchase])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
