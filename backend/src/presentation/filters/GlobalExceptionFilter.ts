import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorResponse } from '../../application/dto/response/ApiResponse';
import { DatabricksConnectionException } from '../../core/exceptions/DatabricksConnectionException';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'An unexpected error occurred';

    if (exception instanceof DatabricksConnectionException) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      code = 'DATABRICKS_CONNECTION_ERROR';
      message = exception.message;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      code = status >= 500 ? 'SERVER_ERROR' : 'CLIENT_ERROR';
      message = exception.message;
    }

    if (status >= 500) {
      this.logger.error(
        `[${code}] ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    const errorResponse = new ErrorResponse(code, message);
    response.status(status).json(errorResponse);
  }
}