import { Module, Provider } from '@nestjs/common';
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
import { MockDatabricksRepository } from './infrastructure/adapters/persistence/databricks/MockDatabricksRepository';
import { MongoDbMockRepository } from './infrastructure/adapters/persistence/mongodb/MongoDbMockRepository';
import { MongoConnectionService } from './infrastructure/adapters/persistence/mongodb/MongoConnectionService';
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

/**
 * Three-layer fallback strategy:
 * 1. Databricks SQL Warehouse (live data)
 * 2. MongoDB pre-aggregated data (from CSV files via ingestion script)
 * 3. Static hardcoded mock data (last resort)
 */
const repositoryProvider: Provider = {
  provide: IStatsRepository,
  useFactory: async () => {
    const primarySource = process.env.PRIMARY_DATA_SOURCE || 'databricks';
    
    // Helper instantiators
    const tryDatabricks = async () => {
      const databricks = new DatabricksRepository();
      try {
        await databricks.onModuleInit();
        if (databricks.isConnected) {
          console.log('🔌🌐 Layer (Databricks): Using Databricks SQL Warehouse (live data)');
          return databricks;
        }
      } catch (e) {
        console.warn('⚠️ Databricks connection failed:', (e as Error).message);
      }
      return null;
    };

    const tryMongo = async () => {
      const mongoService = new MongoConnectionService();
      try {
        await mongoService.connect();
        if (mongoService.isConnected) {
          console.log('🔌🍃 Layer (MongoDB): Using MongoDB Mock Repository (pre-aggregated CSV data)');
          return new MongoDbMockRepository(mongoService);
        }
      } catch (e) {
        console.warn('⚠️ MongoDB connection failed:', (e as Error).message);
      }
      return null;
    };

    // Priority logic
    if (primarySource === 'mongodb') {
      console.log('🔄 PRIMARY_DATA_SOURCE is mongodb. Attempting MongoDB first...');
      const repo = await tryMongo();
      if (repo) return repo;
      
      console.log('⚠️ MongoDB failed, falling back to Databricks...');
      const fallbackRepo = await tryDatabricks();
      if (fallbackRepo) return fallbackRepo;
    } else {
      console.log('🔄 PRIMARY_DATA_SOURCE is databricks (or default). Attempting Databricks first...');
      const repo = await tryDatabricks();
      if (repo) return repo;
      
      console.log('⚠️ Databricks failed, falling back to MongoDB...');
      const fallbackRepo = await tryMongo();
      if (fallbackRepo) return fallbackRepo;
    }

    // Static fallback
    console.log('📦⚠️ Layer 3: Using Static MockDatabricksRepository (hardcoded fallback)');
    return new MockDatabricksRepository();
  },
};

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
    // Repository binding with automatic fallback
    repositoryProvider,
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
    // MongoDB connection service (also registered for DI)
    MongoConnectionService,
    MongoDbMockRepository,
  ],
})
export class AppModule {
  constructor() {
    // Log the startup mode
    const mode = process.env.NODE_ENV || 'development';
    console.log(`🚀 RetailSense Backend starting in ${mode} mode`);
  }
}