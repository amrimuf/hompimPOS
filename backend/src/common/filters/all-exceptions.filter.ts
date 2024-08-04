import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  message?: string | string[];
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const logDir = path.join(process.cwd(), 'logs');
    const logFile = path.join(logDir, 'exceptions.log');

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir);
    }

    let logMessage = `${new Date().toISOString()} - ${request.method} ${request.url} - ${status} - ${(exception as HttpException).message}\n`;

    if (exception instanceof BadRequestException) {
      const response = exception.getResponse() as any;
      if (response.message) {
        logMessage += `Validation Errors: ${JSON.stringify(response.message)}\n`;
      }
    }

    fs.appendFileSync(logFile, logMessage);

    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        errorResponse.message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        errorResponse.message = (exceptionResponse as any).message;
      }
    }

    response.status(status).json(errorResponse);
  }
}
