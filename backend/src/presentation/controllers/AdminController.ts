import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthService } from '../../application/use-cases/AuthService';
import { JwtAuthGuard } from '../../infrastructure/adapters/security/JwtAuthGuard';
import { UserRole } from '../../core/domain/entities/User.entity';
import { IsEmail, IsString, IsEnum } from 'class-validator';

export class UpdateRoleDto {
  @IsEmail() email!: string;
  @IsEnum(UserRole) role!: UserRole;
}

export class ToggleUserDto {
  @IsEmail() email!: string;
}

export class DeleteUserDto {
  @IsEmail() email!: string;
}

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly authService: AuthService) {}

  @Get('users')
  async listUsers(@Req() req: any) {
    return this.authService.listUsers(req.user.email);
  }

  @Post('users/role')
  async updateRole(@Req() req: any, @Body() dto: UpdateRoleDto) {
    return this.authService.updateUserRole(req.user.email, dto.email, dto.role);
  }

  @Post('users/toggle')
  async toggleUser(@Req() req: any, @Body() dto: ToggleUserDto) {
    return this.authService.toggleUserStatus(req.user.email, dto.email);
  }

  @Post('users/delete')
  async deleteUser(@Req() req: any, @Body() dto: DeleteUserDto) {
    return this.authService.deleteUser(req.user.email, dto.email);
  }

  @Get('stats')
  async adminStats() {
    return {
      totalUsers: 0, // Will be populated dynamically
      activeSessions: 0,
      apiCallsToday: 0,
      systemUptime: process.uptime(),
    };
  }
}