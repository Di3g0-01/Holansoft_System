import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { PurchaseItem } from './purchase-item.entity';

@Entity('purchases')
export class Purchase {
  @PrimaryGeneratedColumn({ name: 'Id_compra' })
  id: number;

  @Column({ unique: true, name: 'Numero_Orden' })
  poNumber: string;

  @Column({ name: 'Proveedor' })
  provider: string;

  @Column({ name: 'Fecha' })
  date: Date;

  @Column('decimal', { precision: 12, scale: 2, name: 'Total' })
  total: number;

  @OneToMany(() => PurchaseItem, item => item.purchase, { cascade: true })
  items: PurchaseItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
