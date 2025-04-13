import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: '创建新用户' })
  @ApiResponse({ status: 201, description: '用户创建成功' })
  @ApiResponse({ status: 400, description: '无效的请求数据' })
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: '获取所有用户' })
  @ApiResponse({ status: 200, description: '返回所有用户列表' })
  async findAll() {
    return await this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取用户' })
  @ApiResponse({ status: 200, description: '返回指定用户' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async findOne(@Param('id') id: string) {
    return await this.usersService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新用户信息' })
  @ApiResponse({ status: 200, description: '用户更新成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  @ApiResponse({ status: 200, description: '用户删除成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async remove(@Param('id') id: string) {
    return await this.usersService.remove(+id);
  }

  @Post('auth')
  @ApiOperation({ summary: '添加用户认证信息' })
  @ApiResponse({ status: 201, description: '认证信息添加成功' })
  @ApiResponse({ status: 400, description: '无效的请求数据' })
  async addAuth(
    @Body()
    authData: {
      userId: number;
      identityType: string;
      identifier: string;
      credential: string;
    },
  ) {
    return await this.usersService.addUserAuth(authData);
  }

  @Get('by-username/:username')
  async findByUsername(@Param('username') username: string) {
    return await this.usersService.findByUsername(username);
  }

  @Get('by-phone/:phone')
  async findByPhone(@Param('phone') phone: string) {
    return await this.usersService.findByPhone(phone);
  }

  @Get('by-email/:email')
  async findByEmail(@Param('email') email: string) {
    return await this.usersService.findByEmail(email);
  }
}
