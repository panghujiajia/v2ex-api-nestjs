import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { V2exModule } from './modules/v2ex/v2ex.module';

@Module({
    imports: [V2exModule],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}
