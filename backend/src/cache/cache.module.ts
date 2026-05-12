import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: 300,
    }),
  ],
  exports: [CacheModule],
})
export class CacheConfigModule {}