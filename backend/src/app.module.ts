import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabricksModule } from './databricks/databricks.module';
import { CacheConfigModule } from './cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabricksModule,
    CacheConfigModule,
  ],
})
export class AppModule {}