import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { SaleItem } from './sale-item.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn({ name: 'id_cliente' })
  id: number;

  @Column({ name: 'nombre' })
  name: string;

  @OneToMany(() => SaleItem, item => item.client)
  saleItems: SaleItem[];
}
