import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  findAll(search?: string) {
    if (search) {
      return this.productsRepository.createQueryBuilder('product')
        .leftJoinAndSelect('product.category', 'category')
        .where('product.nombre LIKE :search OR product.code LIKE :search', { search: `%${search}%` })
        .getMany();
    }
    return this.productsRepository.find({ relations: ['category'] });
  }

  async findOne(id: number) {
    const product = await this.productsRepository.findOne({ 
      where: { id_producto: id }, 
      relations: ['category'] 
    });
    if (!product) throw new NotFoundException(`Producto #${id} no encontrado`);
    return product;
  }

  create(createDto: any) {
    const product = this.productsRepository.create(createDto);
    return this.productsRepository.save(product);
  }

  async update(id: number, updateDto: any) {
    const product = await this.findOne(id);
    Object.assign(product, updateDto);
    return this.productsRepository.save(product);
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    return this.productsRepository.remove(product);
  }

  getLowStock() {
    return this.productsRepository.createQueryBuilder('product')
      .where('product.cantidad <= product.alerta_cantidad')
      .leftJoinAndSelect('product.category', 'category')
      .getMany();
  }
}
