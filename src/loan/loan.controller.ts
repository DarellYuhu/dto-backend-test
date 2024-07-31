import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { LoanService } from './loan.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { ReturnLoanDto } from './dto/return-loan.dto';

@Controller('loans')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  @Post(':userId')
  create(
    @Body() createLoanDto: CreateLoanDto,
    @Param('userId') userId: number,
  ) {
    return this.loanService.create(createLoanDto, +userId);
  }

  @Get('user/:userId')
  findAllUserLoan(@Param('userId') userId: number) {
    return this.loanService.findAllUserLoan(+userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.loanService.findOne(+id);
  }

  @Patch('return')
  returnLoans(@Body() returnLoanDto: ReturnLoanDto) {
    return this.loanService.returnLoans(returnLoanDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLoanDto: UpdateLoanDto) {
    return this.loanService.update(+id, updateLoanDto);
  }
}
