import { Body, Controller, Get, HttpStatus, Param, Patch, Post, Res, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';
import { TransformerInterceptor } from 'src/common/helpers';
import { ApiBody, ApiHeader, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { UserLoginDTO, UserRegisterDTO } from './user.swagger.dto';

type ResponseBody = {
  message: string;
  data?: Record<string, any>;
};

@Controller('user')
@UseInterceptors(TransformerInterceptor)
@ApiTags('User')
export class UserController {
  constructor(private readonly User: UserService) {}

  @Post('signup')
  @ApiOperation({
    summary: 'Register a user',
    description: `Create a new user in the database. email has to be unique.
    The password is also stored in the db as encrypted code.`,
  })
  @ApiBody(UserRegisterDTO)
  async signup(@Body() body: any, @Res({ passthrough: true }) response: Response): Promise<ResponseBody> {
    const result = await this.User.createUserService(body);
    response.status(HttpStatus.CREATED);
    return { message: result };
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login as a user',
    description: 'Login using the email and the password. The token generated is valid for 1 day',
  })
  @ApiBody(UserLoginDTO)
  async login(@Body() body: any, @Res({ passthrough: true }) response: Response): Promise<ResponseBody> {
    const result = await this.User.checkEmailAndPassword(body.email, body.password);
    response.status(HttpStatus.OK);
    return { message: 'Login Successful', data: { token: result } };
    // in login response also pass name and email.
  }

  @Get('forgot-password/:email')
  @ApiParam({
    name: 'email',
  })
  @ApiOperation({
    summary: 'This endpoint generates a token valid for 1 minute, using which we can update the password.',
  })
  async checkEmail(
    @Param('email') email: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ResponseBody> {
    const result = await this.User.createChangePasswordToken(email);
    response.status(HttpStatus.ACCEPTED);
    return { message: 'Password change token generated.', data: { token: result } };
  }

  @Patch('update-password')
  @ApiOperation({
    summary:
      'This endpoint is used to change the password. To be used along with the token generated from the `user/forgot-password/:email endpoint`',
  })
  @ApiBody(UserLoginDTO)
  @ApiHeader({
    name: 'bearerauth',
    description: 'Bearer Token - add `Bearer` at start of token',
    required: true,
    schema: {
      type: 'string',
      format: 'Bearer <token>',
    },
  })
  async updatePassword(@Body() body: any, @Res({ passthrough: true }) response: Response): Promise<ResponseBody> {
    const result = await this.User.updatePassword(body.email, body.password);
    response.status(HttpStatus.OK);
    return { message: result };
  }
}
