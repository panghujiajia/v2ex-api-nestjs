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
    //图片链接转base64
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
    //热门帖子
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
                        last_reply_time: this.formatTime(
                            item.last_modified * 1000
                        ), // 最后回复时间
                        author: item.member.username, // 作者名
                        avatar: item.member.avatar_mini, // 头像地址
                        tag_link: item.node.name, // node地址
                        tag_name: item.node.title // node名
                    });
                }
                return list;
            }
            return false;
        } catch (error) {
            return false;
        }
    }
    //根据节点获取最新帖子
    async getTabTopics(tab: string) {
        try {
            const res = await $http.get(`?tab=${tab}`);
            const $ = cheerio.load(res.data);
            const list = $('#Main .box').find($('.item'));
            const data = [];
            list.each((i, el) => {
                const href = $(el).find($('.topic-link')).attr('href');
                const obj = {
                    id: href.replace(/\/t\/(.*?)#.*/g, '$1'),
                    title: $(el).find($('.topic-link')).text(),
                    reply_num: $(el).find($('.count_livid')).text() || 0,
                    tag_name: $(el).find($('.node')).text(),
                    tag_link: $(el).find($('.node')).attr('href').split('/')[2],
                    author: $(el)
                        .find($('.topic_info strong'))
                        .first()
                        .children()
                        .text(),
                    avatar: $(el).find($('.avatar')).attr('src'),
                    last_reply_time: this.formatTime(
                        $(el).find($('.topic_info span')).attr('title')
                    ),
                    replyer: $(el)
                        .find($('.topic_info strong'))
                        .last()
                        .children()
                        .text()
                };
                data.push(obj);
            });
            return data;
        } catch (error) {
            return false;
        }
    }
    //根据节点获取节点下的全部帖子
    async getAllTopics(tab: string, p: string) {
        try {
            const res = await $http.get(`/go/${tab}?p=${p}`);
            const $ = cheerio.load(res.data);
            const header = $('.page-content-header');
            const list = $('#TopicsNode').find($('.cell'));
            const nodeInfo = {
                topic_count: $(header).find($('.topic-count strong')).text(),
                topic_intro: $(header).find($('.intro')).text()
            };
            const data = [];
            list.each((i, el) => {
                const href = $(el).find($('.topic-link')).attr('href');
                const obj = {
                    id: href.replace(/\/t\/(.*?)#.*/g, '$1'),
                    title: $(el).find($('.topic-link')).text(),
                    reply_num: $(el).find($('.count_livid')).text() || 0,
                    author: $(el)
                        .find($('.topic_info strong'))
                        .first()
                        .children()
                        .text(),
                    avatar: $(el).find($('.avatar')).attr('src'),
                    last_reply_time: this.formatTime(
                        $(el).find($('.topic_info span')).attr('title')
                    ),
                    replyer: $(el)
                        .find($('.topic_info strong'))
                        .last()
                        .children()
                        .text()
                };
                data.push(obj);
            });
            return { data, nodeInfo };
        } catch (error) {
            return false;
        }
    }
    //根据id获取帖子详情
    async getTopicDetail(id: string) {
        try {
            const res_detail = await $http.get(
                `/api/topics/show.json?id=${id}`
            );
            const res_replys = await $http.get(
                `/api/replies/show.json?topic_id=${id}`
            );
            if (res_detail.status !== 200 || res_replys.status !== 200) {
                return false;
            }
            const detail = res_detail.data;
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
                        last_reply: this.formatTime(item.last_modified * 1000),
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
    formatTime(time: string | number) {
        return dayjs(time).fromNow();
    }
    //根据id获取帖子详情
    async getTopicDetail1(params: { id: string; p: string }) {
        try {
            const res = await $http.get(`/t/${params.id}?p=${params.p}`);
            const $ = cheerio.load(res.data);
            const box = $('#Main .box');
            let id = params.id,
                avatar,
                title,
                content,
                author,
                publish_time,
                tag_name,
                tag_link,
                subtle_list = [],
                reply_num,
                last_reply_time,
                page,
                reply_list = [];
            if (Number(params.p) === 1) {
                title = $(box).first().find('.header h1').text();
                author = $(box).first().find('.header .gray a').text();
                publish_time = this.formatTime(
                    $(box).first().find('.header .gray span').attr('title')
                );
                tag_name = $(box)
                    .first()
                    .find('.header .chevron')
                    .next()
                    .text();
                tag_link = $(box)
                    .first()
                    .find('.header .chevron')
                    .next()
                    .attr('href')
                    .split('/')[2];
                const subtle = $(box).first().find('.subtle');
                if (subtle.length) {
                    subtle.each((i, el) => {
                        const obj = {
                            time: this.formatTime(
                                $(el).find($('.fade span')).attr('title')
                            ),
                            content: $(el).find($('.topic_content')).html()
                        };
                        subtle_list.push(obj);
                    });
                }
                content = $(box).first().find('.cell .topic_content').html();
                const reply_info = $(box)
                    .eq(1)
                    .find('.cell')
                    .first()
                    .find('.gray')
                    .text()
                    .split(' 条回复  •  ');
                reply_num = reply_info[0];
                last_reply_time = this.formatTime(reply_info[1]);
                page = $(box)
                    .eq(1)
                    .find('.cell .page_input')
                    .first()
                    .parent()
                    .find('a').length;
            }
            avatar = $(box).first().find('.avatar').attr('src');
            const reply_content = $(box)
                .eq(1)
                .find('.cell')
                .not((i, el) => !$(el).attr('id'));

            reply_content.each((i, el) => {
                const obj = {
                    author: $(el).find('.dark').text(),
                    avatar: $(el).find('.avatar').attr('src'),
                    is_master: author == $(el).find('.dark').text(),
                    reply_time: this.formatTime(
                        $(el).find('.ago').attr('title')
                    ),
                    like_num: $(el).find('.fade').text().trim(),
                    content: $(el).find('.reply_content').html()
                };
                reply_list.push(obj);
            });
            return {
                id,
                avatar,
                title,
                content,
                author,
                publish_time,
                tag_name,
                tag_link,
                subtle_list,
                reply_num,
                last_reply_time,
                page,
                reply_list
            };
        } catch (error) {
            return false;
        }
    }
    //获取登录参数
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
    //获取验证码
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
    //登录
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
            cookies = cookies.map(item => {
                return item.split(';')[0];
            });
            return cookies[0];
        } catch (error) {
            return false;
        }
    }
    //获取热门节点列表
    async getTopTagConfig() {
        try {
            const res = await axios.get(
                'https://cdn.todayhub.cn/lib/config-tag-top.json'
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
    //获取全部节点列表
    async getAllTagConfig() {
        try {
            const res = await $http.get('');
            const $ = cheerio.load(res.data);
            const box = $('#Main .box');
            const cells = $(box).last().find('.cell');
            const hot = $('.cell>.item_node');
            const data = {
                最热节点: []
            };
            hot.each((i, el) => {
                const title = $(el).text();
                const value = $(el).attr('href').split('/')[2];
                const obj = {
                    title,
                    value
                };
                data['最热节点'].push(obj);
            });
            cells.each((i, el) => {
                if (i !== 0) {
                    const classify = $(el).find('table .fade').text();
                    const as = $(el).find('table a');
                    as.each((i, el) => {
                        const title = $(el).text();
                        const value = $(el).attr('href').split('/')[2];
                        const obj = {
                            title,
                            value
                        };
                        if (data[classify]) {
                            data[classify].push(obj);
                        } else {
                            data[classify] = [obj];
                        }
                    });
                }
            });
            return data;
        } catch (error) {
            return false;
        }
    }
    //获取用户信息
    async getUserInfo(params: any) {
        try {
            const res = await $http.get(`/member/${params.username}`, {
                headers: { cookie: params.cookie }
            });
            const $ = cheerio.load(res.data);
            const box = $('#Main .box');
            const avatar_src = $(box).first().find('.avatar').attr('src');
            const avatar = await this.urlToBase64(avatar_src);
            const info = $(box).first().find('.gray').text();
            return { avatar, info };
        } catch (error) {
            return false;
        }
    }
    //获取用户主题
    async getUserTopics(params: any) {
        try {
            const res = await $http.get(`/member/${params.username}/topics`, {
                headers: { cookie: params.cookie }
            });
            const $ = cheerio.load(res.data);
            const box = $('#Main .box');
            const list = $(box).find($('.item'));
            const data = [];
            list.each((i, el) => {
                const href = $(el).find($('.topic-link')).attr('href');
                const obj = {
                    id: href.replace(/\/t\/(.*?)#.*/g, '$1'),
                    title: $(el).find($('.topic-link')).text(),
                    reply_num: $(el).find($('.count_orange')).text() || 0,
                    tag_name: $(el).find($('.node')).text(),
                    tag_link: $(el).find($('.node')).attr('href').split('/')[2],
                    author: $(el)
                        .find($('.topic_info strong'))
                        .first()
                        .children()
                        .text(),
                    avatar: $('.avatar').attr('src'),
                    last_reply_time: this.formatTime(
                        $(el).find($('.topic_info span')).attr('title')
                    ),
                    replyer: $(el)
                        .find($('.topic_info strong'))
                        .last()
                        .children()
                        .text()
                };
                data.push(obj);
            });
            return data;
        } catch (error) {
            return false;
        }
    }
    //用户签到信息
    async getLoginRewardInfo(cookie: string) {
        try {
            const res = await $http.get('/mission/daily', {
                headers: { cookie }
            });
            const $ = cheerio.load(res.data);
            const btn_value = $('#Main .box .cell').eq(1).find('.button').val();
            const sign_in_day = $('#Main .box .cell').last().text();
            const once = $('.light-toggle').attr('href').split('?')[1];
            let is_sign_in = false;
            if (btn_value !== '领取 X 铜币') {
                is_sign_in = true;
            }
            return {
                is_sign_in,
                sign_in_day,
                once
            };
        } catch (error) {
            return false;
        }
    }
    //获取签到用的cookie
    async getV2exTabCookie() {
        const res = await $http.get('?tab=nodes');
        let cookies = res.headers['set-cookie'];
        cookies = cookies.map(item => {
            return item.split(';')[0];
        });
        return cookies.find(item => item.indexOf('V2EX_TAB') > -1);
    }
    //签到方法
    async getLoginReward(cookie: string) {
        try {
            const res = await this.getLoginRewardInfo(cookie);
            if (res) {
                let { is_sign_in, once, sign_in_day } = res;
                // 没签到
                if (!is_sign_in) {
                    const V2EX_TAB = await this.getV2exTabCookie();
                    const data = await $http.get(
                        `/mission/daily/redeem?${once}`,
                        {
                            headers: {
                                cookie: cookie + ';' + V2EX_TAB,
                                Referer: 'https://www.v2ex.com/mission/daily',
                                'User-Agent':
                                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36'
                            }
                        }
                    );
                    const $ = cheerio.load(data.data);
                    const btn_value = $('#Main .box .cell')
                        .eq(1)
                        .find('.button')
                        .val();
                    if (btn_value === '查看我的账户余额') {
                        sign_in_day = $('#Main .box .cell').last().text();
                        is_sign_in = true;
                    }
                }
                return { sign_in_day, is_sign_in };
            }
            return false;
        } catch (error) {
            return false;
        }
    }
}
