import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsDate, IsNumber } from 'class-validator';

class LoanType {
  @IsNumber()
  bookId: number;
  @IsDate()
  dueDate: string | Date;
}

export class CreateLoanDto {
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => LoanType)
  data: LoanType[];
}
