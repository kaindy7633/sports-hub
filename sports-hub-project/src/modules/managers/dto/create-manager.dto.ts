import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateManagerDto {
  @ApiProperty({ description: '管理员名称', example: 'admin' })
  @IsNotEmpty({ message: '管理员名称不能为空' })
  @IsString({ message: '管理员名称必须是字符串' })
  @Length(2, 50, { message: '管理员名称长度必须在2-50个字符之间' })
  name: string;

  @ApiProperty({ description: '管理员账号', example: 'admin' })
  @IsNotEmpty({ message: '管理员账号不能为空' })
  @IsString({ message: '管理员账号必须是字符串' })
  @Length(4, 50, { message: '管理员账号长度必须在4-50个字符之间' })
  account: string;

  @ApiProperty({ description: '管理员密码', example: 'password123' })
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString({ message: '密码必须是字符串' })
  @Length(6, 20, { message: '密码长度必须在6-20个字符之间' })
  password: string;

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
  email?: string;

  @ApiProperty({
    description: '状态：0-禁用，1-正常',
    example: 1,
    required: false,
  })
  @IsOptional()
  status?: number;
}
