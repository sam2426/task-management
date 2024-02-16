import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/common/connection/prisma.service';
import { CryptoService, JwtService } from 'src/common/helpers';

const throwableErrorNames = ['PrismaClientValidationError'];
@Injectable()
export class UserService {
  constructor(
    private readonly crypto: CryptoService,
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async findUserService(userUniqueInput: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return this.prisma.user.findUnique({ where: userUniqueInput });
  }

  async createUserService(userData: Prisma.UserCreateInput): Promise<string> {
    try {
      const user = await this.findUserService({ email: userData.email });
      if (user) {
        throw { status: HttpStatus.CONFLICT, error: 'User registeration failed.' };
      }

      const { passwordHash, salt } = await this.crypto.generateHash(userData.password);
      const finalUserData: Prisma.UserCreateInput = {
        ...userData,
        password: passwordHash,
        salt,
      };
      await this.prisma.user.create({ data: finalUserData });
      return 'User Registered Successfully.';
    } catch (error) {
      throw { status: HttpStatus.INTERNAL_SERVER_ERROR, error: 'User registeration failed.' };
    }
  }

  async checkEmailAndPassword(email: string, password: string): Promise<{ id: number; email: string; token: string }> {
    try {
      const user = await this.findUserService({ email });
      if (user === null) {
        throw { status: HttpStatus.NOT_FOUND, error: 'Unregistered user.' };
      }
      const isCorrectPassword = await this.crypto.checkPassword(password, user.password, user.salt);
      if (!isCorrectPassword) throw { status: HttpStatus.BAD_REQUEST, error: 'Incorrect Password.' };
      const token = await this.jwt.generateToken({ id: user.id, email: user.email }, 'UT');
      return { id: user.id, email: user.email, token };
    } catch (error) {
      if ('status' in error) {
        throw error;
      }
      throw { status: HttpStatus.BAD_REQUEST, error: 'Login failed.' };
    }
  }

  async createChangePasswordToken(email: string): Promise<string> {
    try {
      const user = await this.findUserService({ email });
      if (user === null) {
        throw { status: HttpStatus.NOT_FOUND, error: 'Unregistered user.' };
      }
      const token = await this.jwt.generateToken({ id: user.id, email: user.email }, 'PT');
      return token;
    } catch (error) {
      if (error instanceof Error && throwableErrorNames.includes(error.name)) {
        throw error;
      }
      if ('status' in error) {
        throw error;
      }
      throw { status: HttpStatus.BAD_REQUEST, error: 'Request failed.' };
    }
  }

  async updatePassword(email: string, password: string): Promise<string> {
    try {
      const { passwordHash, salt } = await this.crypto.generateHash(password);
      await this.prisma.user.update({ data: { password: passwordHash, salt }, where: { email } });
      return 'Password updated successfully.';
    } catch (error) {
      throw new Error('Password update failed.');
    }
  }
}
