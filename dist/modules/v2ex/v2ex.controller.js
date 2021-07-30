"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.V2exController = void 0;
const common_1 = require("@nestjs/common");
const required_exception_1 = require("../../common/exception/required.exception");
const v2ex_service_1 = require("./v2ex.service");
let V2exController = class V2exController {
    constructor(v2exService) {
        this.v2exService = v2exService;
    }
    getTabTopics(tab) {
        if (!tab) {
            throw new required_exception_1.RequireException();
        }
        if (tab === 'top') {
            return this.v2exService.getHotTopics();
        }
        return this.v2exService.getTabTopics(tab);
    }
    getAllTopics({ tab, p }) {
        if (!tab || !p) {
            throw new required_exception_1.RequireException();
        }
        return this.v2exService.getAllTopics(tab, p);
    }
    getTopicDetail(id) {
        if (!id) {
            throw new required_exception_1.RequireException();
        }
        return this.v2exService.getTopicDetail(id);
    }
    getLoginParams() {
        return this.v2exService.getLoginParams();
    }
    getLogin(params) {
        const { once } = params;
        if (!params || !once) {
            throw new required_exception_1.RequireException();
        }
        return this.v2exService.login(params);
    }
};
__decorate([
    common_1.Get('/topics/tab'),
    __param(0, common_1.Query('tab')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], V2exController.prototype, "getTabTopics", null);
__decorate([
    common_1.Get('/topics/all'),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], V2exController.prototype, "getAllTopics", null);
__decorate([
    common_1.Get('/topics/detail'),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], V2exController.prototype, "getTopicDetail", null);
__decorate([
    common_1.Get('/login/params'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], V2exController.prototype, "getLoginParams", null);
__decorate([
    common_1.Post('/login'),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], V2exController.prototype, "getLogin", null);
V2exController = __decorate([
    common_1.Controller('api'),
    __metadata("design:paramtypes", [v2ex_service_1.V2exService])
], V2exController);
exports.V2exController = V2exController;
//# sourceMappingURL=v2ex.controller.js.map