import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray } from 'class-validator';

export class ReturnLoanDto {
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => Number)
  id: number[];
}
