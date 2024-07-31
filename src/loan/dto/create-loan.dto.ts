import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDate,
  IsDateString,
  IsNumber,
} from 'class-validator';

class LoanType {
  @IsNumber()
  bookId: number;
  @IsDateString()
  dueDate: string | Date;
}

export class CreateLoanDto {
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => LoanType)
  data: LoanType[];
}
