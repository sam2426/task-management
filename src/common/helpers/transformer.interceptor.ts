import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';
// import { Response } from 'express';

@Injectable()
export class TransformerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // const ctx = context.switchToHttp();
    // const res = ctx.getResponse<Response>();

    return next.handle().pipe(
      map((response) => {
        return {
          success: true,
          ...response,
        };
      }),
    );
  }
}
