import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { SaleItem } from './sale-item.entity';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn({ name: 'Id_venta' })
  id: number;

  @Column({ unique: true, name: 'Numero_RP' })
  rpNumber: string;

  @Column({ name: 'Cliente' })
  customer: string;

  @Column({ name: 'Fecha' })
  date: Date;

  @Column('decimal', { precision: 12, scale: 2, name: 'Total' })
  total: number;

  @Column({ nullable: true, name: 'id_usuario' })
  id_usuario: number;

  @OneToMany(() => SaleItem, item => item.sale, { cascade: true })
  items: SaleItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
