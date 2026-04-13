import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {
    this.seedAdmin();
  }

  async seedAdmin() {
    const admin = await this.usersRepository.findOne({ where: { username: 'admin' } });
    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await this.usersRepository.save({
        name: 'Administrador',
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
      });
    }
  }

  async login(loginDto: any) {
    console.log(`Login attempt for user: ${loginDto.username}`);
    const user = await this.usersRepository.findOne({ where: { username: loginDto.username } });
    if (!user) {
      console.log(`User not found: ${loginDto.username}`);
      throw new UnauthorizedException('Usuario no encontrado');
    }
    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    console.log(`Password match for ${loginDto.username}: ${isMatch}`);
    if (isMatch) {
      const payload = { username: user.username, sub: user.id, role: user.role };
      return {
        access_token: this.jwtService.sign(payload),
        user: { id: user.id, name: user.name, username: user.username, role: user.role },
      };
    }
    throw new UnauthorizedException('Contraseña incorrecta');
  }
}
