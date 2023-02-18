import { MiddlewareConsumer, Module } from '@nestjs/common';
import { LoggerMiddleware } from 'src/common/middleware/logger.middleware';
import { WorktoolController } from './worktool.controller';
import { WorktoolService } from './worktool.service';

@Module({
    controllers: [WorktoolController],
    providers: [WorktoolService]
})
export class WorktoolModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes('worktool');
    }
}
