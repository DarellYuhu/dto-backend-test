import { Prisma } from '@prisma/client';
import { IsBoolean, IsDate, IsOptional } from 'class-validator';

export class UpdateLoanDto implements Prisma.LoanUpdateInput {
  @IsDate()
  @IsOptional()
  returnDate?:
    | string
    | Date
    | Prisma.NullableDateTimeFieldUpdateOperationsInput;

  @IsDate()
  @IsOptional()
  dueDate?: string | Date | Prisma.DateTimeFieldUpdateOperationsInput;

  @IsBoolean()
  @IsOptional()
  isReturned?: boolean | Prisma.BoolFieldUpdateOperationsInput;
}
