import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>
  ) {}

  findAll() {
    return this.usersRepository.find({ select: ['id', 'name', 'username', 'role', 'createdAt'] });
  }

  async create(createDto: any) {
    if (createDto.password) {
      createDto.password = await bcrypt.hash(createDto.password, 10);
    }
    const user = this.usersRepository.create(createDto as User);
    const saved = await this.usersRepository.save(user);
    const { password, ...result } = saved;
    return result;
  }

  async update(id: number, updateDto: any) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    
    if (updateDto.password) {
      updateDto.password = await bcrypt.hash(updateDto.password, 10);
    }
    Object.assign(user, updateDto);
    const saved = await this.usersRepository.save(user);
    const { password, ...result } = saved;
    return result;
  }

  async remove(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.usersRepository.remove(user);
  }
}
