import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('profile')
  getProfile() {
    return this.settingsService.getProfile();
  }

  @Put('profile')
  updateProfile(@Body() updateDto: any) {
    return this.settingsService.updateProfile(updateDto);
  }
}

