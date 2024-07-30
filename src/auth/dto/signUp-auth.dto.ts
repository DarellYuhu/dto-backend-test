import { Prisma } from '@prisma/client';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class SignUpAuthDto implements Prisma.UserUncheckedCreateInput {
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
  @IsOptional()
  isAdmin?: boolean;
}
