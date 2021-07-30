"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$http = void 0;
const axios_1 = require("axios");
const tunnel = require('tunnel');
const agent = tunnel.httpsOverHttp({
    proxy: {
        host: '127.0.0.1',
        port: 7890,
    },
});
const createInterceptor = (instance) => {
    instance.interceptors.request.use(function (config) {
        return config;
    }, function (error) {
        return Promise.reject(error);
    });
    instance.interceptors.response.use(function (response) {
        return response;
    }, function (error) {
        return Promise.reject(error);
    });
};
const httpInstance = axios_1.default.create({
    baseURL: 'https://www.v2ex.com',
    httpsAgent: agent,
});
exports.$http = httpInstance;
//# sourceMappingURL=axios.interceptor.js.map