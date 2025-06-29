import {Injectable} from '@nestjs/common';
import cheerio from 'cheerio';
import {$http} from 'src/common/interceptors/axios.interceptor';
import axios from 'axios';
import {marked} from 'marked';
var TurndownService = require('turndown')

var turndownService = new TurndownService()

const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
require('dayjs/locale/zh');
dayjs.locale('zh');
dayjs.extend(relativeTime);

const changeImgUrl = (url: string) => {
    // 1.	Base64 编码的结果可能含有不适合在 URL 中使用的字符，通常需要进行额外的处理。
	// 2.	encodeURIComponent 会将 +, /, = 等字符进一步编码，导致服务器可能解码失败。
    const buff = Buffer.from(url, 'utf-8');
    let base64Url = buff.toString('base64');
    base64Url = base64Url.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');  // URL安全的Base64
    url = encodeURIComponent(base64Url);
    return 'https://api.todayhub.cn/v2ex/AACA0F5EB4D2D98A6CE6DFFA99F8254B/' + url;
};

@Injectable()
export class V2exService {
    // 修复HTML中缺少协议前缀的链接，并处理图片链接
    private fixProtocolMissingLinks(html: string): string {
        if (!html) return html;
        
        // 修复img标签中的src属性 (//domain -> https://domain)
        html = html.replace(/src=["']\/\/([^"']+)["']/g, 'src="https://$1"');
        
        // 修复a标签中的href属性 (//domain -> https://domain)
        html = html.replace(/href=["']\/\/([^"']+)["']/g, 'href="https://$1"');
        
        return html;
    }

    // 处理转换后的Markdown，去掉图片外层的链接
    private removeImageLinks(markdown: string): string {
        if (!markdown) return markdown;
        
        // 匹配并替换 [![](img_url)](link_url "title") 为 ![](img_url)
        // 也处理带alt text的情况: [![alt](img_url)](link_url "title") 为 ![alt](img_url)
        markdown = markdown.replace(/\[!\[([^\]]*)\]\(([^)]+)\)\]\([^)]+(?:\s+"[^"]*")?\)/g, '![$1]($2)');
        
