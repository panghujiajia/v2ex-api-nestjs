import { MiddlewareConsumer, Module } from '@nestjs/common';
import { LoggerMiddleware } from 'src/common/middleware/logger.middleware';
import { WorktoolContriller } from './worktool.contriller';
import { WorktoolService } from './worktool.service';

@Module({
    controllers: [WorktoolContriller],
    providers: [WorktoolService]
})
export class WorktoolModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes('worktool');
    }
}
