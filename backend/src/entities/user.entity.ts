import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ name: 'id_usuario' })
  id: number;

  @Column({ name: 'nombre' })
  name: string;

  @Column({ unique: true })
  username: string;

  @Column({ name: 'contraseña' })
  password: string;

  @Column({ default: 'user', name: 'rol' })
  role: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
