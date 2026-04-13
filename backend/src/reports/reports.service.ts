import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Sale } from '../entities/sale.entity';
import { Purchase } from '../entities/purchase.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Sale) private salesRepository: Repository<Sale>,
    @InjectRepository(Purchase) private purchasesRepository: Repository<Purchase>
  ) {}

  async getSales(startDate: string, endDate: string) {
    // Force UTC boundaries by appending time strings
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);

    return this.salesRepository.find({
      where: { date: Between(start, end) },
      relations: ['items', 'items.product', 'items.product.category']
    });
  }

  async getPurchases(startDate: string, endDate: string) {
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);

    return this.purchasesRepository.find({
      where: { date: Between(start, end) },
      relations: ['items', 'items.product', 'items.product.category']
    });
  }
}
