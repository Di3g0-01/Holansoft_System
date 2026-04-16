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
    // Standardize to YYYY-MM-DD format if it contains time
    const cleanDate = dateStr.split('T')[0];
    
    // We create the date to be exactly the start or end of the day in LOCAL time 
    // where the server/database is running.
    if (type === 'start') {
      return new Date(`${cleanDate}T00:00:00`);
    } else {
      return new Date(`${cleanDate}T23:59:59.999`);
    }
  }
}
