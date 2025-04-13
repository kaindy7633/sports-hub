import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Role } from './entities/role.entity';
import { UserRole } from '../users/entities/user-role.entity';
import { User } from '../users/entities/user.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';
import { UserRoleDto, BatchAssignRoleDto } from './dto/assign-role.dto';
import { DatabaseException } from '../../common/exceptions/database.exception';
import { ResourceNotFoundException } from '../../common/exceptions/resource-not-found.exception';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  /**
   * 创建角色
   * @param createRoleDto 角色创建数据
   * @returns 创建的角色对象
   */
  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    try {
      // 检查角色编码是否已存在
      const existingRole = await this.roleRepository.findOne({
        where: { code: createRoleDto.code },
      });

      if (existingRole) {
        throw new BadRequestException(
          `角色编码 "${createRoleDto.code}" 已存在`,
        );
      }

      // 创建角色
      const role = this.roleRepository.create(createRoleDto);
      return await this.roleRepository.save(role);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`创建角色失败: ${error.message}`, error.stack);
      throw new DatabaseException('创建', '角色', error);
    }
  }

  /**
   * 分页查询角色列表
   * @param queryParams 查询参数
   * @returns 分页角色列表
   */
  async findAll(queryParams: QueryRoleDto = {}) {
    try {
      const { name, code, status, pageNum = 1, pageSize = 10 } = queryParams;
      const skip = (pageNum - 1) * pageSize;

      // 构建查询条件
      const whereConditions: any = {};
      if (name) {
        whereConditions.name = name;
      }
      if (code) {
        whereConditions.code = code;
      }
      if (status !== undefined) {
        whereConditions.status = status;
      }

      // 查询总数
      const total = await this.roleRepository.count({
        where: whereConditions,
      });

      // 查询数据
      const roles = await this.roleRepository.find({
        where: whereConditions,
        skip,
        take: pageSize,
        order: {
          created_at: 'DESC',
        },
      });

      return {
        list: roles,
        total,
        pageNum,
        pageSize,
      };
    } catch (error) {
      this.logger.error(`查询角色列表失败: ${error.message}`, error.stack);
      throw new DatabaseException('查询', '角色列表', error);
    }
  }

  /**
   * 获取所有角色（不分页）
   * @returns 角色列表
   */
  async findAllRoles(): Promise<Role[]> {
    try {
      return await this.roleRepository.find({
        where: { status: 1 }, // 只返回启用的角色
        order: {
          created_at: 'DESC',
        },
      });
    } catch (error) {
      this.logger.error(`获取所有角色失败: ${error.message}`, error.stack);
      throw new DatabaseException('查询', '所有角色', error);
    }
  }

  /**
   * 根据ID查询角色
   * @param id 角色ID
   * @returns 角色对象
   */
  async findOne(id: number): Promise<Role> {
    try {
      const role = await this.roleRepository.findOne({
        where: { id: BigInt(id) },
        relations: ['userRoles'],
      });

      if (!role) {
        throw new ResourceNotFoundException('角色', id);
      }

      return role;
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      this.logger.error(`查询角色详情失败: ${error.message}`, error.stack);
      throw new DatabaseException('查询', '角色详情', error);
    }
  }

  /**
   * 更新角色
   * @param id 角色ID
   * @param updateRoleDto 更新数据
   * @returns 更新后的角色
   */
  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 查询要更新的角色是否存在
      const role = await this.roleRepository.findOne({
        where: { id: BigInt(id) },
      });

      if (!role) {
        throw new ResourceNotFoundException('角色', id);
      }

      // 如果更新了角色编码，检查是否与其他角色冲突
      if (updateRoleDto.code && updateRoleDto.code !== role.code) {
        const existingRole = await this.roleRepository.findOne({
          where: { code: updateRoleDto.code },
        });

        if (existingRole && existingRole.id !== role.id) {
          throw new BadRequestException(
            `角色编码 "${updateRoleDto.code}" 已存在`,
          );
        }
      }

      // 更新角色
      await this.roleRepository.update({ id: BigInt(id) }, updateRoleDto);
      await queryRunner.commitTransaction();

      // 返回更新后的角色
      return await this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (
        error instanceof ResourceNotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(`更新角色失败: ${error.message}`, error.stack);
      throw new DatabaseException('更新', '角色', error);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 删除角色
   * @param id 角色ID
   */
  async remove(id: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 查询要删除的角色是否存在
      const role = await this.roleRepository.findOne({
        where: { id: BigInt(id) },
        relations: ['userRoles'],
      });

      if (!role) {
        throw new ResourceNotFoundException('角色', id);
      }

      // 检查角色是否已分配给用户
      if (role.userRoles && role.userRoles.length > 0) {
        throw new BadRequestException(
          `角色"${role.name}"已分配给用户，无法删除`,
        );
      }

      // 删除角色（软删除）
      await this.roleRepository.softDelete({ id: BigInt(id) });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (
        error instanceof ResourceNotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(`删除角色失败: ${error.message}`, error.stack);
      throw new DatabaseException('删除', '角色', error);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 给用户分配角色
   * @param userId 用户ID
   * @param roleIds 角色ID数组
   */
  async assignRolesToUser(userId: number, roleIds: number[]): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 检查用户是否存在
      const user = await this.userRepository.findOne({
        where: { id: BigInt(userId) },
      });

      if (!user) {
        throw new ResourceNotFoundException('用户', userId);
      }

      // 检查角色是否都存在
      const roles = await this.roleRepository.find({
        where: { id: In(roleIds.map((id) => BigInt(id))) },
      });

      if (roles.length !== roleIds.length) {
        throw new BadRequestException('部分角色不存在');
      }

      // 删除用户当前的所有角色
      await this.userRoleRepository.delete({ user_id: BigInt(userId) });

      // 添加新的角色关联
      const userRoles = roleIds.map((roleId) => ({
        user_id: BigInt(userId),
        role_id: BigInt(roleId),
      }));

      await this.userRoleRepository.insert(userRoles);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (
        error instanceof ResourceNotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(`分配角色失败: ${error.message}`, error.stack);
      throw new DatabaseException('分配', '角色', error);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 批量分配用户角色
   * @param batchAssignRoleDto 批量分配数据
   */
  async batchAssignRoles(
    batchAssignRoleDto: BatchAssignRoleDto,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { assignments } = batchAssignRoleDto;

      // 逐个处理每个用户的角色分配
      for (const assignment of assignments) {
        await this.assignRolesToUser(assignment.userId, assignment.roleIds);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (
        error instanceof ResourceNotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(`批量分配角色失败: ${error.message}`, error.stack);
      throw new DatabaseException('批量分配', '角色', error);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 获取用户的角色列表
   * @param userId 用户ID
   * @returns 角色列表
   */
  async findUserRoles(userId: number): Promise<Role[]> {
    try {
      // 检查用户是否存在
      const user = await this.userRepository.findOne({
        where: { id: BigInt(userId) },
      });

      if (!user) {
        throw new ResourceNotFoundException('用户', userId);
      }

      // 查询用户的角色
      const userRoles = await this.userRoleRepository.find({
        where: { user_id: BigInt(userId) },
        relations: ['role'],
      });

      // 提取角色对象
      return userRoles.map((ur) => ur.role);
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }

      this.logger.error(`查询用户角色失败: ${error.message}`, error.stack);
      throw new DatabaseException('查询', '用户角色', error);
    }
  }
}
