import { Injectable } from '@nestjs/common';
import cheerio from 'cheerio';
import { $http } from 'src/common/interceptors/axios.interceptor';
import axios from 'axios';
const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
require('dayjs/locale/zh');
dayjs.locale('zh');
dayjs.extend(relativeTime);

@Injectable()
export class V2exService {
    async urlToBase64(url) {
        try {
            // let url =
            //     'https://cdn.v2ex.com/avatar/fa43/c45c/151618_mini.png?m=1461049772';
            const res = await $http.get(url, {
                responseType: 'arraybuffer'
            });
            return new Promise(resolve => {
                const { status, data } = res;
                if (status !== 200) {
                    resolve(false);
                }
                // const suffix = url.split('.').pop().split('?')[0];
                resolve(`data:image/png;base64,${data.toString('base64')}`);
            });
        } catch (err) {}
    }
    async getHotTopics() {
        try {
            const res = await $http.get('/api/topics/hot.json');
            const { status, data } = res;
            if (status !== 200) {
                return false;
            }
            const len = data.length;
            if (data && len) {
                const list = [];
                let i = 0;
                for (; i < len; i++) {
                    const item = data[i];
                    list.push({
                        id: item.id, // id
                        reply_num: item.replies, // 回复数
                        title: item.title, // 标题
                        last_reply: dayjs(item.last_modified * 1000).fromNow(), // 最后回复时间
                        author: item.member.username, // 作者名
                        avatar: item.member.avatar_mini, // 头像地址
                        tag_value: item.node.name, // node地址
                        tab_name: item.node.title // node名
                    });
                }
                return list;
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    async getTabTopics(tab: string) {
        try {
            const res = await $http.get(`?tab=${tab}`);
            const $ = cheerio.load(res.data);
            const list = $('#Main .box').find($('.item'));
            const len = list.length;
            const data = [];
            let i = 0;
            for (; i < len; i++) {
                const item = $(list[i]);
                const href = item.find($('.topic-link')).attr('href');
                const obj = {
                    id: href.replace(/\/t\/(.*?)#.*/g, '$1'),
                    title: item.find($('.topic-link')).text(),
                    reply_num: item.find($('.count_livid')).text() || 0,
                    tab_name: item.find($('.node')).text(),
                    tag_value: item.find($('.node')).attr('href').split('/')[2],
                    author: item
                        .find($('.topic_info strong'))
                        .first()
                        .children()
                        .text(),
                    avatar: item.find($('.avatar')).attr('src'),
                    last_reply: dayjs(
                        item.find($('.topic_info span')).attr('title')
                    ).fromNow(),
                    replyer: item
                        .find($('.topic_info strong'))
                        .last()
                        .children()
                        .text()
                };
                data.push(obj);
            }
            return data;
        } catch (error) {
            return false;
        }
    }

    async getAllTopics(tab: string, p: string) {
        try {
            const res = await $http.get(`/go/${tab}?p=${p}`);
            const $ = cheerio.load(res.data);
            const header = $('.page-content-header');
            const list = $('#TopicsNode').find($('.cell'));
            const len = list.length;
            const nodeInfo = {
                topic_count: $(header).find($('.topic-count strong')).text(),
                topic_intro: $(header).find($('.intro')).text()
            };
            const data = [];
            let i = 0;
            for (; i < len; i++) {
                const item = $(list[i]);
                const href = item.find($('.topic-link')).attr('href');
                const obj = {
                    id: href.replace(/\/t\/(.*?)#.*/g, '$1'),
                    title: item.find($('.topic-link')).text(),
                    reply_num: item.find($('.count_livid')).text() || 0,
                    author: item
                        .find($('.topic_info strong'))
                        .first()
                        .children()
                        .text(),
                    avatar: item.find($('.avatar')).attr('src'),
                    last_reply: dayjs(
                        item.find($('.topic_info span')).attr('title')
                    ).fromNow(),
                    replyer: item
                        .find($('.topic_info strong'))
                        .last()
                        .children()
                        .text()
                };
                data.push(obj);
            }
            return { data, nodeInfo };
        } catch (error) {
            return false;
        }
    }

    async getTopicDetail(id: string) {
        try {
            const res_detail = await $http.get(
                `/api/topics/show.json?id=${id}`
            );
            const res_detail1 = await $http.get(`/t/${id}`);
            const res_replys = await $http.get(
                `/api/replies/show.json?topic_id=${id}`
            );
            if (res_detail.status !== 200 || res_replys.status !== 200) {
                return false;
            }
            const $ = cheerio.load(res_detail1.data);
            const subtle = $('.subtle');
            if (subtle.length) {
            }
            console.log($('.markdown_body').html());
            console.log(subtle.length);
            const detail = res_detail.data;
            // console.log(detail);
            // console.log(res_detail1.data);
            const replys = res_replys.data;
            const master_id = detail[0].member.id;
            if (replys) {
                const len = replys.length;
                for (let i = 0; i < len; i++) {
                    const item = replys[i];
                    const is_master = item.member.id === master_id;
                    item.user = {
                        is_master,
                        index: i + 1,
                        id: item.member.id,
                        author: item.member.username,
                        last_reply: dayjs(item.last_modified * 1000).fromNow(),
                        avatar: item.member.avatar_mini
                    };
                }
                return { detail, replys };
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    async getLoginParams() {
        try {
            const res = await $http.get('/signin');
            // 拿到cookie列表
            const cookies = res.headers['set-cookie'];
            let cookie = cookies.map(item => {
                return item.split(';')[0];
            });
            // 取到需要的值进行拼装
            cookie = cookie.join(';');
            console.log(cookie);
            const $ = cheerio.load(res.data);
            const formList = $('#Main .box .cell').find($('.sl'));
            const username_key = $(formList[0]).attr('name');
            const password_key = $(formList[1]).attr('name');
            const code_key = $(formList[2]).attr('name');
            const once = $('#Main .box').find($('.super')).prev().attr('value');
            const codeUrl = await this.getCode(once, cookie);
            return {
                username_key,
                password_key,
                code_key,
                once,
                codeUrl,
                cookie
            };
        } catch (error) {
            return false;
        }
    }

    async getCode(once: string, cookie: any) {
        try {
            const res = await $http.get(`/_captcha?once=${once}`, {
                headers: {
                    Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
                    'Accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7',
                    cookie
                },
                responseType: 'arraybuffer'
            });
            return res.data;
        } catch (error) {
            return false;
        }
    }

    async login(params: any) {
        try {
            const { cookie, ...rest } = params;
            const res = await $http.post(`/signin`, null, {
                params: rest,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Origin: 'https://www.v2ex.com/',
                    Referer: 'https://www.v2ex.com/signin',
                    cookie
                },
                maxRedirects: 0,
                validateStatus: function (status) {
                    return status >= 200 && status <= 303;
                }
            });
            // 拿到cookie列表
            let cookies = res.headers['set-cookie'];
            console.log(cookies);
            cookies = cookies.map(item => {
                return item.split(';')[0];
            });
            return cookies[0];
        } catch (error) {
            return false;
        }
    }

    async getTopTagConfig() {
        try {
            const res = await axios.get(
                'https://bt.todayhub.cn/down/MM4G776fimCL'
            );
            const { status, data } = res;
            if (status !== 200) {
                return false;
            }
            return Object.values(data);
        } catch (error) {
            return false;
        }
    }

    async getUserInfo(params: any) {
        try {
            const res = await $http.get(`/member/${params.username}`, {
                headers: { cookie: params.cookie }
            });
            console.log(res);
            return res.data;
        } catch (error) {
            return false;
        }
    }
}
