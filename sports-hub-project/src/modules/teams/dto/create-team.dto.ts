import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateTeamDto {
  @IsNotEmpty({ message: '团队名称不能为空' })
  @IsString()
  @MaxLength(100, { message: '团队名称不能超过100个字符' })
  name: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
