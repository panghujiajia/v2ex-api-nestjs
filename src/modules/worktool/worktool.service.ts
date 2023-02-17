import { Injectable } from '@nestjs/common';

@Injectable()
export class WorktoolService {
    async getThirdQa() {
        try {
            return {
                code: 0,
                message: '回调成功',
                data: {
                    type: 0,
                    info: {
                        text: '回复内容：你好'
                    }
                }
            };
        } catch (error) {
            return {
                code: -1,
                message: '回调失败',
                data: {
                    type: 0,
                    info: {
                        text: ''
                    }
                }
            };
        }
    }
}
