import { Injectable } from '@nestjs/common';
import { $workTool } from '../../common/interceptors/axios.interceptor';

const { Configuration, OpenAIApi } = require('openai');

const fail = {
    code: -1,
    message: 'fail',
    data: {
        type: 0,
        info: {
            text: ''
        }
    }
};

const success = {
    code: 0,
    message: 'success'
};

@Injectable()
export class WorktoolService {
    async getThirdQa(params) {
        // params = {
        //     groupName: 'ChatGPT', // 群名
        //     atMe: 'true', // 是否@我
        //     groupRemark: '', // 群备注
        //     spoken: '你好', // 消息内容
        //     textType: '1', //
        //     rawSpoken: '@OpenAi 你好', // 原始消息文本
        //     receivedName: '面包屑', // 提问者名称
        //     roomType: '1' // 1=外部群 2=外部联系人 3=内部群 4=内部联系人
        // };
        try {
            const { groupName, roomType, spoken, receivedName } = params;
            if (spoken) {
                const configuration = new Configuration({
                    apiKey: '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'
                });
                const openai = new OpenAIApi(configuration);

                const completion = await openai.createCompletion({
                    model: 'text-davinci-003',
                    prompt: spoken,
                    max_tokens: 500
                });
                console.log(completion.data);
                console.log(completion.data.choices);
                console.log(completion.data.choices[0].text);
                const result = completion.data.choices[0].text;
                let replyItem: any = {
                    type: 203
                };
                // 群
                if (['1', '3'].includes(roomType)) {
                    replyItem.titleList = [groupName];
                    replyItem.atList = [receivedName];
                    replyItem.receivedContent = ` ${result}`;
                } else {
                    replyItem.titleList = [receivedName];
                    replyItem.receivedContent = result;
                }
                await $workTool.post(
                    `/wework/sendRawMessage`,
                    {
                        socketType: 2,
                        list: [replyItem]
                    },
                    {
                        params: {
                            robotId: '5d931a6f1062431aa6710f3a94833971'
                        }
                    }
                );
            }
            return {
                ...success,
                data: {
                    type: 5000,
                    info: {
                        text: ''
                    }
                }
            };
        } catch (error) {
            return fail;
        }
    }
    async getThirdQaPrivateChat(params) {
        try {
            return {
                ...success,
                data: {
                    type: 5000,
                    info: {
                        text: '私聊回调'
                    }
                }
            };
        } catch (error) {
            return fail;
        }
    }
    async getThirdQaGroupChat(params) {
        try {
            return {
                ...success,
                data: {
                    type: 5000,
                    info: {
                        text: '群聊回调'
                    }
                }
            };
        } catch (error) {
            return fail;
        }
    }
    async getThirdQaInstructionChat(params) {
        try {
            return {
                ...success,
                data: {
                    type: 5000,
                    info: {
                        text: '指令回调'
                    }
                }
            };
        } catch (error) {
            return fail;
        }
    }
}
