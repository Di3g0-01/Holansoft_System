import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreProfile } from '../entities/store-profile.entity';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    @InjectRepository(StoreProfile) private storeProfileRepository: Repository<StoreProfile>
  ) {}

  async onModuleInit() {
    await this.ensureProfileExists();
  }

  private async ensureProfileExists() {
    try {
      const count = await this.storeProfileRepository.count();
      if (count === 0) {
        await this.storeProfileRepository.save({
          name: 'HolanSoft',
          phone: '12345678',
          address: 'Ciudad, Guatemala',
          email: 'info@holansoft.com'
        });
      }
    } catch (error) {
      console.error('[SettingsService] Error seeding profile:', error);
    }
  }

  async getProfile() {
    let profile = await this.storeProfileRepository.findOne({ where: {} });
    if (!profile) {
      profile = await this.storeProfileRepository.save({
        name: 'HolanSoft',
        phone: '12345678',
        address: 'Ciudad, Guatemala',
        email: 'info@holansoft.com'
      });
    }
    return profile;
  }

  async updateProfile(updateDto: any) {
    const profile = await this.getProfile();
    Object.assign(profile, updateDto);
    return this.storeProfileRepository.save(profile);
  }
}

