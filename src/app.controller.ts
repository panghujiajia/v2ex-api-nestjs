import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    @Get('/wx/subscribe')
    private checkSignature(@Query() params) {
        return this.appService.checkSignature(params);
    }
    @Post('/wx/subscribe')
    private async getWxSubscribeData(@Param() params) {
        return this.appService.getWxSubscribeData(params);
    }
}
