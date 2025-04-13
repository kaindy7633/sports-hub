import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * 设置缓存
   * @param key 缓存键
   * @param value 缓存值
   * @param ttl 过期时间（秒）
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    // 将ttl从秒转换为毫秒，因为cache-manager-ioredis-yet使用毫秒作为ttl单位
    const ttlMs = ttl ? ttl * 1000 : undefined;
    await this.cacheManager.set(key, value, ttlMs);
  }

  /**
   * 获取缓存
   * @param key 缓存键
   * @returns 缓存值
   */
  async get<T>(key: string): Promise<T | undefined> {
    const result = await this.cacheManager.get<T>(key);
    return result === null ? undefined : result;
  }

  /**
   * 删除缓存
   * @param key 缓存键
   */
  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  /**
   * 设置验证码
   * @param phone 手机号
   * @param code 验证码
   * @param ttl 过期时间（秒），默认60秒
   */
  async setVerificationCode(
    phone: string,
    code: string,
    ttl: number = 60,
  ): Promise<void> {
    const key = `verification_code:${phone}`;
    await this.set(key, code, ttl);
  }

  /**
   * 获取验证码
   * @param phone 手机号
   * @returns 验证码
   */
  async getVerificationCode(phone: string): Promise<string | undefined> {
    const key = `verification_code:${phone}`;
    return await this.get<string>(key);
  }

  /**
   * 删除验证码
   * @param phone 手机号
   */
  async delVerificationCode(phone: string): Promise<void> {
    const key = `verification_code:${phone}`;
    await this.del(key);
  }
}
