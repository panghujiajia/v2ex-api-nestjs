import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
export declare class RequiredFilter<T> implements ExceptionFilter {
    catch(exception: T, host: ArgumentsHost): void;
}