        return markdown;
    }

    //图片链接转base64
    async urlToBase64(url: string) {
        try {
            // let url =
            //     'https://cdn.v2ex.com/avatar/fa43/c45c/151618_mini.png?m=1461049772';
            const res = await $http.get(url, {
                responseType: 'arraybuffer'
            });
            return new Promise(resolve => {
                const {status, data} = res;
                if (status !== 200) {
                    resolve(false);
                }
                // const suffix = url.split('.').pop().split('?')[0];
                resolve(`data:image/png;base64,${data.toString('base64')}`);
            });
        } catch (err) {
        }
    }

    // 获取图片
    async getAvatar(url: any, res: Response) {
        try {
            const buff = Buffer.from(url, 'base64');
            url = buff.toString('utf-8');
            url = decodeURIComponent(url);
            const response = await $http.get(url, {
                responseType: 'stream',
            });
            return response.data.pipe(res);
        } catch (error) {
            return false;
        }
    }

    //热门帖子
    async getHotTopics() {
        try {
            const res = await $http.get('/api/topics/hot.json');
            const {status, data} = res;
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
                        avatar: changeImgUrl(item.member.avatar_mini), // 头像地址
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
            const list = $('#Main .box').find('.item');
            const data = [];
            list.each((i, el) => {
                const href = $(el).find('.topic-link').attr('href');
                const obj = {
                    id: href.replace(/\/t\/(.*?)#.*/g, '$1'),
                    title: $(el).find('.topic-link').text(),
                    reply_num:
                        $(el).find('.count_livid').text() ||
                        $(el).find('.count_orange').text() ||
                        0,
                    tag_name: $(el).find('.node').text(),
                    tag_link: $(el).find('.node').attr('href').split('/')[2],
                    author: $(el)
                        .find('.topic_info strong')
                        .first()
                        .children()
                        .text(),
                    avatar: changeImgUrl($(el).find('.avatar').attr('src')),
                    last_reply_time: this.formatTime(
                        $(el).find('.topic_info span').attr('title')
                    ),
                    replyer: $(el)
                        .find('.topic_info strong')
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
    async getAllTopics(params: any) {
        try {
            const res = await $http.get(`/go/${params.tab}?p=${params.p}`, {
                headers: {cookie: params.token || ''}
            });
            const $ = cheerio.load(res.data);
            const header = $('.page-content-header');
            const list = $('#TopicsNode').find('.cell');
            const nodeInfo = {
                topic_count: $(header).find('.topic-count strong').text().replace(/,/g, ''),
                topic_intro: $(header).find('.intro').text(),
                topic_title: $(header)
                    .find('.node-breadcrumb')
                    .text()
                    .split('›')
                    .pop()
                    .trim()
            };
            const data = [];
            list.each((i, el) => {
                const href = $(el).find('.topic-link').attr('href');
                const obj = {
                    id: href.replace(/\/t\/(.*?)#.*/g, '$1'),
                    title: $(el).find('.topic-link').text(),
                    reply_num:
                        $(el).find('.count_livid').text() ||
                        $(el).find('.count_orange').text() ||
                        0,
                    author: $(el)
                        .find('.topic_info strong')
                        .first()
                        .children()
                        .text(),
                    avatar: changeImgUrl($(el).find('.avatar').attr('src')),
                    last_reply_time: this.formatTime(
                        $(el).find('.topic_info span').attr('title')
                    ),
                    replyer: $(el)
                        .find('.topic_info strong')
                        .last()
                        .children()
                        .text()
                };
                data.push(obj);
            });
            return {list: data,total: Number(nodeInfo.topic_count) || 0,  detail: nodeInfo};
        } catch (error) {
            return false;
        }
    }

    //根据id获取帖子详情（官方接口）
    // async getTopicDetail(id: string) {
    //     try {
    //         const res_detail = await $http.get(
    //             `/api/topics/show.json?id=${id}`
    //         );
    //         const res_replys = await $http.get(
    //             `/api/replies/show.json?topic_id=${id}`
    //         );
    //         if (res_detail.status !== 200 || res_replys.status !== 200) {
    //             return false;
    //         }
    //         const detail = res_detail.data;
    //         const replys = res_replys.data;
    //         const master_id = detail[0].member.id;
    //         if (replys) {
    //             const len = replys.length;
    //             for (let i = 0; i < len; i++) {
    //                 const item = replys[i];
    //                 const is_master = item.member.id === master_id;
    //                 item.user = {
    //                     is_master,
    //                     index: i + 1,
    //                     id: item.member.id,
    //                     author: item.member.username,
    //                     last_reply: this.formatTime(item.last_modified * 1000),
    //                     avatar: changeImgUrl(item.member.avatar_mini)
    //                 };
    //             }
    //             return {detail, replys};
    //         }
    //         return false;
    //     } catch (error) {
    //         return false;
    //     }
    // }

    formatTime(time: string | number) {
        return dayjs(time).fromNow();
    }

    //根据id获取帖子详情
    async getTopicDetail(params: any) {
        try {
            // 获取第一页内容
            const firstPageResult = await this.getTopicDetailPage(params.id, 1, params.token);
            console.log("🚀 ~ V2exService ~ getTopicDetail ~ firstPageResult:", firstPageResult)
            if (!firstPageResult) {
                return false;
            }

            const { detail, total, list: firstPageReplies } = firstPageResult;
            
            // 计算总页数 (V2EX每页100条回复，total就是从reply_num解析出来的总回复数)
            const totalPages = Math.ceil(total / 100);
            
            // 如果只有一页，直接返回
            if (totalPages <= 1) {
                return {
                    detail,
                    total,
                    list: firstPageReplies
                };
            }

            // 获取其余页面的回复
            const pagePromises = [];
            for (let page = 2; page <= totalPages; page++) {
                pagePromises.push(this.getTopicDetailPage(params.id, page, params.token));
            }

            const otherPagesResults = await Promise.all(pagePromises);
            
            // 合并所有页面的回复
            let allReplies = [...firstPageReplies];
            for (const pageResult of otherPagesResults) {
                if (pageResult && pageResult.list) {
                    allReplies = allReplies.concat(pageResult.list);
                }
            }

            return {
                detail,
                total,
                list: allReplies
            };
        } catch (error) {
            return false;
        }
    }

    //获取单页帖子详情
    private async getTopicDetailPage(id: string, page: number, token?: string) {
        try {
            const res = await $http.get(`/t/${id}?p=${page}`, {
                headers: {cookie: token || ''}
            });
            const $ = cheerio.load(res.data);
            const box = $('#Main .box');
            let reply_num,
                reply_list = [],
                once,
                avatar,
                title,
                content,
                author,
                publish_time,
                tag_name,
                tag_link,
                subtle_list = [];

            // 只在第一页解析主题详情
            if (page === 1) {
                title = $(box).first().find('.header h1').text();
                author = $(box).first().find('.header .gray a').first().text();
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
                        let subtle_content = $(el).find('.topic_content').html();
                        const fixedHtml = this.fixProtocolMissingLinks(subtle_content);
                        const markdownContent = turndownService.turndown(fixedHtml);
                        const obj = {
                            time: this.formatTime(
                                $(el).find('.fade span').attr('title')
                            ),
                            content: this.removeImageLinks(markdownContent)
                        };
                        subtle_list.push(obj);
                    });
                }
                const topicHtml = $(box).first().find('.cell .topic_content').html();
                const fixedHtml = this.fixProtocolMissingLinks(topicHtml);
                const markdownContent = turndownService.turndown(fixedHtml);
                content = this.removeImageLinks(markdownContent);
                avatar = changeImgUrl(
                    $(box).first().find('.avatar').attr('src')
                );
                res.data.replace(/var once = "(.*?)";/, (word, target) => {
                    once = target;
                });
            }

            // 解析回复信息和回复列表
            const reply_info: any = $(box)
                .eq(1)
                .find('.cell')
                .first()
                .find('.gray')
                .text();
            reply_info.replace(/(.*?) 条回复/, (word, target) => {
                reply_num = target;
            });
            
            const reply_content = $(box)
                .eq(1)
                .find('.cell')
                .not((i, el) => !$(el).attr('id'));

            reply_content.each((i, el) => {
                const replyHtml = $(el).find('.reply_content').html();
                const fixedReplyHtml = this.fixProtocolMissingLinks(replyHtml);
                const replyMarkdown = turndownService.turndown(fixedReplyHtml);
                const obj = {
                    author: $(el).find('.dark').text(),
                    avatar: changeImgUrl($(el).find('.avatar').attr('src')),
                    is_op: $(el).find('.badges .badge.op').length > 0,
                    is_mod: $(el).find('.badges .badge.mod').length > 0,
                    is_pro: $(el).find('.badges .badge.pro').length > 0,
                    reply_time: this.formatTime(
                        $(el).find('.ago').attr('title')
                    ),
                    like_num: $(el).find('.fade').text().trim(),
                    content: this.removeImageLinks(replyMarkdown)
                };
                reply_list.push(obj);
            });

            if (page === 1) {
                return {
                    detail: {
                        id,
                        once,
                        avatar,
                        title,
                        content,
                        author,
                        publish_time,
                        tag_name,
                        tag_link,
                        subtle_list,
                    },
                    total: Number(reply_num) || 0,
                    list: reply_list
                };
            } else {
                return {
                    list: reply_list
                };
            }
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
            let cookie: any = cookies.map(item => {
                return item.split(';')[0];
            });
            // 取到需要的值进行拼装
            cookie = cookie.join(';');
            const $ = cheerio.load(res.data);
            const formList = $('#Main .box .cell').find('.sl');
            const username_key = $(formList[0]).attr('name');
            const password_key = $(formList[1]).attr('name');
            const code_key = $(formList[2]).attr('name');
            const once = $('#Main .box').find('.super').prev().attr('value');
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
            const {cookie, ...rest} = params;
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
            return cookies[0].includes('A2') ? cookies[0] : false;
        } catch (error) {
            return false;
        }
    }

    //获取配置
    async getV2exConfig() {
        try {
            const res = await axios.get(
                'https://cdn.todayhub.cn/lib/v2ex-config.json'
            );
            const {status, data} = res;
            if (status !== 200) {
                return false;
            }
            return data;
        } catch (error) {
            return false;
        }
    }

    //获取全部节点列表
    async getAllTagConfig(token) {
        try {
            const res = await $http.get('', {
                headers: {cookie: token || ''}
            });
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
                headers: {cookie: params.token}
            });
            const $ = cheerio.load(res.data);
            const box = $('#Main .box');
            const avatar_src = $(box).first().find('.avatar').attr('src');
            const avatar = changeImgUrl(avatar_src);
            const info = $(box).first().find('.gray').text();
            return {avatar, info};
        } catch (error) {
            return false;
        }
    }

    //获取用户主题
    async getUserTopics(params: any) {
        try {
            const res = await $http.get(
                `/member/${params.username}/topics?p=${params.p}`,
                {
                    headers: {cookie: params.token || ''}
                }
            );
            const $ = cheerio.load(res.data);
            const box = $('#Main .box');
            const list = $(box).find('.item');
            const topicInfo = {
                topic_count: $(box).find('.header .gray').text()
            };
            const data = [];
            list.each((i, el) => {
                const href = $(el).find('.topic-link').attr('href');
                const obj = {
                    id: href.replace(/\/t\/(.*?)#.*/g, '$1'),
                    title: $(el).find('.topic-link').text(),
                    reply_num:
                        $(el).find('.count_orange').text() ||
                        $(el).find('.count_livid').text() ||
                        0,
                    tag_name: $(el).find('.node').text(),
                    tag_link: $(el).find('.node').attr('href').split('/')[2],
                    author: $(el)
                        .find('.topic_info strong')
                        .first()
                        .children()
                        .text(),
                    avatar: changeImgUrl($('.avatar').attr('src')),
                    last_reply_time: this.formatTime(
                        $(el).find('.topic_info span').attr('title')
                    ),
                    replyer: $(el)
                        .find('.topic_info strong')
                        .last()
                        .children()
                        .text()
                };
                data.push(obj);
            });
            return {data, topicInfo};
        } catch (error) {
            return false;
        }
    }

    //获取用户回复
    async getUserReply(params: any) {
        try {
            const res = await $http.get(
                `/member/${params.username}/replies?p=${params.p}`,
                {
                    headers: {cookie: params.token}
                }
            );
            const $ = cheerio.load(res.data);
            const box = $('#Main .box');
            const dockList = $(box).find('.dock_area');
            const contentList = $(box).find('.reply_content');
            const topicInfo = {
                topic_count: $(box).find('.header .gray').text()
            };
            const data = [];
            dockList.each((i, el) => {
                let replyInfo = $(el).find('.gray').text().split(' › ');
                const hrefList = $(el).find('.gray a');
                const obj = {
                    id: $(hrefList[2])
                        .attr('href')
                        .replace(/\/t\/(.*?)#.*/g, '$1'),
                    title: replyInfo[2],
                    tag_name: replyInfo[1],
                    tag_link: $(hrefList[1]).attr('href').split('/')[2],
                    author: $(hrefList[0]).attr('href').split('/')[2],
                    content: $(contentList[i]).html(),
                    last_reply_time: $(el).find('.fr .fade').text()
                };
                data.push(obj);
            });
            return {data, topicInfo};
        } catch (error) {
            return false;
        }
    }

    //获取用户消息
    async getUserMessage(params: any) {
        try {
            const res = await $http.get(`/notifications?p=${params.p}`, {
                headers: {cookie: params.token}
            });
            const $ = cheerio.load(res.data);
            const box = $('#Main .box');
            const cellList = $(box).find('#notifications .cell');
            const messageInfo = {
                message_count: $(box).find('.header .gray').text()
            };
            const data = [];
            cellList.each((i, el) => {
                const hrefList = $(el).find('.fade a');
                const message = $(el).find('.fade').text();
                let messageType = '';
                if (message.includes('里回复了你') || message.includes('时提到了你')) {
                    messageType = 'reply';
                } else if (message.includes('收藏了你发布的主题')) {
                    messageType = 'collection';
                } else if (message.includes('感谢了你在主题')) {
                    messageType = 'thanks';
                }
                const obj = {
                    id: $(hrefList[1])
                        .attr('href')
                        .replace(/\/t\/(.*?)#.*/g, '$1'),
                    title: $(hrefList[1]).text(),
                    messageType,
                    author: $(hrefList[0]).attr('href').split('/')[2],
                    avatar: changeImgUrl($(el).find('.avatar').attr('src')),
                    content: $(el).find('.payload').html(),
                    last_reply_time: $(el).find('.snow').text()
                };
                data.push(obj);
            });
            return {data, messageInfo};
        } catch (error) {
            return false;
        }
    }

    //用户签到信息
    async getLoginRewardInfo(token: string) {
        try {
            const res = await $http.get('/mission/daily', {
                headers: {cookie: token}
            });
            const $ = cheerio.load(res.data);
            const cell = $('#Main .box .cell');
            const btn_value = $(cell).eq(1).find('.button').val();
            const sign_in_day = $(cell).last().text();
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
    async getV2exTabCookie(token: string) {
        const res = await $http.get('', {
            headers: {
                cookie: token
            }
        });
        let cookies = res.headers['set-cookie'];
        cookies = cookies.map(item => {
            return item.split(';')[0];
        });
        return cookies.find(item => item.indexOf('V2EX_TAB') > -1);
    }

    //签到方法
    async getLoginReward(token: string) {
        try {
            const res = await this.getLoginRewardInfo(token);
            if (res) {
                let {is_sign_in, once, sign_in_day} = res;
                // 没签到
                if (!is_sign_in) {
                    const V2EX_TAB = await this.getV2exTabCookie(token);
                    const data = await $http.get(
                        `/mission/daily/redeem?${once}`,
                        {
                            headers: {
                                cookie: token + ';' + V2EX_TAB,
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
                return {sign_in_day, is_sign_in};
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    //获取用户余额
    async getUserBalance(token: string) {
        try {
            const res = await $http.get('/balance', {
                headers: {cookie: token}
            });
            const $ = cheerio.load(res.data);
            const balance = $('#Main .balance_area')
                .text()
                .split(' ')
                .filter(i => i);
            const imgs = $('#Main .balance_area img');
            // G金 S银 B铜
            const balanceObj = {
                G: '',
                S: '',
                B: ''
            };
            imgs.each((i, el) => {
                const key = $(el).attr('alt');
                balanceObj[key] = balance[i];
            });
            return Object.values(balanceObj);
        } catch (error) {
            return false;
        }
    }

    //获取用户通知数量
    async getUserNotifications(token: string) {
        try {
            const res = await $http.get('', {
                headers: {cookie: token}
            });
            const $ = cheerio.load(res.data);
            const notifications = $('#money')
                .prev()
                .text()
                .split('条未读提醒')[0]
                .trim();
            return Number(notifications);
        } catch (error) {
            return false;
        }
    }

    //回贴
    async replyTopic(params: any) {
        try {
            const {once, content, id, token} = params;
            const res = await $http.post(`/t/${id}`, null, {
                params: {once, content},
                headers: {cookie: token}
            });
            const $ = cheerio.load(res.data);
            const problem = $('#Main .problem').text();
            return !problem;
        } catch (error) {
            return false;
        }
    }
}
