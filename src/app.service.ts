import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { $http } from './common/interceptors/axios.interceptor';

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
    async getAccessToken() {
        const data: any = await $http.get(
            'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx3f56c5b9471bde01&secret=2455337806e715bfafceda9c53485078'
        );
        console.log(data);
        const { access_token } = data.data;
        return access_token;
    }
    async getWxSubscribeData(params) {
        console.log('=================================', params);
        // const access_token = await this.getAccessToken();
        const access_token =
            '56_aueJinB0cAU9vaGDCF0RncLHouQ0BoN_lbowWuJhdqmuccdgaf80ul9q0S788ylwPsS4gt5DBvxp2URO4CDOq3jEFFlQSS41txTvrYUXv_395wKJr2vKvgKnG0wAnz-5vg4aku6s3Lks_PyiAFFjADASXX';
        console.log('=================================', access_token);
        const req = {
            touser: 'oC6n-0Bp2xE2M0adEQyggHnfCRog',
            template_id: 'sl1-Uo9R6udJ5ve3NsoAFbfjW38KW66b88NVAbMaAs8',
            page: 'pages/Hot',
            data: {
                thing5: {
                    value: '今日热榜'
                },
                date4: {
                    value: '2015年01月05日'
                }
            }
        };
        await $http.post(
            `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${access_token}`,
            req
        );
        return 'success';
    }
}
