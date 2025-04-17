// src/modules/managers/managers.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { CreateManagerDto } from './dto/create-manager.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';
import { Manager } from './entities/manager.entity';
import { SnowflakeService } from '../../core/snowflake/snowflake.service';
import { ResourceNotFoundException } from '../../common/exceptions/resource-not-found.exception';
import { DatabaseException } from '../../common/exceptions/database.exception';

@Injectable()
export class ManagersService {
  private readonly logger = new Logger(ManagersService.name);

  constructor(
    @InjectRepository(Manager)
    private readonly managerRepository: Repository<Manager>,
    private readonly snowflakeService: SnowflakeService,
  ) {}

  /**
   * 创建管理员
   * @param createManagerDto 创建管理员DTO
   * @returns 创建的管理员信息
   */
  async create(createManagerDto: CreateManagerDto): Promise<Manager> {
    try {
      // 检查账号是否已存在
      const existingManager = await this.managerRepository.findOne({
        where: { username: createManagerDto.username },
      });

      if (existingManager) {
        throw new ConflictException(`账号 ${createManagerDto.username} 已存在`);
      }

      // 生成雪花ID
      const manager_id = this.snowflakeService.generate();
      // 生成盐值
      const salt = crypto.randomBytes(16).toString('hex');
      // 使用盐值加密密码
      const hashedPassword = crypto
        .pbkdf2Sync(createManagerDto.password, salt, 1000, 64, 'sha512')
        .toString('hex');

      // 创建管理员实体
      const manager = this.managerRepository.create({
        ...createManagerDto,
        manager_id,
        password: hashedPassword,
        salt,
      });

      // 保存管理员
      return await this.managerRepository.save(manager);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`创建管理员失败: ${error.message}`, error.stack);
      throw new DatabaseException('创建', '管理员', error);
    }
  }

  /**
   * 查询所有管理员
   * @returns 管理员列表
   */
  async findAll(): Promise<Manager[]> {
    return await this.managerRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  /**
   * 根据内部ID查询管理员 (仅内部使用)
   * @param id 内部管理员ID
   * @returns 管理员信息
   */
  private async findById(id: bigint): Promise<Manager> {
    const manager = await this.managerRepository.findOne({
      where: { id },
    });

    if (!manager) {
      throw new ResourceNotFoundException('管理员', id.toString());
    }

    return manager;
  }

  /**
   * 根据业务ID查询管理员 (对外API使用)
   * @param managerId 业务管理员ID
   * @returns 管理员信息
   */
  async findOne(managerId: bigint): Promise<Manager> {
    try {
      const manager = await this.managerRepository.findOne({
        where: { manager_id: managerId },
      });

      if (!manager) {
        throw new ResourceNotFoundException('管理员', managerId.toString());
      }

      return manager;
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      this.logger.error(`查询管理员详情失败: ${error.message}`, error.stack);
      throw new DatabaseException('查询', '管理员详情', error);
    }
  }

  /**
   * 根据账号查询管理员
   * @param username 管理员账号
   * @returns 管理员信息
   */
  async findByUsername(username: string): Promise<Manager> {
    const manager = await this.managerRepository.findOne({
      where: { username: username },
    });

    if (!manager) {
      throw new NotFoundException(`账号为${username}的管理员不存在`);
    }

    return manager;
  }

  /**
   * 更新管理员信息
   * @param managerId 业务管理员ID
   * @param updateManagerDto 更新管理员DTO
   * @returns 更新后的管理员信息
   */
  async update(
    managerId: bigint,
    updateManagerDto: UpdateManagerDto,
  ): Promise<Manager> {
    try {
      // 查询要更新的管理员是否存在
      const manager = await this.findOne(managerId);

      // 如果更新了账号，检查是否与其他管理员冲突
      if (
        updateManagerDto.username &&
        updateManagerDto.username !== manager.username
      ) {
        const existingManager = await this.managerRepository.findOne({
          where: { username: updateManagerDto.username },
        });

        if (existingManager && existingManager.id !== manager.id) {
          throw new ConflictException(
            `账号 "${updateManagerDto.username}" 已存在`,
          );
        }
      }

      // 如果更新密码，需要重新加密
      if (updateManagerDto.password) {
        const salt = crypto.randomBytes(16).toString('hex');
        const hashedPassword = crypto
          .pbkdf2Sync(updateManagerDto.password, salt, 1000, 64, 'sha512')
          .toString('hex');

        updateManagerDto.password = hashedPassword;
        manager.salt = salt;
      }

      // 更新管理员信息
      Object.assign(manager, updateManagerDto);

      // 保存更新
      return await this.managerRepository.save(manager);
    } catch (error) {
      if (
        error instanceof ResourceNotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      this.logger.error(`更新管理员失败: ${error.message}`, error.stack);
      throw new DatabaseException('更新', '管理员', error);
    }
  }

  /**
   * 删除管理员
   * @param managerId 业务管理员ID
   */
  async remove(managerId: bigint): Promise<void> {
    try {
      // 查询要删除的管理员是否存在
      const manager = await this.findOne(managerId);

      // 执行软删除
      await this.managerRepository.softDelete({ id: manager.id });
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }

      this.logger.error(`删除管理员失败: ${error.message}`, error.stack);
      throw new DatabaseException('删除', '管理员', error);
    }
  }

  /**
   * 生成雪花ID
   * @returns 雪花ID
   */
  generateSnowflakeId(): bigint {
    return this.snowflakeService.generate();
  }
}
