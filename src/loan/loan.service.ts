import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReturnLoanDto } from './dto/return-loan.dto';

@Injectable()
export class LoanService {
  constructor(private prisma: PrismaService) {}
  create(createLoanDto: CreateLoanDto, userId: number) {
    return this.prisma.$transaction(async (prisma) => {
      const book = await prisma.book.findMany({
        where: {
          id: { in: createLoanDto.data.map((item) => item.bookId) },
          isAvailable: true,
        },
      });
      if (book.length !== createLoanDto.data.length) {
        throw new HttpException(
          'Please select the available book',
          HttpStatus.NOT_FOUND,
        );
      }
      const loans = await prisma.loan.createManyAndReturn({
        data: createLoanDto.data.map((item) => ({ ...item, userId })),
      });

      await prisma.book.updateMany({
        where: { id: { in: loans.map((item) => item.id) } },
        data: { isAvailable: false },
      });

      return loans;
    });
  }

  findAllUserLoan(userId: number) {
    return this.prisma.loan.findMany({ where: { userId } });
  }

  findOne(id: number) {
    return this.prisma.loan.findUnique({ where: { id } });
  }

  update(id: number, updateLoanDto: UpdateLoanDto) {
    return this.prisma.loan.update({ where: { id }, data: updateLoanDto });
  }

  returnLoans(returnLoanDto: ReturnLoanDto) {
    return this.prisma.$transaction(async (prisma) => {
      await prisma.loan.updateMany({
        where: { id: { in: returnLoanDto.id } },
        data: { isReturned: true, returnDate: new Date() },
      });

      const books = await prisma.loan.findMany({
        where: { id: { in: returnLoanDto.id } },
        select: { bookId: true },
      });

      return await prisma.book.updateMany({
        where: { id: { in: books.map((item) => item.bookId) } },
        data: { isAvailable: true },
      });
    });
  }
}
