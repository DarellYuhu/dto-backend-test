import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  HttpException,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { LoanService } from './loan.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { ReturnLoanDto } from './dto/return-loan.dto';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('loans')
@UseGuards(AuthGuard)
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  @Post(':userId')
  create(
    @Body() createLoanDto: CreateLoanDto,
    @Param('userId', ParseIntPipe) userId: string,
  ) {
    return this.loanService.create(createLoanDto, +userId);
  }

  @Get('user/:userId')
  async findAllUserLoan(@Param('userId', ParseIntPipe) userId: string) {
    const result = await this.loanService.findAllUserLoan(+userId);
    if (result.length === 0)
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    return result;
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: string) {
    const data = await this.loanService.findOne(+id);
    if (!data) throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    return data;
  }

  @Patch('return')
  async returnLoans(@Body() returnLoanDto: ReturnLoanDto) {
    const result = await this.loanService.returnLoans(returnLoanDto);
    if (result.count === 0)
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    return result;
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateLoanDto: UpdateLoanDto,
  ) {
    try {
      return await this.loanService.update(+id, updateLoanDto);
    } catch (error) {
      if (error.code === 'P2025')
        throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
  }
}
