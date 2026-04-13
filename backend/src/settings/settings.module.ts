import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreProfile } from '../entities/store-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StoreProfile])],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
