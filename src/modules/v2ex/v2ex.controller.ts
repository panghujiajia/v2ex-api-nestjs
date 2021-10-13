import { HttpCode } from '@nestjs/common';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { RequireException } from 'src/common/exception/required.exception';
import { V2exService } from './v2ex.service';

@Controller('api')
export class V2exController {
    constructor(private v2exService: V2exService) {}

    @Get('/topics/tab')
    @HttpCode(200)
    private getTabTopics(@Query('tab') tab: string) {
        if (!tab) {
            throw new RequireException();
        }
        if (tab === 'top') {
            return this.v2exService.getHotTopics();
        }
        return this.v2exService.getTabTopics(tab);
    }

    @Get('/topics/all')
    private getAllTopics(@Query() { tab, p }: { tab: string; p: string }) {
        if (!tab || !p) {
            throw new RequireException();
        }
        return this.v2exService.getAllTopics(tab, p);
    }

    @Get('/topics/detail')
    private getTopicDetail(@Query('id') id: string) {
        if (!id) {
            throw new RequireException();
        }
        return this.v2exService.getTopicDetail(id);
    }

    @Get('/login/params')
    private getLoginParams() {
        return this.v2exService.getLoginParams();
    }

    @Post('/login')
    private getLogin(@Body() params: any) {
        const { once } = params;
        if (!params || !once) {
            throw new RequireException();
        }
        return this.v2exService.login(params);
    }
}
