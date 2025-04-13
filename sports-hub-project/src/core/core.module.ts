// src/core/core.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { createTypeOrmOptions } from './database/database.config';
import { MiddlewareModule } from './middleware/middleware.module';
import { TokenModule } from './token/token.module';
import { CacheModule } from './cache/cache.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: createTypeOrmOptions,
    }),
    MiddlewareModule,
    TokenModule,
    RedisModule.forRoot(),
    CacheModule,
  ],
  exports: [MiddlewareModule, TokenModule, CacheModule, RedisModule],
})
export class CoreModule {}
