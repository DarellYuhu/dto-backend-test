import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SignUpAuthDto } from './dto/signUp-auth.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignInAuthDto } from './dto/signIn-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signUp(signUpAuthDto: SignUpAuthDto) {
    const hash = await bcrypt.hash(signUpAuthDto.password, 10);
    return await this.prisma.user.create({
      data: {
        ...signUpAuthDto,
        password: hash,
      },
    });
  }

  async signIn(signInAuthDto: SignInAuthDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: signInAuthDto.username },
    });
    const isValid = await bcrypt.compare(signInAuthDto.password, user.password);
    if (isValid) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    const payload = {
      sub: user.id,
      username: user.username,
    };
    delete user.password;
    const token = this.jwt.sign(payload, {
      secret: this.config.get<string>('SECRET_KEY'),
    });
    return { user, token };
  }
}
