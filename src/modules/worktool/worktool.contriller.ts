import { Controller, Post } from '@nestjs/common';
import { WorktoolService } from './worktool.service';

@Controller('worktool')
export class WorktoolContriller {
    constructor(private worktool: WorktoolService) {}

    @Post('/thirdQa')
    private getThirdQa() {
        return this.worktool.getThirdQa();
    }
}
