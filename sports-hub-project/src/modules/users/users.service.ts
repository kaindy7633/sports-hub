import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserAuth } from './entities/user-auth.entity';
import { Role } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserAuth)
    private readonly userAuthRepository: Repository<UserAuth>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  /**
   * 创建用户
   * @param createUserDto
   * @returns
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // 生成盐值
    const salt = crypto.randomBytes(16).toString('hex');
    // 使用盐值加密密码
    const hashedPassword = crypto
      .pbkdf2Sync(createUserDto.password, salt, 1000, 64, 'sha512')
      .toString('hex');

    // 创建业务用户ID (简单实现，实际可能需要更复杂的逻辑)
    const businessUserId = Date.now();

    // 创建用户实体
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      salt,
      user_id: BigInt(businessUserId),
    });

    // 保存用户
    return await this.userRepository.save(user);
  }

  /**
   * 查找所有用户
   * @returns
   */
  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      relations: ['auths', 'roles'],
    });
  }

  /**
   * 根据ID查找用户
   * @param id
   * @returns
   */
  async findOne(id: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id: BigInt(id) },
      relations: ['auths', 'roles'],
    });
  }

  /**
   * 更新用户信息
   * @param id
   * @param updateUserDto
   * @returns
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    const user = await this.findOne(id);
    if (!user) {
      return null;
    }

    // 如果更新包含密码，需要重新加密
    if (updateUserDto.password) {
      const hashedPassword = crypto
        .pbkdf2Sync(updateUserDto.password, user.salt, 1000, 64, 'sha512')
        .toString('hex');
      updateUserDto.password = hashedPassword;
    }

    // 更新用户信息
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  /**
   * 删除用户
   * @param id
   * @returns
   */
  async remove(id: number): Promise<void> {
    await this.userRepository.softDelete({ id: BigInt(id) });
  }

  /**
   * 添加用户认证方式
   * @param authData
   * @returns
   */
  async addUserAuth(authData: {
    userId: number;
    identityType: string;
    identifier: string;
    credential: string;
  }) {
    const { userId, identityType, identifier, credential } = authData;
    const userAuth = this.userAuthRepository.create({
      user_id: BigInt(userId),
      identity_type: identityType,
      identifier,
      credential,
    });
    return await this.userAuthRepository.save(userAuth);
  }

  /**
   * 根据用户名查找用户
   * @param username
   * @returns
   */
  async findByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { username },
      relations: ['auths', 'roles'],
    });
  }

  /**
   * 根据手机号查找用户
   * @param phone
   * @returns
   */
  async findByPhone(phone: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { phone },
      relations: ['auths', 'roles'],
    });
  }

  /**
   * 根据邮箱查找用户
   * @param email
   * @returns
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      relations: ['auths', 'roles'],
    });
  }

  /**
   * 为用户分配角色
   * @param userId
   * @param roleId
   * @returns
   */
  async assignRole(userId: number, roleId: number): Promise<UserRole> {
    const userRole = this.userRoleRepository.create({
      user_id: BigInt(userId),
      role_id: BigInt(roleId),
    });
    return await this.userRoleRepository.save(userRole);
  }

  /**
   * 验证用户密码
   * @param plainPassword
   * @param hashedPassword
   * @param salt
   * @returns
   */
  verifyPassword(
    plainPassword: string,
    hashedPassword: string,
    salt: string,
  ): boolean {
    const hash = crypto
      .pbkdf2Sync(plainPassword, salt, 1000, 64, 'sha512')
      .toString('hex');
    return hash === hashedPassword;
  }
}
