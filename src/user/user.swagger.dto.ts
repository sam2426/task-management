import { ApiProperty, ApiResponseOptions } from '@nestjs/swagger';

class UserDtoBody {
  @ApiProperty({ type: 'string', required: true })
  email: string;

  @ApiProperty({ type: 'string', required: true })
  password: string;

  @ApiProperty({ type: 'string', required: true })
  name: string;
}

export const UserRegisterDTO: ApiResponseOptions = {
  description: 'User registration schema',
  type: UserDtoBody,
};

class UserLoginBody {
  @ApiProperty({ type: 'string', required: true })
  email: string;

  @ApiProperty({ type: 'string', required: true })
  password: string;
}
export const UserLoginDTO: ApiResponseOptions = {
  description: 'User Login Schema',
  type: UserLoginBody,
};
