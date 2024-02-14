import { Body, Controller, Get, Param, Patch, Post, Res } from '@nestjs/common';
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
    return { status: 201, result };
  }

  @Post('login')
  async login(@Body() body: any, @Res({ passthrough: true }) response: Response) {
    const dta: any = response.locals;
    console.log(dta);
    const result = this.User.checkEmailAndPassword(body.email, body.password);
    return { status: 200, result };
  }

  @Get('forgot-password/:email')
  async checkEmail(@Param() email: string, @Res({ passthrough: true }) response: Response) {
    const dta: any = response.locals;
    console.log(dta);
    const result = await this.User.createChangePasswordToken(email);
    return { status: 200, result };
  }

  @Patch('update-password')
  async updatePassword(@Body() body: any, @Res({ passthrough: true }) response: Response) {
    const dta: any = response.locals;
    console.log(dta);
    const result = await this.User.updatePassword(body.email, body.password);
    return { status: 200, result };
  }
}
