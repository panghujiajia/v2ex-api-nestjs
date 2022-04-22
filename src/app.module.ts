import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { V2exModule } from './modules/v2ex/v2ex.module';
import { TodayhubModule } from './modules/todayhub/todayhub.module';
import { ConfigModule } from '@nestjs/config';
import configuration from '../configuration';

@Module({
    imports: [
        TodayhubModule,
        V2exModule,
        ConfigModule.forRoot({
            envFilePath: process.env.NODE_ENV
                ? `${process.cwd()}/.env.${process.env.NODE_ENV}`
                : `${process.cwd()}/.env`,
            load: [configuration]
        })
    ],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}
