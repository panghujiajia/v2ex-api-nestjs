import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    @Get('/wx/subscribe')
    private getWxSubscribe(@Query() params) {
        return this.appService.checkSignature(params);
    }
}
