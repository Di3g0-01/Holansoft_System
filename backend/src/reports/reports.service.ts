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
    // We create the date from the string (YYYY-MM-DD)
    // new Date('2024-04-14') creates 2024-04-14 00:00:00 UTC
    const date = new Date(dateStr);
    
    if (isNaN(date.getTime())) {
      const fallback = new Date();
      if (type === 'start') fallback.setUTCHours(0, 0, 0, 0);
      else fallback.setUTCHours(23, 59, 59, 999);
      return fallback;
    }

    if (type === 'start') {
      // To account for timezones with positive offsets, we go back a bit
      date.setUTCHours(0, 0, 0, 0);
      date.setHours(date.getHours() - 12); 
    } else {
      // To account for timezones with negative offsets (like the user's -06:00),
      // we go forward to include "tomorrow morning UTC" which is still "tonight local"
      date.setUTCHours(23, 59, 59, 999);
      date.setHours(date.getHours() + 12);
    }
    
    return date;
  }
}
