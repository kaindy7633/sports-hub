import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { createTypeOrmOptions } from './database/database.config';
import { MiddlewareModule } from './middleware/middleware.module';
import { TokenModule } from './token/token.module';
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: createTypeOrmOptions,
    }),
    MiddlewareModule,
    TokenModule,
    CacheModule,
  ],
  exports: [MiddlewareModule, TokenModule, CacheModule],
})
export class CoreModule {}
