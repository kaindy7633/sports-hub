import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { TokenService } from '../../core/token/token.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  // 模拟验证码存储，实际应用中应该使用Redis等缓存服务
  private verificationCodes: Map<string, { code: string; expiry: Date }> =
    new Map();

  constructor(
    private usersService: UsersService,
    private tokenService: TokenService,
  ) {}

  /**
   * 发送短信验证码
   * @param phone 手机号
   * @returns 发送结果
   */
  async sendSmsCode(phone: string): Promise<{ message: string }> {
    // 生成6位随机验证码
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    // 设置验证码有效期为5分钟
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 5);

    // 存储验证码
    this.verificationCodes.set(phone, { code: verificationCode, expiry });

    // 实际应用中，这里应该调用短信服务发送验证码
    console.log(`向手机号 ${phone} 发送验证码: ${verificationCode}`);

    return { message: '验证码已发送' };
  }

  /**
   * 验证短信验证码
   * @param phone 手机号
   * @param code 验证码
   * @returns 验证结果
   */
  private verifyCode(phone: string, code: string): boolean {
    const storedCode = this.verificationCodes.get(phone);

    if (!storedCode) {
      return false;
    }

    if (new Date() > storedCode.expiry) {
      this.verificationCodes.delete(phone);
      return false;
    }

    return storedCode.code === code;
  }

  /**
   * 用户注册
   * @param registerDto 注册信息
   * @returns 注册结果
   */
  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { phone, verificationCode, password } = registerDto;

    // 验证验证码
    if (!this.verifyCode(phone, verificationCode)) {
      throw new BadRequestException('验证码无效或已过期');
    }

    // 检查用户是否已存在
    const existingUser = await this.usersService.findByPhone(phone);
    if (existingUser) {
      throw new BadRequestException('该手机号已注册');
    }

    // 创建用户
    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = crypto
      .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
      .toString('hex');

    // 生成用户名（使用手机号作为默认用户名）
    const username = `user_${phone}`;

    // 创建用户
    const user = await this.usersService.create({
      username,
      password,
      phone,
      nick_name: username,
    });

    // 创建用户认证信息
    await this.usersService.createUserAuth({
      user_id: user.id,
      identity_type: 'phone',
      identifier: phone,
      credential: hashedPassword,
    });

    // 清除验证码
    this.verificationCodes.delete(phone);

    return { message: '注册成功' };
  }

  /**
   * 用户登录
   * @param loginDto 登录信息
   * @returns 登录结果，包含token
   */
  async login(loginDto: LoginDto): Promise<{ token: string; user: any }> {
    const { phone, verificationCode } = loginDto;

    // 验证验证码
    if (!this.verifyCode(phone, verificationCode)) {
      throw new BadRequestException('验证码无效或已过期');
    }

    // 查找用户
    const user = await this.usersService.findByPhone(phone);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 生成token
    const token = this.tokenService.generateToken({
      userId: user.id.toString(),
      username: user.username,
      phone: user.phone,
    });

    // 清除验证码
    this.verificationCodes.delete(phone);

    // 返回用户信息（排除敏感字段）
    const { password, salt, ...userInfo } = user;

    return {
      token,
      user: userInfo,
    };
  }
}
