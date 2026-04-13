import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Purchase } from './purchase.entity';
import { Product } from './product.entity';
import { Provider } from './provider.entity';

@Entity('purchase_items')
export class PurchaseItem {
  @PrimaryGeneratedColumn({ name: 'id_Detalle_compra' })
  id: number;

  @Column({ name: 'id_compra' })
  id_compra: number;

  @ManyToOne(() => Purchase, purchase => purchase.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_compra' })
  purchase: Purchase;

  @Column({ name: 'id_producto' })
  id_producto: number;

  @ManyToOne(() => Product, product => product.purchaseItems)
  @JoinColumn({ name: 'id_producto' })
  product: Product;

  @Column({ nullable: true, name: 'id_proveedor' })
  id_proveedor: number;

  @ManyToOne(() => Provider, provider => provider.purchaseItems)
  @JoinColumn({ name: 'id_proveedor' })
  provider: Provider;

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
