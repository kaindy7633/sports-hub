import { Controller, Get } from '@nestjs/common';
import { PingService } from './ping.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('ping')
@Controller()
export class PingController {
  constructor(private readonly pingService: PingService) {}

  @Get('ping')
  @ApiOperation({ summary: '健康检查接口' })
  @ApiResponse({ status: 200, description: '返回服务器状态信息' })
  getPing(): string {
    return this.pingService.getPing();
  }
}
