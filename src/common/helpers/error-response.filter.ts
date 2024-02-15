import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch()
// export class ErrorResponseFilter<T> implements ExceptionFilter {
export class ErrorResponseFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    let errorResponse: { error: any; success: boolean } = {
      success: false,
      error: {},
    };
    const ctx = host.switchToHttp();
    // const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();
    let statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('correlationid', res.locals.correlationId || '1aa111a1-11aa-11a1-aa11-1111111111aa');
    // console.log('error print from filter', exception);
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      errorResponse = {
        ...errorResponse,
        error: exceptionResponse,
      };
    } else if (exception instanceof Error) {
      statusCode = 500;
      errorResponse = {
        ...errorResponse,
        error: exception.message || {},
      };
    } else {
      const err = exception as { status: number; error: any };
      if (err.status) {
        statusCode = err.status;
        errorResponse = {
          ...errorResponse,
          error: err.error,
        };
      } else {
        statusCode = 500;
        errorResponse = {
          ...errorResponse,
          error: (err.error as Error).message || {},
        };
      }
    }
    // this.logger.error({
    //   label: 'MainResponse',
    //   correlationId: res.locals.correlationId,
    //   message: `data = {method: ${req.method.toUpperCase()}, url: ${
    //     res.locals.currentRequestURL
    //   }, status: ${statusCode}, responseBody: ${customStringify(errorResponse)}}`,
    // });
    return res.status(statusCode).json(errorResponse);
  }
}
