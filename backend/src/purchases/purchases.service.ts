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
}
