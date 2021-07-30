"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.V2exService = void 0;
const common_1 = require("@nestjs/common");
const cheerio_1 = require("cheerio");
const axios_interceptor_1 = require("../../common/axios.interceptor");
const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
require('dayjs/locale/zh');
dayjs.locale('zh');
dayjs.extend(relativeTime);
let V2exService = class V2exService {
    async getHotTopics() {
        try {
            const res = await axios_interceptor_1.$http.get('/api/topics/hot.json');
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
                        id: item.id,
                        reply_num: item.replies,
                        title: item.title,
                        last_reply: dayjs(item.last_modified * 1000).fromNow(),
                        author: item.member.username,
                        avatar: item.member.avatar_mini,
                        tag_value: item.node.name,
                        tab_name: item.node.title,
                    });
                }
                return list;
            }
            return false;
        }
        catch (error) {
            return false;
        }
    }
    async getTabTopics(tab) {
        try {
            const res = await axios_interceptor_1.$http.get(`?tab=${tab}`);
            const $ = cheerio_1.default.load(res.data);
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
                    author: item.find($('.topic_info strong')).first().children().text(),
                    avatar: item.find($('.avatar')).attr('src'),
                    last_reply: dayjs(item.find($('.topic_info span')).attr('title')).fromNow(),
                    replyer: item.find($('.topic_info strong')).last().children().text(),
                };
                data.push(obj);
            }
            return data;
        }
        catch (error) {
            return false;
        }
    }
    async getAllTopics(tab, p) {
        try {
            const res = await axios_interceptor_1.$http.get(`/go/${tab}?p=${p}`);
            const $ = cheerio_1.default.load(res.data);
            const header = $('.page-content-header');
            const list = $('#TopicsNode').find($('.cell'));
            const len = list.length;
            const nodeInfo = {
                topic_count: $(header).find($('.topic-count strong')).text(),
                topic_intro: $(header).find($('.intro')).text(),
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
                    author: item.find($('.topic_info strong')).first().children().text(),
                    avatar: item.find($('.avatar')).attr('src'),
                    last_reply: dayjs(item.find($('.topic_info span')).attr('title')).fromNow(),
                    replyer: item.find($('.topic_info strong')).last().children().text(),
                };
                data.push(obj);
            }
            return { data, nodeInfo };
        }
        catch (error) {
            return false;
        }
    }
    async getTopicDetail(id) {
        try {
            const res_detail = await axios_interceptor_1.$http.get(`/api/topics/show.json?id=${id}`);
            const res_replys = await axios_interceptor_1.$http.get(`/api/replies/show.json?topic_id=${id}`);
            const data = await Promise.all([res_detail.data, res_replys.data]);
            if (data && data.length) {
                const detail_res = data[0];
                const replys_res = data[1];
                if (detail_res.status !== 200 || replys_res.status !== 200) {
                    return false;
                }
                const detail = detail_res.data;
                const replys = replys_res.data;
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
                            avatar: item.member.avatar_mini,
                        };
                    }
                    return { detail, replys };
                }
            }
            return false;
        }
        catch (error) {
            return false;
        }
    }
    async getLoginParams() {
        try {
            const res = await axios_interceptor_1.$http.get('/signin');
            const cookies = res.headers['set-cookie'];
            let cookie = cookies.map((item) => {
                return item.split(';')[0];
            });
            cookie = cookie.join(';');
            const $ = cheerio_1.default.load(res.data);
            const formList = $('#Main .box .cell').find($('.sl'));
            const username_key = $(formList[0]).attr('name');
            const password_key = $(formList[1]).attr('name');
            const code_key = $(formList[2]).attr('name');
            const once = $('#Main .box').find($('.super')).prev().attr('value');
            const codeUrl = await this.getCode(once, cookie);
            return { username_key, password_key, code_key, once, codeUrl, cookie };
        }
        catch (error) {
            return false;
        }
    }
    async getCode(once, cookie) {
        try {
            const res = await axios_interceptor_1.$http.get(`/_captcha?once=${once}`, {
                headers: {
                    Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
                    'Accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7',
                    cookie,
                },
                responseType: 'arraybuffer',
            });
            return res.data;
        }
        catch (error) {
            return false;
        }
    }
    async login(params) {
        try {
            const { cookie } = params, rest = __rest(params, ["cookie"]);
            const res = await axios_interceptor_1.$http.post(`/signin`, null, {
                params: rest,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Origin: 'https://v2ex.com/',
                    Referer: 'https://v2ex.com/signin',
                },
            });
            return res.data;
        }
        catch (error) {
            return false;
        }
    }
};
V2exService = __decorate([
    common_1.Injectable()
], V2exService);
exports.V2exService = V2exService;
//# sourceMappingURL=v2ex.service.js.map