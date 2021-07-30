"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.V2exModule = void 0;
const common_1 = require("@nestjs/common");
const logger_middleware_1 = require("../../common/middleware/logger.middleware");
const v2ex_controller_1 = require("./v2ex.controller");
const v2ex_service_1 = require("./v2ex.service");
let V2exModule = class V2exModule {
    configure(consumer) {
        consumer.apply(logger_middleware_1.LoggerMiddleware).forRoutes('api');
    }
};
V2exModule = __decorate([
    common_1.Module({
        controllers: [v2ex_controller_1.V2exController],
        providers: [v2ex_service_1.V2exService],
    })
], V2exModule);
exports.V2exModule = V2exModule;
//# sourceMappingURL=v2ex.module.js.map