import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PurchaseItem } from './purchase-item.entity';

@Entity('providers')
export class Provider {
  @PrimaryGeneratedColumn({ name: 'id_proveedor' })
  id: number;

  @Column({ name: 'nombre' })
  name: string;

  @OneToMany(() => PurchaseItem, item => item.provider)
  purchaseItems: PurchaseItem[];
}
