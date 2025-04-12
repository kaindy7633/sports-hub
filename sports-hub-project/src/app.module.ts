import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validate } from './config/env.validation';
import {
  databaseConfig,
  jwtConfig,
  appConfig,
  redisConfig,
  uploadConfig,
  securityConfig,
} from './config/configuration';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
