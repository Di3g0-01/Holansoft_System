import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Sale } from './sale.entity';
import { Product } from './product.entity';
import { Client } from './client.entity';

@Entity('sale_items')
export class SaleItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'id_venta' })
  id_venta: number;

  @ManyToOne(() => Sale, sale => sale.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_venta' })
  sale: Sale;

  @Column({ name: 'id_producto' })
  id_producto: number;

  @ManyToOne(() => Product, product => product.saleItems)
  @JoinColumn({ name: 'id_producto' })
  product: Product;

  @Column({ nullable: true, name: 'id_cliente' })
  id_cliente: number;

  @ManyToOne(() => Client, client => client.saleItems)
  @JoinColumn({ name: 'id_cliente' })
  client: Client;

  @Column({ name: 'cantidad' })
  cantidad: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'precio' })
  precio: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'sub_total' })
  sub_total: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
