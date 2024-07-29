import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class SignUpAuthDto {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsBoolean()
  isAdmin: boolean;
}
