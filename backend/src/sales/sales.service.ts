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

  async update(id: number, updateDto: { customer: string; items: { productId: number; quantity: number; price: number }[] }) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const sale = await queryRunner.manager.findOne(Sale, {
        where: { id },
        relations: ['items']
      });
      if (!sale) throw new BadRequestException(`Venta con ID ${id} no encontrada.`);

      // 1. Restore old stock
      for (const item of sale.items) {
        const product = await queryRunner.manager.findOne(Product, { where: { id_producto: item.id_producto } });
        if (product) {
          product.cantidad = Number(product.cantidad) + Number(item.cantidad);
          await queryRunner.manager.save(product);
        }
      }

      // 2. Clear old items
      await queryRunner.manager.delete(SaleItem, { id_venta: id });

      // 3. Process new items and calculate total
      let newTotal = 0;
      for (const newItem of updateDto.items) {
        newTotal += newItem.quantity * newItem.price;

        const product = await queryRunner.manager.findOne(Product, {
          where: { id_producto: newItem.productId }
        });
        if (!product) throw new BadRequestException(`Producto con ID ${newItem.productId} no existe.`);

        if (product.cantidad < newItem.quantity) {
          throw new BadRequestException(`Stock insuficiente para el producto ${product.nombre}. Stock actual: ${product.cantidad}`);
        }

        // Decrement quantity (stock)
        product.cantidad = Number(product.cantidad) - Number(newItem.quantity);
        await queryRunner.manager.save(product);

        const saleItem = queryRunner.manager.create(SaleItem, {
          id_venta: id,
          id_producto: newItem.productId,
          cantidad: newItem.quantity,
          precio: newItem.price,
          sub_total: newItem.quantity * newItem.price
        });
        await queryRunner.manager.save(saleItem);
      }

      // 4. Update sale header
      sale.customer = updateDto.customer;
      sale.total = newTotal;
      const updatedSale = await queryRunner.manager.save(sale);

      await queryRunner.commitTransaction();
      return updatedSale;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const sale = await queryRunner.manager.findOne(Sale, {
        where: { id },
        relations: ['items']
      });
      if (!sale) throw new BadRequestException(`Venta con ID ${id} no encontrada.`);

      // Restore stock
      for (const item of sale.items) {
        const product = await queryRunner.manager.findOne(Product, { where: { id_producto: item.id_producto } });
        if (product) {
          product.cantidad = Number(product.cantidad) + Number(item.cantidad);
          await queryRunner.manager.save(product);
        }
      }

      // Delete items and sale
      await queryRunner.manager.delete(SaleItem, { id_venta: id });
      await queryRunner.manager.delete(Sale, { id });

      await queryRunner.commitTransaction();
      return { success: true };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
