import { HttpException, HttpStatus } from '@nestjs/common';

// 基于nestjs自带的httpexception类定义的一个必传参数异常类
export class RequireException extends HttpException {
  constructor(response?: string, status?: number) {
    super(response || 'Bad Request', status || HttpStatus.BAD_REQUEST);
  }
}
