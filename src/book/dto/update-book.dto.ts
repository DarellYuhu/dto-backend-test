import { Prisma } from '@prisma/client';
import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateBookDto implements Prisma.BookUpdateInput {
  @IsString()
  @IsOptional()
  author?: string | Prisma.StringFieldUpdateOperationsInput;

  @IsString()
  @IsOptional()
  isbn?: string | Prisma.StringFieldUpdateOperationsInput;

  @IsDateString()
  @IsOptional()
  publishedDate?: string | Date | Prisma.DateTimeFieldUpdateOperationsInput;

  @IsString()
  @IsOptional()
  title?: string | Prisma.StringFieldUpdateOperationsInput;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean | Prisma.BoolFieldUpdateOperationsInput;
}
