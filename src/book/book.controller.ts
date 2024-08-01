import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('books')
@UseGuards(AuthGuard)
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  create(@Body() createBookDto: CreateBookDto) {
    return this.bookService.create(createBookDto);
  }

  @Get()
  findAll() {
    return this.bookService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    if (isNaN(+id)) throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    const data = await this.bookService.findOne(+id);
    if (!data) throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    return data;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.bookService.update(+id, updateBookDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.bookService.remove(+id);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new HttpException('Not found', HttpStatus.NOT_FOUND);
      }
    }
  }
}
