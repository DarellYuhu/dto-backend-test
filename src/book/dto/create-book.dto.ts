import { Prisma } from '@prisma/client';
import { IsDateString, IsString } from 'class-validator';

export class CreateBookDto implements Prisma.BookUncheckedCreateInput {
  @IsString()
  title: string;

  @IsString()
  author: string;

  @IsString()
  isbn: string;

  @IsDateString()
  publishedDate: Date;
}
