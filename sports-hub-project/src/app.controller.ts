import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

@Controller()
@UseInterceptors(TransformInterceptor)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('ping')
  getPing(): string {
    return 'pong';
  }
}
