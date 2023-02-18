import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { WorktoolService } from './worktool.service';

@Controller('worktool')
export class WorktoolController {
    constructor(private worktool: WorktoolService) {}

    @Get('')
    private init() {
        return 'worktool success';
    }

    // 基础
    @Post('/thirdQa')
    @HttpCode(200)
    private getThirdQa(@Body() params: any) {
        return this.worktool.getThirdQa(params);
    }

    // 私聊
    @Post('/thirdQa/private/chat')
    @HttpCode(200)
    private getThirdQaPrivateChat(@Body() params: any) {
        return this.worktool.getThirdQaPrivateChat(params);
    }

    // 群聊
    @Post('/thirdQa/group/chat')
    @HttpCode(200)
    private getThirdQaGroupChat(@Body() params: any) {
        return this.worktool.getThirdQaGroupChat(params);
    }

    // 指令
    @Post('/thirdQa/instruction/chat')
    @HttpCode(200)
    private getThirdQaInstructionChat(@Body() params: any) {
        return this.worktool.getThirdQaInstructionChat(params);
    }
}
