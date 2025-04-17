import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ManagersService } from './managers.service';
import { CreateManagerDto } from './dto/create-manager.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';
import { Manager } from './entities/manager.entity';
import { JwtAuthGuard } from '../../core/token/jwt-auth.guard';
import { RoleGuard, Roles } from '../../core/token/role.guard';

@ApiTags('managers')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('admin')
@Controller('managers')
export class ManagersController {
  constructor(private readonly managersService: ManagersService) {}

  @Post()
  @ApiOperation({ summary: '创建管理员' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '创建成功',
    type: Manager,
  })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: '账号已存在' })
  async create(@Body() createManagerDto: CreateManagerDto): Promise<Manager> {
    // 确保 createManagerDto 字段与 Manager 实体一致
    return this.managersService.create(createManagerDto);
  }

  @Get()
  @ApiOperation({ summary: '获取所有管理员' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取成功',
    type: [Manager],
  })
  async findAll(): Promise<Manager[]> {
    return this.managersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取管理员' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取成功',
    type: Manager,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '管理员不存在' })
  async findOne(@Param('id') id: string): Promise<Manager> {
    // 确保 id 类型与 Manager 实体主键一致
    return this.managersService.findOne(BigInt(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新管理员信息' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '更新成功',
    type: Manager,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '管理员不存在' })
  async update(
    @Param('id') id: string,
    @Body() updateManagerDto: UpdateManagerDto,
  ): Promise<Manager> {
    // 确保 updateManagerDto 字段与 Manager 实体一致
    return this.managersService.update(BigInt(id), updateManagerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除管理员' })
  @ApiResponse({ status: HttpStatus.OK, description: '删除成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '管理员不存在' })
  async remove(@Param('id') id: string): Promise<void> {
    // 确保 id 类型与 Manager 实体主键一致
    return this.managersService.remove(BigInt(id));
  }
}
