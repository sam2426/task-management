import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TaskModule } from './task/task.module';
import { AuthMiddleware, JwtService } from './common/helpers';
import { APP_FILTER } from '@nestjs/core';
import { ErrorResponseFilter } from './common/helpers/error-response.filter';

@Module({
  imports: [UserModule, TaskModule],
  controllers: [AppController],
  providers: [
    AppService,
    JwtService,
    {
      provide: APP_FILTER,
      useClass: ErrorResponseFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).exclude('user/signup', 'user/login', 'user/forgot-password/(.*)').forRoutes('*');
  }
}
