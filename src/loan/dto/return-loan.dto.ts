import { IsNumber } from 'class-validator';

export class ReturnLoanDto {
  @IsNumber({}, { each: true })
  id: number[];
}
