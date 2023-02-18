import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { TodayhubService } from './todayhub.service';
import { RequireException } from '../../common/exception/required.exception';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';

@UseInterceptors(TransformInterceptor)
@Controller('todayhub')
export class TodayhubController {
    constructor(private todayhub: TodayhubService) {}

    @Get('')
    private getThirdData() {
        return this.todayhub.getThirdData();
    }

    @Get('/item/:id')
    private getThirdDataById(@Param('id') id: string) {
        if (!id) {
            throw new RequireException();
        }
        return this.todayhub.getThirdDataById(id);
    }
}
