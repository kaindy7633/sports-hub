import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';
import { UserRoleDto, BatchAssignRoleDto } from './dto/assign-role.dto';
import {
  RoleResponseDto,
  PaginatedRoleResponseDto,
} from './dto/role-response.dto';
import { JwtAuthGuard } from '../../core/token/jwt-auth.guard';

@ApiTags('roles')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: '创建新角色' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '角色创建成功',
    type: RoleResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '请求参数无效' })
  async create(@Body() createRoleDto: CreateRoleDto) {
    return await this.rolesService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: '分页查询角色列表' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '返回角色列表',
    type: PaginatedRoleResponseDto,
  })
  async findAll(@Query() query: QueryRoleDto) {
    return await this.rolesService.findAll(query);
  }

  @Get('all')
  @ApiOperation({ summary: '获取所有角色（不分页）' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '返回所有角色列表',
    type: [RoleResponseDto],
  })
  async findAllRoles() {
    return await this.rolesService.findAllRoles();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取角色详情' })
  @ApiParam({ name: 'id', description: '角色ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '返回角色详情',
    type: RoleResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '角色不存在' })
  async findOne(@Param('id') id: string) {
    return await this.rolesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新角色信息' })
  @ApiParam({ name: 'id', description: '角色ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '角色更新成功',
    type: RoleResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '角色不存在' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '请求参数无效' })
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return await this.rolesService.update(+id, updateRoleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除角色' })
  @ApiParam({ name: 'id', description: '角色ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: '角色删除成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '角色不存在' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '角色已分配给用户，无法删除',
  })
  async remove(@Param('id') id: string) {
    await this.rolesService.remove(+id);
  }

  @Post('assign/:userId')
  @ApiOperation({ summary: '给用户分配角色' })
  @ApiParam({ name: 'userId', description: '用户ID' })
  @ApiResponse({ status: HttpStatus.OK, description: '角色分配成功' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '用户或角色不存在',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '请求参数无效' })
  async assignRoles(
    @Param('userId') userId: string,
    @Body('roleIds') roleIds: number[],
  ) {
    await this.rolesService.assignRolesToUser(+userId, roleIds);
    return { message: '角色分配成功' };
  }

  @Post('batch-assign')
  @ApiOperation({ summary: '批量分配用户角色' })
  @ApiResponse({ status: HttpStatus.OK, description: '批量角色分配成功' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '请求参数无效' })
  async batchAssignRoles(@Body() batchAssignRoleDto: BatchAssignRoleDto) {
    await this.rolesService.batchAssignRoles(batchAssignRoleDto);
    return { message: '批量角色分配成功' };
  }

  @Get('user/:userId')
  @ApiOperation({ summary: '获取用户的角色列表' })
  @ApiParam({ name: 'userId', description: '用户ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '返回用户的角色列表',
    type: [RoleResponseDto],
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '用户不存在' })
  async getUserRoles(@Param('userId') userId: string) {
    return await this.rolesService.findUserRoles(+userId);
  }
}
