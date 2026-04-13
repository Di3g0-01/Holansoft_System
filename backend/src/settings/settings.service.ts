import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreProfile } from '../entities/store-profile.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(StoreProfile) private storeProfileRepository: Repository<StoreProfile>
  ) {
    this.seedProfile();
  }

  async seedProfile() {
    const profile = await this.storeProfileRepository.find();
    if (profile.length === 0) {
      await this.storeProfileRepository.save({
        name: 'HolanSoft',
        phone: '12345678',
        address: 'Ciudad, Guatemala',
        email: 'info@holansoft.com'
      });
    }
  }

  async getProfile() {
    const profiles = await this.storeProfileRepository.find();
    return profiles[0];
  }

  async updateProfile(id: number, updateDto: any) {
    const profile = await this.storeProfileRepository.findOne({ where: { id } });
    if (!profile) throw new NotFoundException('Profile not found');
    
    Object.assign(profile, updateDto);
    return this.storeProfileRepository.save(profile);
  }
}
