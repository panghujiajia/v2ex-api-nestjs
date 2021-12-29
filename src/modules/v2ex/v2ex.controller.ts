import {
    Body,
    Controller,
    Get,
    Headers,
    Param,
    Post,
    UseGuards
} from '@nestjs/common';
import { RequireException } from 'src/common/exception/required.exception';
import { V2exService } from './v2ex.service';
import { AuthGuard } from '../../common/guard/auth.guard';

@Controller('v2ex')
export class V2exController {
    constructor(private v2ex: V2exService) {}

    @Get('/topics/tab/:tab')
    private getTabTopics(@Param('tab') tab: string) {
        if (!tab) {
            throw new RequireException();
        }
        if (tab === 'top') {
            return this.v2ex.getHotTopics();
        }
        return this.v2ex.getTabTopics(tab);
    }

    @Get('/topics/all/:tab/:p')
    private getAllTopics(
        @Param('tab') tab: string,
        @Param('p') p: string,
        @Headers('cookie') cookie: string
    ) {
        if (!tab || !p) {
            throw new RequireException();
        }
        return this.v2ex.getAllTopics({ tab, p, cookie });
    }

    @Get('/topics/detail/:id/:p')
    private getTopicDetail(
        @Param('id') id: string,
        @Param('p') p: string,
        @Headers('cookie') cookie: string
    ) {
        if (!id || !p) {
            throw new RequireException();
        }
        return this.v2ex.getTopicDetail1({ id, p, cookie });
    }

    @Get('/login/params')
    private getLoginParams() {
        return this.v2ex.getLoginParams();
    }

    @Post('/login')
    private login(@Body() params: any) {
        const { once } = params;
        if (!params || !once) {
            throw new RequireException();
        }
        return this.v2ex.login(params);
    }

    @Get('/config/v2ex')
    private getV2exConfig() {
        return this.v2ex.getV2exConfig();
    }

    @Get('/config/tag/all')
    private getAllTagConfig() {
        return this.v2ex.getAllTagConfig();
    }

    @Get('/member/:username')
    @UseGuards(AuthGuard)
    private getUserInfo(
        @Param('username') username: string,
        @Headers('cookie') cookie: string
    ) {
        if (!username) {
            throw new RequireException();
        }
        return this.v2ex.getUserInfo({ username, cookie });
    }

    @Get('/member/:username/topics/:p')
    private getUserTopics(
        @Param('username') username: string,
        @Param('p') p: string,
        @Headers('cookie') cookie: string
    ) {
        if (!username || !p) {
            throw new RequireException();
        }
        return this.v2ex.getUserTopics({ username, cookie, p });
    }

    @Get('/member/:username/replies/:p')
    private getUserReply(
        @Param('username') username: string,
        @Param('p') p: string,
        @Headers('cookie') cookie: string
    ) {
        if (!username || !p) {
            throw new RequireException();
        }
        return this.v2ex.getUserReply({ username, cookie, p });
    }

    @Get('/mission/daily')
    @UseGuards(AuthGuard)
    private getLoginRewardInfo(@Headers('cookie') cookie: string) {
        return this.v2ex.getLoginRewardInfo(cookie);
    }

    @Post('/mission/daily')
    @UseGuards(AuthGuard)
    private getLoginReward(@Headers('cookie') cookie: string) {
        return this.v2ex.getLoginReward(cookie);
    }

    @Get('/balance')
    @UseGuards(AuthGuard)
    private getUserBalance(@Headers('cookie') cookie: string) {
        return this.v2ex.getUserBalance(cookie);
    }

    @Get('/notifications')
    @UseGuards(AuthGuard)
    private getUserNotifications(@Headers('cookie') cookie: string) {
        return this.v2ex.getUserNotifications(cookie);
    }
}
