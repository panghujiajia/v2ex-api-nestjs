import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TodayhubService {
    async getThirdData() {
        try {
            const res = await axios.get(
                `https://momoyu.cc/api/hot/list?type=0`
            );
            return res.data;
        } catch (error) {
            return false;
        }
    }
}
