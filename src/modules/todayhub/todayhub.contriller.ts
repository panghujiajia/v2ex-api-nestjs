import { Controller, Get } from '@nestjs/common';
import { TodayhubService } from './todayhub.service';

@Controller('todayhub')
export class TodayhubContriller {
    constructor(private todayhub: TodayhubService) {}

    @Get('/')
    private getThirdData() {
        return this.todayhub.getThirdData();
    }
}
