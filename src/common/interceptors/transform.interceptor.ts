import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
    data: T;
}

// 包装response返回
@Injectable()
export class TransformInterceptor<T>
    implements NestInterceptor<T, Response<T>>
{
    intercept(
        context: ExecutionContext,
        next: CallHandler<T>
    ): Observable<Response<T>> {
        return next.handle().pipe(
            map(data => {
                console.log(`请求结果：${JSON.stringify(data)}`);
                return { data, status: 200 };
            })
        );
    }
}
