import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Product } from '../entities/product.entity';
import { Sale } from '../entities/sale.entity';
import { Category } from '../entities/category.entity';
import { Purchase } from '../entities/purchase.entity';
import { startOfDay, endOfDay, subDays, subMonths, subWeeks, startOfMonth, startOfWeek, endOfMonth, endOfWeek, format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(Sale) private saleRepository: Repository<Sale>,
    @InjectRepository(Category) private categoryRepository: Repository<Category>,
    @InjectRepository(Purchase) private purchaseRepository: Repository<Purchase>,
  ) {}

  async getCategoryDistribution() {
    const categories = await this.categoryRepository.find({ relations: ['products'] });
    return categories.map(cat => ({
      name: cat.name,
      value: cat.products?.length || 0
    })).filter(cat => cat.value > 0);
  }

  async getSalesByPeriod(period: string = 'day', lang: string = 'es') {
    const today = new Date();
    let periods: { date: Date, label: string, start: Date, end: Date }[] = [];
    const locale = lang === 'en' ? enUS : es;

    if (period === 'month') {
      // Last 12 months
      periods = Array.from({ length: 12 }, (_, i) => {
        const date = subMonths(today, 11 - i);
        return {
          date,
          label: format(date, 'MMM', { locale }),
          start: startOfMonth(date),
          end: endOfMonth(date)
        };
      });
    } else if (period === 'week') {
      // Last 4 weeks
      periods = Array.from({ length: 4 }, (_, i) => {
        const date = subWeeks(today, 3 - i);
        return {
          date,
          label: lang === 'es' ? `Sem ${format(date, 'w', { locale })}` : `Wk ${format(date, 'w', { locale })}`,
          start: startOfWeek(date, { weekStartsOn: 1 }),
          end: endOfWeek(date, { weekStartsOn: 1 })
        };
      });
    } else {
      // Last 7 days
      periods = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(today, 6 - i);
        return {
          date,
          label: format(date, 'EEE', { locale }),
          start: startOfDay(date),
          end: endOfDay(date)
        };
      });
    }

    const sales = await this.saleRepository.find({
      where: {
        date: Between(periods[0].start, periods[periods.length - 1].end)
      }
    });

    return periods.map(p => {
      const pSales = sales.filter(s => new Date(s.date) >= p.start && new Date(s.date) <= p.end);
      const total = pSales.reduce((sum, s) => sum + Number(s.total), 0);
      return {
        name: p.label.charAt(0).toUpperCase() + p.label.slice(1),
        total: parseFloat(total.toFixed(2))
      };
    });
  }

  async getStockStatus() {
    const products = await this.productRepository.find();
    const lowStock = products.filter(p => p.cantidad <= 10).length;
    const goodStock = products.length - lowStock;

    return [
      { name: 'lowStock', value: lowStock, color: '#ef4444' },
      { name: 'goodStock', value: goodStock, color: '#22c55e' }
    ];
  }

  async getPurchasesByPeriod(period: string = 'day', lang: string = 'es') {
    const today = new Date();
    let periods: { date: Date, label: string, start: Date, end: Date }[] = [];
    const locale = lang === 'en' ? enUS : es;

    if (period === 'month') {
      periods = Array.from({ length: 12 }, (_, i) => {
        const date = subMonths(today, 11 - i);
        return {
          date,
          label: format(date, 'MMM', { locale }),
          start: startOfMonth(date),
          end: endOfMonth(date)
        };
      });
    } else if (period === 'week') {
      periods = Array.from({ length: 4 }, (_, i) => {
        const date = subWeeks(today, 3 - i);
        return {
          date,
          label: lang === 'es' ? `Sem ${format(date, 'w', { locale })}` : `Wk ${format(date, 'w', { locale })}`,
          start: startOfWeek(date, { weekStartsOn: 1 }),
          end: endOfWeek(date, { weekStartsOn: 1 })
        };
      });
    } else {
      periods = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(today, 6 - i);
        return {
          date,
          label: format(date, 'EEE', { locale }),
          start: startOfDay(date),
          end: endOfDay(date)
        };
      });
    }

    const purchases = await this.purchaseRepository.find({
      where: {
        date: Between(periods[0].start, periods[periods.length - 1].end)
      }
    });

    return periods.map(p => {
      const pPurchases = purchases.filter(purch => new Date(purch.date) >= p.start && new Date(purch.date) <= p.end);
      const total = pPurchases.reduce((sum, purch) => sum + Number(purch.total), 0);
      return {
        name: p.label.charAt(0).toUpperCase() + p.label.slice(1),
        total: parseFloat(total.toFixed(2))
      };
    });
  }

  async getSummaryStats() {
    const productsCount = await this.productRepository.count();
    const lowStockCount = await this.productRepository.count({ where: { cantidad: Between(0, 10) } as any });
    
    // Recent Sales (Total Q)
    const sales = await this.saleRepository.find();
    const salesTotal = sales.reduce((acc, sale) => acc + Number(sale.total), 0);

    // Recent Purchases (Total Q)
    const purchases = await this.purchaseRepository.find();
    const purchasesTotal = purchases.reduce((acc, p) => acc + Number(p.total), 0);

    return {
      products: productsCount,
      lowStock: lowStockCount,
      recentSales: salesTotal,
      recentPurchases: purchasesTotal
    };
  }
}
