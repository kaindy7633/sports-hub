// src/modules/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserAuth } from './entities/user-auth.entity';
import { Role } from '../roles/entities/role.entity';
import { UserRole } from './entities/user-role.entity';
import { SnowflakeModule } from '../../core/snowflake/snowflake.module'; // 添加这行

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserAuth, Role, UserRole]),
    SnowflakeModule, // 添加这行
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
