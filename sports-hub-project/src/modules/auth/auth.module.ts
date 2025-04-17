// src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { TokenModule } from '../../core/token/token.module';
import { CacheModule } from '../../core/cache/cache.module';
import { SnowflakeModule } from '../../core/snowflake/snowflake.module'; // 添加这行

@Module({
  imports: [
    UsersModule,
    TokenModule,
    CacheModule,
    SnowflakeModule, // 添加这行
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
