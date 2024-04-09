import {Body, Controller, Get, Headers, Param, Post, Res, UseGuards, UseInterceptors} from '@nestjs/common';
import {RequireException} from 'src/common/exception/required.exception';
import {V2exService} from './v2ex.service';
import {AuthGuard} from '../../common/guard/auth.guard';
import {TransformInterceptor} from '../../common/interceptors/transform.interceptor';

@UseInterceptors(TransformInterceptor)
@Controller('v2ex')
export class V2exController {
    constructor(private v2ex: V2exService) {
    }

    // avatar md5
    @Get('/AACA0F5EB4D2D98A6CE6DFFA99F8254B/:url')
    private async getAvatar(@Param('url') url: string, @Res() res: Response) {
        if (!url) {
            throw new RequireException();
        }
        return this.v2ex.getAvatar(url, res);
    }

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
        @Headers('token') token: string
    ) {
        if (!tab || !p) {
            throw new RequireException();
        }
        return this.v2ex.getAllTopics({tab, p, token});
    }

    @Get('/topics/detail/:id/:p')
    private getTopicDetail(
        @Param('id') id: string,
        @Param('p') p: string,
        @Headers('token') token: string
    ) {
        if (!id || !p) {
            throw new RequireException();
        }
        return this.v2ex.getTopicDetail({id, p, token});
    }

    @Get('/login/params')
    private getLoginParams() {
        return this.v2ex.getLoginParams();
    }

    @Post('/login')
    private login(@Body() params: any) {
        const {once} = params;
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
    private getAllTagConfig(@Headers('token') token: string) {
        return this.v2ex.getAllTagConfig(token);
    }

    @Get('/member/:username')
    @UseGuards(AuthGuard)
    private getUserInfo(
        @Param('username') username: string,
        @Headers('token') token: string
    ) {
        if (!username) {
            throw new RequireException();
        }
        return this.v2ex.getUserInfo({username, token});
    }

    @Get('/member/:username/topics/:p')
    private getUserTopics(
        @Param('username') username: string,
        @Param('p') p: string,
        @Headers('token') token: string
    ) {
        if (!username || !p) {
            throw new RequireException();
        }
        return this.v2ex.getUserTopics({username, token, p});
    }

    @Get('/member/:username/replies/:p')
    private getUserReply(
        @Param('username') username: string,
        @Param('p') p: string,
        @Headers('token') token: string
    ) {
        if (!username || !p) {
            throw new RequireException();
        }
        return this.v2ex.getUserReply({username, token, p});
    }

    @Get('/message/:p')
    private getUserMessage(
        @Param('p') p: string,
        @Headers('token') token: string
    ) {
        if (!p) {
            throw new RequireException();
        }
        return this.v2ex.getUserMessage({token, p});
    }

    @Get('/mission/daily')
    @UseGuards(AuthGuard)
    private getLoginRewardInfo(@Headers('token') token: string) {
        return this.v2ex.getLoginRewardInfo(token);
    }

    @Post('/mission/daily')
    @UseGuards(AuthGuard)
    private getLoginReward(@Headers('token') token: string) {
        return this.v2ex.getLoginReward(token);
    }

    @Get('/balance')
    @UseGuards(AuthGuard)
    private getUserBalance(@Headers('token') token: string) {
        return this.v2ex.getUserBalance(token);
    }

    @Get('/notifications')
    @UseGuards(AuthGuard)
    private getUserNotifications(@Headers('token') token: string) {
        return this.v2ex.getUserNotifications(token);
    }

    @Post('/t')
    private replyTopic(@Body() params: any, @Headers('token') token: string) {
        const {once, content, id} = params;
        if (!content || !once || !id) {
            throw new RequireException();
        }
        return this.v2ex.replyTopic({...params, token});
    }
}
