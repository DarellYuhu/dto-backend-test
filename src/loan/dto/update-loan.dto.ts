import { Prisma } from '@prisma/client';
import { IsBoolean, IsDateString, IsOptional } from 'class-validator';

export class UpdateLoanDto implements Prisma.LoanUpdateInput {
  @IsDateString()
  @IsOptional()
  returnDate?:
    | string
    | Date
    | Prisma.NullableDateTimeFieldUpdateOperationsInput;

  @IsDateString()
  @IsOptional()
  dueDate?: string | Date | Prisma.DateTimeFieldUpdateOperationsInput;

  @IsBoolean()
  @IsOptional()
  isReturned?: boolean | Prisma.BoolFieldUpdateOperationsInput;
}
