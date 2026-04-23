import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Category } from './category.entity';
import { PurchaseItem } from './purchase-item.entity';
import { SaleItem } from './sale-item.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn({ name: 'id_producto' })
  id_producto: number;

  @Column({ unique: true })
  code: string;

  @Column({ name: 'nombre' })
  nombre: string;

  @Column({ nullable: true, name: 'id_categoria' })
  id_categoria: number;

  @Column({ nullable: true, name: 'marca' })
  marca: string;

  @Column({ nullable: true, name: 'tamano' })
  tamano: string;

  @Column({ nullable: true, name: 'tipo' })
  tipo: string;

  @ManyToOne(() => Category, category => category.products)
  @JoinColumn({ name: 'id_categoria' })
  category: Category;

  @Column('decimal', { precision: 10, scale: 2, name: 'precio_costo', default: 0 })
  precio_costo: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'precio_unidad' })
  precio_unidad: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'precio_docena' })
  precio_docena: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'precio_mayoreo' })
  precio_mayoreo: number;

  @Column({ default: 0, name: 'cantidad' })
  cantidad: number;

  @Column({ default: 5, name: 'alerta_cantidad' })
  alerta_cantidad: number;

  @OneToMany(() => PurchaseItem, purchaseItem => purchaseItem.product)
  purchaseItems: PurchaseItem[];

  @OneToMany(() => SaleItem, saleItem => saleItem.product)
  saleItems: SaleItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
