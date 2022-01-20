import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TodayhubService {
    async getThirdData() {
        try {
            const res = await axios.get(
                `https://momoyu.cc/api/hot/list?type=0`
            );
            const { status, data } = res;
            if (status === 100000) {
                return data;
            }
            return [];
        } catch (error) {
            return false;
        }
    }
}
