"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireException = void 0;
const common_1 = require("@nestjs/common");
class RequireException extends common_1.HttpException {
    constructor(response, status) {
        super(response || 'Bad Request', status || common_1.HttpStatus.BAD_REQUEST);
    }
}
exports.RequireException = RequireException;
//# sourceMappingURL=required.exception.js.map