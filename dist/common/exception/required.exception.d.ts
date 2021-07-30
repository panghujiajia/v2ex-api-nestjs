import { HttpException } from '@nestjs/common';
export declare class RequireException extends HttpException {
    constructor(response?: string, status?: number);
}
