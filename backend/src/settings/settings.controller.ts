import { Controller, Get, Patch, Body, UseGuards, HttpCode } from '@nestjs/common';
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

  @Patch('profile')
  @HttpCode(200)
  updateProfile(@Body() updateDto: any) {
    console.log('[SettingsController] Updating profile:', updateDto);
    return this.settingsService.updateProfile(updateDto);
  }
}


