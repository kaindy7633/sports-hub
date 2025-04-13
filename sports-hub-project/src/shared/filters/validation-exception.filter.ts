import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ValidationError } from 'class-validator';
import { logger } from '../../core/middleware/logger.config';

/**
 * 验证异常过滤器
 * 专门处理输入验证失败的异常
 */
@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const exceptionResponse: any = exception.getResponse();
    const errorMessages = this.extractValidationErrors(exceptionResponse);
    const requestId = request['requestId'] || 'unknown';

    // 记录验证错误日志
    logger.warn({
      message: '请求参数验证失败',
      requestId,
      endpoint: request.url,
      method: request.method,
      errors: errorMessages,
      body: request.body,
    });

    // 构建标准响应
    response.status(status).json({
      statusCode: status,
      message: '请求参数验证失败',
      details: errorMessages,
      path: request.url,
      timestamp: new Date().toISOString(),
      code: 10003, // 验证错误的业务码
    });
  }

  /**
   * 提取验证错误信息，支持嵌套验证
   */
  private extractValidationErrors(exceptionResponse: any): any {
    // 如果是来自class-validator的验证错误
    if (exceptionResponse && Array.isArray(exceptionResponse.message)) {
      return exceptionResponse.message;
    }

    // 如果是普通的BadRequestException
    if (exceptionResponse && exceptionResponse.message) {
      return Array.isArray(exceptionResponse.message)
        ? exceptionResponse.message
        : [exceptionResponse.message];
    }

    return ['输入参数格式不正确'];
  }
}
