import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManagersService } from './managers.service';
import { ManagersController } from './managers.controller';
import { Manager } from './entities/manager.entity';
import { CoreModule } from '../../core/core.module';

@Module({
  imports: [TypeOrmModule.forFeature([Manager]), CoreModule],
  controllers: [ManagersController],
  providers: [ManagersService],
  exports: [ManagersService],
})
export class ManagersModule {}
