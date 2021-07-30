import { MiddlewareConsumer, Module } from '@nestjs/common';
import { LoggerMiddleware } from 'src/common/middleware/logger.middleware';
import { V2exController } from './v2ex.controller';
import { V2exService } from './v2ex.service';

@Module({
  controllers: [V2exController],
  providers: [V2exService],
})
export class V2exModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('api');
  }
}
