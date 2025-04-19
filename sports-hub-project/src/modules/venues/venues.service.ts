import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Venue } from './entities/venue.entity';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { QueryVenueDto } from './dto/query-venue.dto';
import { ResourceNotFoundException } from '../../common/exceptions/resource-not-found.exception';
import { DatabaseException } from '../../common/exceptions/database.exception';
import { SnowflakeService } from '../../core/snowflake/snowflake.service';

@Injectable()
export class VenuesService {
  private readonly logger = new Logger(VenuesService.name);

  constructor(
    @InjectRepository(Venue)
    private readonly venueRepository: Repository<Venue>,
    private readonly snowflakeService: SnowflakeService,
  ) {}

  /**
   * 创建场地
   * @param createVenueDto 
   * @returns 
   */
  async create(createVenueDto: CreateVenueDto): Promise<Venue> {
    try {
      // 生成业务场地ID
      const venue_id = this.snowflakeService.generate();

      // 创建场地
      const venue = this.venueRepository.create({
        ...createVenueDto,
        venue_id,
      });
      return await this.venueRepository.save(venue);
    } catch (error) {
      this.logger.error(`创建场地失败: ${error.message}`, error.stack);
      throw new DatabaseException('创建', '场地', error);
    }
  }

  /**
   * 分页查询场地列表
   * @param queryParams 
   * @returns 
   */
  async findAll(queryParams: QueryVenueDto = {}) {
    try {
      const { name, address, contact_phone, status, pageNum = 1, pageSize = 10 } = queryParams;
      const skip = (pageNum - 1) * pageSize;

      // 构建查询条件
      const whereConditions: any = {};
      if (name) {
        whereConditions.name = Like(`%${name}%`);
      }
      if (address) {
        whereConditions.address = Like(`%${address}%`);
      }
      if (contact_phone) {
        whereConditions.contact_phone = Like(`%${contact_phone}%`);
      }
      if (status !== undefined) {
        whereConditions.status = status;
      }

      // 查询总数
      const total = await this.venueRepository.count({
        where: whereConditions,
      });

      // 查询数据
      const venues = await this.venueRepository.find({
        where: whereConditions,
        skip,
        take: pageSize,
        order: {
          created_at: 'DESC',
        },
      });

      return {
        list: venues,
        total,
        pageNum,
        pageSize,
      };
    } catch (error) {
      this.logger.error(`查询场地列表失败: ${error.message}`, error.stack);
      throw new DatabaseException('查询', '场地列表', error);
    }
  }

  /**
   * 获取所有场地（不分页）
   * @returns 
   */
  async findAllList(): Promise<Venue[]> {
    try {
      return await this.venueRepository.find({
        where: { status: 1 }, // 只返回启用的场地
        order: {
          created_at: 'DESC',
        },
      });
    } catch (error) {
      this.logger.error(`获取所有场地失败: ${error.message}`, error.stack);
      throw new DatabaseException('查询', '所有场地', error);
    }
  }

  /**
   * 根据业务ID查询场地详情
   * @param venueId 
   * @returns 
   */
  async findOne(venueId: string): Promise<Venue> {
    try {
      // 直接使用原始SQL查询以避免类型转换问题
      const [venue] = await this.venueRepository.query(
        'SELECT * FROM venues WHERE venue_id = $1 AND deleted_at IS NULL',
        [venueId],
      );

      if (!venue) {
        throw new ResourceNotFoundException('场地', venueId);
      }

      return venue;
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      this.logger.error(`查询场地详情失败: ${error.message}`, error.stack);
      throw new DatabaseException('查询', '场地详情', error);
    }
  }

  /**
   * 更新场地
   * @param venueId 
   * @param updateVenueDto 
   * @returns 
   */
  async update(venueId: string, updateVenueDto: UpdateVenueDto): Promise<Venue> {
    try {
      // 查询要更新的场地是否存在
      const existingVenue = await this.findOne(venueId);
      if (!existingVenue) {
        throw new ResourceNotFoundException('场地', venueId);
      }

      // 找到场地的内部ID
      const venueInternalId = existingVenue.id;

      // 更新场地
      await this.venueRepository.update(venueInternalId, updateVenueDto);

      // 返回更新后的场地
      return await this.venueRepository.findOne({
        where: { id: venueInternalId }
      });
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      this.logger.error(`更新场地失败: ${error.message}`, error.stack);
      throw new DatabaseException('更新', '场地', error);
    }
  }

  /**
   * 删除场地
   * @param venueId 
   */
  async remove(venueId: string): Promise<void> {
    try {
      // 查询要删除的场地是否存在
      const venue = await this.findOne(venueId);
      
      // 检查场地是否被活动引用
      const isUsed = venue.activities && venue.activities.length > 0;
      if (isUsed) {
        throw new BadRequestException(`场地 ${venue.name} 已被活动引用，无法删除`);
      }

      // 执行软删除
      await this.venueRepository.softDelete(venue.id);
    } catch (error) {
      if (error instanceof ResourceNotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`删除场地失败: ${error.message}`, error.stack);
      throw new DatabaseException('删除', '场地', error);
    }
  }
}
