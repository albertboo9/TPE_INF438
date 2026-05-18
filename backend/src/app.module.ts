import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

// Core domain
import { GlobalStatsUseCase, TemporalStatsUseCase, CategoryStatsUseCase, StoreStatsUseCase } from './core/domain/ports/in/IStatsUseCase';
import { IStatsRepository } from './core/domain/ports/out/IStatsRepository';

// Application use cases
import { GetGlobalStatsUseCaseImpl } from './application/use-cases/GetGlobalStatsUseCase';
import { GetTemporalStatsUseCaseImpl } from './application/use-cases/GetTemporalStatsUseCase';
import { GetCategoryStatsUseCaseImpl } from './application/use-cases/GetCategoryStatsUseCase';
import { GetStoreStatsUseCaseImpl } from './application/use-cases/GetStoreStatsUseCase';
import { AuthService } from './application/use-cases/AuthService';

// Infrastructure
import { DatabricksRepository } from './infrastructure/adapters/persistence/databricks/DatabricksRepository';
import { JwtStrategy } from './infrastructure/adapters/security/JwtStrategy';
import { CacheConfigModule } from './cache/cache.module';

// Presentation - Controllers
import { StatsController } from './presentation/controllers/StatsController';
import { AuthController } from './presentation/controllers/AuthController';
import { AdminController } from './presentation/controllers/AdminController';
import { PredictionController } from './presentation/controllers/PredictionController';
import { AnalyticsController } from './presentation/controllers/AnalyticsController';

// Presentation - Filters & Interceptors
import { GlobalExceptionFilter } from './presentation/filters/GlobalExceptionFilter';
import { ResponseInterceptor } from './presentation/interceptors/ResponseInterceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-key-change-in-production',
      signOptions: { expiresIn: '15m' },
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    CacheConfigModule,
  ],
  controllers: [
    StatsController,
    AuthController,
    AdminController,
    PredictionController,
    AnalyticsController,
  ],
  providers: [
    // Repository binding
    { provide: IStatsRepository, useClass: DatabricksRepository },
    // Use case bindings
    { provide: GlobalStatsUseCase, useClass: GetGlobalStatsUseCaseImpl },
    { provide: TemporalStatsUseCase, useClass: GetTemporalStatsUseCaseImpl },
    { provide: CategoryStatsUseCase, useClass: GetCategoryStatsUseCaseImpl },
    { provide: StoreStatsUseCase, useClass: GetStoreStatsUseCaseImpl },
    // Global guards, filters, interceptors
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    // Infrastructure
    JwtStrategy,
    AuthService,
  ],
})
export class AppModule {}