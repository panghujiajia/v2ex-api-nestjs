export declare class V2exService {
    getHotTopics(): Promise<false | any[]>;
    getTabTopics(tab: string): Promise<false | any[]>;
    getAllTopics(tab: string, p: string): Promise<false | {
        data: any[];
        nodeInfo: {
            topic_count: string;
            topic_intro: string;
        };
    }>;
    getTopicDetail(id: string): Promise<false | {
        detail: any;
        replys: any;
    }>;
    getLoginParams(): Promise<false | {
        username_key: string;
        password_key: string;
        code_key: string;
        once: string;
        codeUrl: any;
        cookie: any;
    }>;
    getCode(once: string, cookie: any): Promise<any>;
    login(params: any): Promise<any>;
}
