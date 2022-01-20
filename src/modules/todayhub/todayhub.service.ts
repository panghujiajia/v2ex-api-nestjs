import { Injectable } from '@nestjs/common';
import { $thirdHop } from '../../common/interceptors/axios.interceptor';

@Injectable()
export class TodayhubService {
    async getThirdData() {
        try {
            const res = await $thirdHop.get(`/list?type=0`);
            const { status, data } = res.data;
            if (status == 100000) {
                return data;
            }
            return [];
        } catch (error) {
            return false;
        }
    }
    async getThirdDataById(id) {
        try {
            const res = await $thirdHop.get(`/item?id=${id}`);
            const {
                status,
                data: { list }
            } = res.data;
            if (status == 100000) {
                return list;
            }
            return [];
        } catch (error) {
            return false;
        }
    }
}
