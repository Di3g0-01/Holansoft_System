import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Sale } from '../entities/sale.entity';
import { Product } from '../entities/product.entity';
import { SaleItem } from '../entities/sale-item.entity';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale) private salesRepository: Repository<Sale>,
    private dataSource: DataSource
  ) {}

  findAll() {
    return this.salesRepository.find({ relations: ['items', 'items.product', 'items.product.category'] });
  }

  async create(createDto: { rpNumber: string; customer: string; date: string; items: { productId: number; quantity: number; price: number }[] }) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      let total = 0;
      for (const item of createDto.items) {
        total += item.quantity * item.price;
      }

      const sale = queryRunner.manager.create(Sale, {
        rpNumber: createDto.rpNumber,
        customer: createDto.customer,
        date: new Date(createDto.date),
        total,
      });

      const savedSale = await queryRunner.manager.save(sale);

      for (const item of createDto.items) {
        const product = await queryRunner.manager.findOne(Product, { 
          where: { id_producto: item.productId }
        });
        if (!product) throw new BadRequestException(`Producto con ID ${item.productId} no existe.`);

        if (product.cantidad < item.quantity) {
          throw new BadRequestException(`Stock insuficiente para el producto ${product.nombre}. Stock actual: ${product.cantidad}`);
        }

        // Decrement quantity (stock)
        product.cantidad = Number(product.cantidad) - Number(item.quantity);
        await queryRunner.manager.save(product);

        const saleItem = queryRunner.manager.create(SaleItem, {
          id_venta: savedSale.id,
          id_producto: item.productId,
          cantidad: item.quantity,
          precio: item.price,
          sub_total: item.quantity * item.price
        });
        await queryRunner.manager.save(saleItem);
      }

      await queryRunner.commitTransaction();
      return savedSale;
    } catch (err) {
      console.error('SERVER ERROR DURING SALE CREATE:', err);
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
