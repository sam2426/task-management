import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TaskModule } from './task/task.module';
import { CryptoService } from './common/helpers/crypto.service';

@Module({
  imports: [UserModule, TaskModule],
  controllers: [AppController],
  providers: [AppService, CryptoService],
})
export class AppModule {}
