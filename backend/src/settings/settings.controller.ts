import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('settings/profile')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getProfile() {
    return this.settingsService.getProfile();
  }

  @Put()
  updateProfile(@Body() updateDto: any) {
    return this.settingsService.updateProfile(updateDto);
  }
}
