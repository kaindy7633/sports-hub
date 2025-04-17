import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { CreateManagerDto } from './dto/create-manager.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';
import { Manager } from './entities/manager.entity';
import { SnowflakeService } from '../../core/snowflake/snowflake.service';

@Injectable()
export class ManagersService {
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
   * 根据ID查询管理员
   * @param id 管理员ID
   * @returns 管理员信息
   */
  async findOne(id: bigint): Promise<Manager> {
    const manager = await this.managerRepository.findOne({
      where: { id },
    });

    if (!manager) {
      throw new NotFoundException(`ID为${id}的管理员不存在`);
    }

    return manager;
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
   * @param id 管理员ID
   * @param updateManagerDto 更新管理员DTO
   * @returns 更新后的管理员信息
   */
  async update(
    id: bigint,
    updateManagerDto: UpdateManagerDto,
  ): Promise<Manager> {
    const manager = await this.findOne(id);

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
  }

  /**
   * 删除管理员
   * @param id 管理员ID
   * @returns 删除结果
   */
  async remove(id: bigint): Promise<void> {
    const manager = await this.findOne(id);
    await this.managerRepository.softDelete({ id });
  }

  /**
   * 生成雪花ID
   * @returns 雪花ID
   */
  generateSnowflakeId(): bigint {
    return this.snowflakeService.generate();
  }
}
