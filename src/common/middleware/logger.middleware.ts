import { Injectable, NestMiddleware } from '@nestjs/common';

const dayjs = require('dayjs');
require('dayjs/locale/zh');
dayjs.locale('zh');
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void) {
        const { method, path, body, query, params } = req;
        console.log(`访问时间：${dayjs().format('YYYY-MM-DD HH:mm:ss')}`);
        console.log(`接口地址：${method} ${path}`);
        if (path) {
            console.log(`path参数：${path}`);
        }
        if (JSON.stringify(body) !== '{}') {
            console.log(`body参数：${JSON.stringify(body)}`);
        }
        if (JSON.stringify(query) !== '{}') {
            console.log(`query参数：${JSON.stringify(query)}`);
        }
        if (JSON.stringify(params) !== '{}') {
            console.log(`params参数：${JSON.stringify(params)}`);
        }
        next();
    }
}
