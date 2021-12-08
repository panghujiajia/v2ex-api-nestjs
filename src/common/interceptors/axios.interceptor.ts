import axios, { AxiosInstance } from 'axios';
const tunnel = require('tunnel');
const agent = tunnel.httpsOverHttp({
    proxy: {
        host: '127.0.0.1',
        port: 7890
    }
});

const createInterceptor = (instance: AxiosInstance): void => {
    instance.interceptors.request.use(
        function (config) {
            // 在发送请求之前做些什么
            return config;
        },
        function (error) {
            // 对请求错误做些什么
            return Promise.reject(error);
        }
    );

    // 添加响应拦截器
    instance.interceptors.response.use(
        function (response) {
            // 对响应数据做点什么
            return response;
        },
        function (error) {
            // 对响应错误做点什么
            return Promise.reject(error);
        }
    );
};

const httpInstance = axios.create({
    baseURL: 'https://www.v2ex.com',
    httpsAgent: agent,
    headers: {
        Accept: 'application/json'
    }
});
createInterceptor(httpInstance);
export const $http = httpInstance;
