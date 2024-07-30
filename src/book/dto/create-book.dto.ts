import { Prisma } from '@prisma/client';
import { IsDate, IsDateString, IsString } from 'class-validator';

export class CreateBookDto implements Prisma.BookUncheckedCreateInput {
  @IsString()
  title: string;

  @IsString()
  author: string;

  @IsString()
  isbn: string;

  @IsDate()
  publishedDate: Date;
}
