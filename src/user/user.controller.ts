import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly User: UserService) {}

  @Post('signup')
  async signup(@Body() body: any, @Res({ passthrough: true }) response: Response) {
    const dta: any = response.locals;
    console.log(dta);
    const result = this.User.createUserService(body);
    return { status: 200, result };
  }

  @Post('login')
  async login() {}

  @Get('forgot-password/:email')
  async checkEmail() {}

  @Post('update-password')
  async updatePassword() {}
}
