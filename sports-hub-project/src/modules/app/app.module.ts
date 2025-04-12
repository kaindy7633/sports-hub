import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CoreModule } from '../../core/core.module';
import { SharedModule } from '../../shared/shared.module';
import { TeamsModule } from '../../modules/teams/teams.module';
import { AppModule as AppModuleNew } from '../../modules/app/app.module';
import { validate } from '../../config/env.validation';
import {
  databaseConfig,
  jwtConfig,
  appConfig,
  redisConfig,
  uploadConfig,
  securityConfig,
} from '../../config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `src/config/.env.${process.env.NODE_ENV || 'development'}`,
      load: [
        databaseConfig,
        jwtConfig,
        appConfig,
        redisConfig,
        uploadConfig,
        securityConfig,
      ],
      validate,
      isGlobal: true,
    }),
    CoreModule,
    SharedModule,
    TeamsModule,
    AppModuleNew,
  ],
})
export class AppModule {}
