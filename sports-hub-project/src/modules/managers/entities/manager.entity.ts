import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('managers')
export class Manager {
  @ApiProperty({ description: '管理员ID', example: '1' })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @ApiProperty({ description: '管理员名称', example: 'admin' })
  @Column({ length: 50 })
  name: string;

  @ApiProperty({ description: '管理员账号', example: 'admin' })
  @Column({ length: 50, unique: true })
  account: string;

  @ApiProperty({ description: '管理员密码', example: 'password123' })
  @Column()
  password: string;

  @ApiProperty({ description: '密码加密盐值', example: 'abc123' })
  @Column({ length: 32 })
  salt: string;

  @ApiProperty({
    description: '手机号',
    example: '13800138000',
    required: false,
  })
  @Column({ length: 20, nullable: true })
  phone: string;

  @ApiProperty({
    description: '邮箱',
    example: 'admin@example.com',
    required: false,
  })
  @Column({ length: 100, nullable: true })
  email: string;

  @ApiProperty({ description: '状态：0-禁用，1-正常', example: 1 })
  @Column({ type: 'smallint', default: 1 })
  status: number;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updated_at: Date;

  @ApiProperty({ description: '删除时间', required: false })
  @DeleteDateColumn({ nullable: true })
  deleted_at: Date;
}
