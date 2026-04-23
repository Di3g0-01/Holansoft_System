import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../entities/client.entity';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
  ) {}

  findAll() {
    return this.clientsRepository.find({ order: { name: 'ASC' } });
  }

  create(name: string) {
    const client = this.clientsRepository.create({ name });
    return this.clientsRepository.save(client);
  }
}
