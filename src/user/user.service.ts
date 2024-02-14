import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/common/connection/prisma.service';
import { CryptoService, JwtService } from 'src/common/helpers';

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
        throw new Error('User already registered.');
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
      throw new Error('User registeration failed.');
    }
  }

  async checkEmailAndPassword(email: string, password: string): Promise<string> {
    try {
      const user = await this.findUserService({ email });
      if (user === null) {
        throw new Error('Unregistered user.');
      }
      const isCorrectPassword = await this.crypto.checkPassword(password, user.password, user.salt);
      if (!isCorrectPassword) throw new Error('Incorrect Password.');
      const token = await this.jwt.generateToken({ id: user.id, email: user.email }, 'UT');
      //   return 'Login successful';
      return token;
    } catch (error) {
      throw new Error('Login failed.');
    }
  }

  async createChangePasswordToken(email: string): Promise<string> {
    try {
      const user = await this.findUserService({ email });
      if (user === null) {
        throw new Error('Unregistered user.');
      }
      const token = await this.jwt.generateToken({ id: user.id, email: user.email }, 'PT');
      //   return 'Change Password Token sent.'
      return token;
    } catch (error) {
      throw new Error('Request failed.');
    }
  }

  async updatePassword(email: string, password: string): Promise<string> {
    try {
      const { passwordHash, salt } = await this.crypto.generateHash(password);
      this.prisma.user.update({ data: { password: passwordHash, salt }, where: { email } });
      return 'Password Updated.';
    } catch (error) {
      throw new Error('Password update failed.');
    }
  }
}
