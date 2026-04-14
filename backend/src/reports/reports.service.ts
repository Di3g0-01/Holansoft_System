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
    const start = this.parseDate(startDate, 'start');
    const end = this.parseDate(endDate, 'end');

    return this.salesRepository.find({
      where: { date: Between(start, end) },
      relations: ['items', 'items.product', 'items.product.category']
    });
  }

  async getPurchases(startDate: string, endDate: string) {
    const start = this.parseDate(startDate, 'start');
    const end = this.parseDate(endDate, 'end');

    return this.purchasesRepository.find({
      where: { date: Between(start, end) },
      relations: ['items', 'items.product', 'items.product.category']
    });
  }

  private parseDate(dateStr: string, type: 'start' | 'end'): Date {
    const suffix = type === 'start' ? 'T00:00:00.000Z' : 'T23:59:59.999Z';
    const date = new Date(`${dateStr}${suffix}`);
    
    if (isNaN(date.getTime())) {
      const fallback = new Date();
      if (type === 'start') fallback.setUTCHours(0, 0, 0, 0);
      else fallback.setUTCHours(23, 59, 59, 999);
      return fallback;
    }
    return date;
  }
}
