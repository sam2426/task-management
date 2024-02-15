import { Body, Controller, Get, HttpStatus, Param, Patch, Post, Res, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';
import { TransformerInterceptor } from 'src/common/helpers';

type ResponseBody = {
  message: string;
  data?: Record<string, any>;
};

@Controller('user')
@UseInterceptors(TransformerInterceptor)
export class UserController {
  constructor(private readonly User: UserService) {}

  @Post('signup')
  async signup(@Body() body: any, @Res({ passthrough: true }) response: Response): Promise<ResponseBody> {
    const result = await this.User.createUserService(body);
    response.status(HttpStatus.CREATED);
    return { message: result };

    // {
    //   "email": "sam@gm.com",
    //   "password": "123",
    //   "name": "sam"
    // }
    // {
    //   "success": true,
    //   "message": "User Registered Successfully."
    // }
    // {
    //   "success": false,
    //   "error": "User registeration failed."
    // }
  }

  @Post('login')
  async login(@Body() body: any, @Res({ passthrough: true }) response: Response): Promise<ResponseBody> {
    const result = await this.User.checkEmailAndPassword(body.email, body.password);
    response.status(HttpStatus.OK);
    return { message: 'Login Successful', data: { token: result } };

    // {
    //   "success": true,
    //   "message": "Login Successful",
    //   "data": {
    //     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJzYW1AZ20uY29tIiwiaWF0IjoxNzA3OTU4MzY5LCJleHAiOjE3MDgwNDQ3NjksInN1YiI6IlVUIn0.Y2Ubq93jNETHwxT0nIgJrTWU1AUwELW9hXhIOsa7NgI"
    //   }
    // }
  }

  @Get('forgot-password/:email')
  async checkEmail(
    @Param('email') email: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ResponseBody> {
    const result = await this.User.createChangePasswordToken(email);
    response.status(HttpStatus.ACCEPTED);
    return { message: 'Password change token generated.', data: { token: result } };
  }

  @Patch('update-password')
  async updatePassword(@Body() body: any, @Res({ passthrough: true }) response: Response): Promise<ResponseBody> {
    const result = await this.User.updatePassword(body.email, body.password);
    response.status(HttpStatus.OK);
    return { message: result };
  }
}
