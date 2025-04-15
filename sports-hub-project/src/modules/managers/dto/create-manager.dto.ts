import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  IsNumber,
} from 'class-validator';

export class CreateManagerDto {
  @ApiProperty({ description: '管理员账号', example: 'admin' })
  @IsNotEmpty({ message: '管理员账号不能为空' })
  @IsString({ message: '管理员账号必须是字符串' })
  @Length(4, 50, { message: '管理员账号长度必须在4-50个字符之间' })
  username: string;

  @ApiProperty({ description: '管理员密码', example: 'password123' })
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString({ message: '密码必须是字符串' })
  @Length(6, 20, { message: '密码长度必须在6-20个字符之间' })
  password: string;

  @ApiProperty({
    description: '密码加密盐值',
    example: 'abc123',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '盐值必须是字符串' })
  @Length(0, 32, { message: '盐值最大长度为32个字符' })
  salt?: string;

  @ApiProperty({ description: '管理员ID', example: 0, required: false })
  @IsOptional()
  @IsNumber({}, { message: '管理员ID必须为数字' })
  manager_id?: number;

  @ApiProperty({ description: '父级管理员ID', example: 0, required: false })
  @IsOptional()
  @IsNumber({}, { message: '父级管理员ID必须为数字' })
  parent_id?: number;

  @ApiProperty({ description: '管理员昵称', example: 'admin', required: false })
  @IsOptional()
  @IsString({ message: '昵称必须是字符串' })
  @Length(0, 50, { message: '昵称最大长度为50个字符' })
  nick_name?: string;

  @ApiProperty({
    description: '管理员真实姓名',
    example: '张三',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '真实姓名必须是字符串' })
  @Length(0, 50, { message: '真实姓名最大长度为50个字符' })
  real_name?: string;

  @ApiProperty({
    description: '头像',
    example: 'https://example.com/avatar.png',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '头像必须是字符串' })
  @Length(0, 255, { message: '头像最大长度为255个字符' })
  avatar?: string;

  @ApiProperty({
    description: '手机号',
    example: '13800138000',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '手机号必须是字符串' })
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone?: string;

  @ApiProperty({
    description: '邮箱',
    example: 'admin@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  @Length(0, 100, { message: '邮箱最大长度为100个字符' })
  email?: string;

  @ApiProperty({
    description: '状态：0-禁用，1-正常',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: '状态必须为数字' })
  status?: number;

  @ApiProperty({ description: '创建时间', required: false })
  @IsOptional()
  created_at?: Date;

  @ApiProperty({ description: '更新时间', required: false })
  @IsOptional()
  updated_at?: Date;

  @ApiProperty({ description: '删除时间', required: false })
  @IsOptional()
  deleted_at?: Date;
}
