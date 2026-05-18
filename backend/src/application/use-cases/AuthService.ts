import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserEntity, UserRole } from '../../core/domain/entities/User.entity';

// In-memory user store for production (replace with DB in real deployment)
const USERS: Map<string, UserEntity & { refreshToken?: string }> = new Map();

// Seed admin on startup
const seedAdmin = async () => {
  const hash = await bcrypt.hash('admin123', 12);
  const admin = UserEntity.create('admin@retailsense.ai', hash, 'Super Admin', UserRole.ADMIN);
  USERS.set(admin.email, admin as any);
  console.log('✅ Admin account seeded: admin@retailsense.ai / admin123');
};
seedAdmin();

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly jwtService: JwtService) {}

  async register(email: string, password: string, name: string) {
    if (USERS.has(email)) {
      throw new ConflictException('Email already registered');
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = UserEntity.create(email, passwordHash, name, UserRole.VIEWER);
    USERS.set(email, user as any);
    return user.toSafeJSON();
  }

  async login(email: string, password: string) {
    const user = USERS.get(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive) throw new UnauthorizedException('Account disabled');

    // Update last login
    (user as any).lastLogin = new Date();

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    (user as any).refreshToken = refreshToken;

    return {
      accessToken,
      refreshToken,
      user: user.toSafeJSON(),
    };
  }

  async refresh(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken) as any;
      const user = USERS.get(decoded.email);
      if (!user || (user as any).refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      const payload = { sub: user.id, email: user.email, role: user.role };
      const newAccessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
      return { accessToken: newAccessToken };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async getProfile(email: string) {
    const user = USERS.get(email);
    if (!user) throw new UnauthorizedException('User not found');
    return user.toSafeJSON();
  }

  async listUsers(adminEmail: string) {
    const admin = USERS.get(adminEmail);
    if (!admin || admin.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Admin access required');
    }
    return Array.from(USERS.values()).map(u => u.toSafeJSON());
  }

  async updateUserRole(adminEmail: string, targetEmail: string, role: UserRole) {
    const admin = USERS.get(adminEmail);
    if (!admin || admin.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Admin access required');
    }
    const user = USERS.get(targetEmail);
    if (!user) throw new UnauthorizedException('User not found');
    (user as any).role = role;
    (user as any).updatedAt = new Date();
    return user.toSafeJSON();
  }

  async toggleUserStatus(adminEmail: string, targetEmail: string) {
    const admin = USERS.get(adminEmail);
    if (!admin || admin.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Admin access required');
    }
    const user = USERS.get(targetEmail);
    if (!user) throw new UnauthorizedException('User not found');
    (user as any).isActive = !user.isActive;
    (user as any).updatedAt = new Date();
    return user.toSafeJSON();
  }

  async deleteUser(adminEmail: string, targetEmail: string) {
    const admin = USERS.get(adminEmail);
    if (!admin || admin.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Admin access required');
    }
    if (targetEmail === adminEmail) {
      throw new UnauthorizedException('Cannot delete yourself');
    }
    USERS.delete(targetEmail);
    return { message: 'User deleted successfully' };
  }
}