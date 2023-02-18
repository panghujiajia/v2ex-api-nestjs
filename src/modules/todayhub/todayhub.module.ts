import { MiddlewareConsumer, Module } from '@nestjs/common';
import { LoggerMiddleware } from 'src/common/middleware/logger.middleware';
import { TodayhubController } from './todayhub.controller';
import { TodayhubService } from './todayhub.service';

@Module({
    controllers: [TodayhubController],
    providers: [TodayhubService]
})
export class TodayhubModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes('todayhub');
    }
}
