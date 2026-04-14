import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Purchase } from '../entities/purchase.entity';
import { Product } from '../entities/product.entity';
import { PurchaseItem } from '../entities/purchase-item.entity';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(Purchase) private purchasesRepository: Repository<Purchase>,
    private dataSource: DataSource
  ) {}

  findAll() {
    return this.purchasesRepository.find({ relations: ['items', 'items.product', 'items.product.category'] });
  }

  async create(createDto: { 
    poNumber: string; 
    provider: string; 
    date: string; 
    items: { 
      productId: number; 
      quantity: number; 
      cost: number;
      precio_unidad?: number;
      precio_docena?: number;
      precio_mayoreo?: number;
    }[] 
  }) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      let total = 0;
      for (const item of createDto.items) {
        const quantity = Number(item.quantity) || 0;
        const cost = Number(item.cost) || 0;
        total += quantity * cost;
      }

      const purchase = queryRunner.manager.create(Purchase, {
        poNumber: createDto.poNumber,
        provider: createDto.provider,
        date: new Date(createDto.date),
        total,
      });

      const savedPurchase = await queryRunner.manager.save(purchase);

      for (const item of createDto.items) {
        const product = await queryRunner.manager.findOne(Product, { 
          where: { id_producto: item.productId } 
        });
        if (!product) throw new BadRequestException(`Producto con ID ${item.productId} no existe.`);

        // Increment quantity (stock)
        product.cantidad = Number(product.cantidad) + Number(item.quantity);

        // Update selling prices if provided
        if (item.precio_unidad !== undefined) product.precio_unidad = Number(item.precio_unidad);
        if (item.precio_docena !== undefined) product.precio_docena = Number(item.precio_docena);
        if (item.precio_mayoreo !== undefined) product.precio_mayoreo = Number(item.precio_mayoreo);

        await queryRunner.manager.save(product);

        const purchaseItem = queryRunner.manager.create(PurchaseItem, {
          id_compra: savedPurchase.id,
          id_producto: item.productId,
          cantidad: item.quantity,
          precio: item.cost,
          sub_total: item.quantity * item.cost
        });
        await queryRunner.manager.save(purchaseItem);
      }

      await queryRunner.commitTransaction();
      return savedPurchase;
    } catch (err) {
      console.error('SERVER ERROR DURING PURCHASE CREATE:', err);
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, updateDto: { provider: string; date: string; items: { productId: number; quantity: number; cost: number; precio_unidad?: number; precio_docena?: number; precio_mayoreo?: number }[] }) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const purchase = await queryRunner.manager.findOne(Purchase, {
        where: { id },
        relations: ['items']
      });
      if (!purchase) throw new BadRequestException(`Compra con ID ${id} no encontrada.`);

      // 1. Revert old stock (Decrement)
      for (const item of purchase.items) {
        const product = await queryRunner.manager.findOne(Product, { where: { id_producto: item.id_producto } });
        if (product) {
          product.cantidad = Number(product.cantidad) - Number(item.cantidad);
          await queryRunner.manager.save(product);
        }
      }

      // 2. Clear old items
      await queryRunner.manager.delete(PurchaseItem, { id_compra: id });

      // 3. Process new items and calculate total
      let newTotal = 0;
      for (const newItem of updateDto.items) {
        newTotal += newItem.quantity * newItem.cost;

        const product = await queryRunner.manager.findOne(Product, {
          where: { id_producto: newItem.productId }
        });
        if (!product) throw new BadRequestException(`Producto con ID ${newItem.productId} no existe.`);

        // Increment stock
        product.cantidad = Number(product.cantidad) + Number(newItem.quantity);
        
        // Update selling prices if provided
        if (newItem.precio_unidad !== undefined) product.precio_unidad = Number(newItem.precio_unidad);
        if (newItem.precio_docena !== undefined) product.precio_docena = Number(newItem.precio_docena);
        if (newItem.precio_mayoreo !== undefined) product.precio_mayoreo = Number(newItem.precio_mayoreo);

        await queryRunner.manager.save(product);

        const purchaseItem = queryRunner.manager.create(PurchaseItem, {
          id_compra: id,
          id_producto: newItem.productId,
          cantidad: newItem.quantity,
          precio: newItem.cost,
          sub_total: newItem.quantity * newItem.cost
        });
        await queryRunner.manager.save(purchaseItem);
      }

      // 4. Update purchase header
      purchase.provider = updateDto.provider;
      purchase.date = new Date(updateDto.date);
      purchase.total = newTotal;
      const updatedPurchase = await queryRunner.manager.save(purchase);

      await queryRunner.commitTransaction();
      return updatedPurchase;
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
      const purchase = await queryRunner.manager.findOne(Purchase, {
        where: { id },
        relations: ['items']
      });
      if (!purchase) throw new BadRequestException(`Compra con ID ${id} no encontrada.`);

      // Decrement stock
      for (const item of purchase.items) {
        const product = await queryRunner.manager.findOne(Product, { where: { id_producto: item.id_producto } });
        if (product) {
          product.cantidad = Number(product.cantidad) - Number(item.cantidad);
          // Optional: Check if stock goes negative and warn? 
          // For now, allow it to reflect reality (maybe stock was sold already).
          await queryRunner.manager.save(product);
        }
      }

      // Delete items and purchase
      await queryRunner.manager.delete(PurchaseItem, { id_compra: id });
      await queryRunner.manager.delete(Purchase, { id });

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
