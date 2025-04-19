import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BigIntTransformer } from '../../../common/transformers/bigint.transformer';

@Entity('activities')
export class Activity {
  @ApiProperty({ description: '活动ID', example: '1' })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @ApiProperty({ description: '活动统一ID', example: '100001' })
  @Column({
    type: 'bigint',
    transformer: new BigIntTransformer(),
  })
  activity_id: string;

  @ApiProperty({ description: '活动标题', example: '周末篮球赛' })
  @Column({ length: 100 })
  title: string;

  @ApiProperty({ description: '活动类型ID', example: '1' })
  @Column({
    type: 'bigint',
    transformer: new BigIntTransformer(),
  })
  type_id: string;

  @ApiProperty({ description: '场地ID', example: '1' })
  @Column({
    type: 'bigint',
    transformer: new BigIntTransformer(),
  })
  venue_id: string;

  @ApiProperty({ description: '创建者ID', example: '1' })
  @Column({
    type: 'bigint',
    transformer: new BigIntTransformer(),
  })
  creator_id: string;

  @ApiProperty({ description: '关联团队ID', example: '1', required: false })
  @Column({
    type: 'bigint',
    nullable: true,
    transformer: new BigIntTransformer(),
  })
  team_id: string;

  @ApiProperty({
    description: '活动描述',
    example: '这是一个周末篮球赛活动',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: '开始时间', example: '2023-01-01T10:00:00Z' })
  @Column()
  start_time: Date;

  @ApiProperty({ description: '结束时间', example: '2023-01-01T12:00:00Z' })
  @Column()
  end_time: Date;

  @ApiProperty({
    description: '最大参与人数，0表示不限制',
    example: 20,
  })
  @Column({ default: 0 })
  max_participants: number;

  @ApiProperty({ description: '当前参与人数', example: 10 })
  @Column({ default: 0 })
  current_participants: number;

  @ApiProperty({ description: '参与费用', example: 50.0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  fee: number;

  @ApiProperty({
    description: '状态：0-草稿，1-已发布，2-未开始，3-进行中，4-已结束',
    example: 1,
  })
  @Column({ type: 'smallint', default: 0 })
  status: number;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updated_at: Date;

  @ApiProperty({ description: '删除时间', required: false })
  @DeleteDateColumn()
  deleted_at: Date;
}
