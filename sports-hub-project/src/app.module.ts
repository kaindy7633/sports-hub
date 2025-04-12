import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { TeamsModule } from './modules/teams/teams.module';
import { PingModule } from './modules/ping/ping.module';
import { validate } from './config/env.validation';
import { LoggingMiddleware } from './core/middleware/logging.middleware';
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
    CoreModule,
    SharedModule,
    TeamsModule,
    PingModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggingMiddleware)
      .exclude(
        { path: 'ping', method: RequestMethod.ALL }, // 排除健康检查端点
        { path: 'health', method: RequestMethod.ALL },
      )
      .forRoutes('*'); // 应用到所有其他路由
  }
}
