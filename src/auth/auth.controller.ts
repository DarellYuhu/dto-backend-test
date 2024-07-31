import {
  Controller,
  Post,
  Body,
  HttpCode,
  Get,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpAuthDto } from './dto/signUp-auth.dto';
import { SignInAuthDto } from './dto/signIn-auth.dto';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() signUpAuthDto: SignUpAuthDto) {
    try {
      return await this.authService.signUp(signUpAuthDto);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new HttpException(
          'The username already exists',
          HttpStatus.CONFLICT,
        );
      }
    }
  }

  @Post('signin')
  @HttpCode(200)
  async signIn(@Body() signInAuthDto: SignInAuthDto) {
    return await this.authService.signIn(signInAuthDto);
  }

  @UseGuards(AuthGuard)
  @Get('protected-route')
  getProtectedRoute() {
    return 'This is a protected route';
  }
}
