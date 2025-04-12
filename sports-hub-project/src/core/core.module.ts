import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { createTypeOrmOptions } from './database/database.config';
import { MiddlewareModule } from './middleware/middleware.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: createTypeOrmOptions,
    }),
    MiddlewareModule,
  ],
  exports: [MiddlewareModule],
})
export class CoreModule {}
