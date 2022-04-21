import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable()
export class AppService {
    private token = 'eyUPCrhc15Rtn0Z';

    getHello(): string {
        return 'Hello World!';
    }

    checkSignature(params) {
        const { signature, timestamp, nonce, echostr } = params;
        const token = this.token;
        let sortArr = [token, timestamp, nonce].sort();
        let str = sortArr.join('');
        let hash = createHash('sha1');
        str = hash.update(str).digest('hex');
        if (str === signature) {
            return echostr;
        }
        return false;
    }
}
