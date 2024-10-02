import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('Global Exception'); 

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const contextType = host.getType();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (status !== 404) {
      this.logger.error({ message: exception.message, path: request.url, statusCode: status }, contextType);
    }
    
    console.log('HttpExceptionFilter exception.message =>', exception.message, exception.stack);

    response.status(status).json({
      statusCode: status,
      message: exception.message
    });
  }
}
