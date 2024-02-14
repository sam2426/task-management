import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/common/connection/prisma.service';
import { CryptoService, JwtService } from 'src/common/helpers';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, CryptoService, JwtService],
})
export class UserModule {}
