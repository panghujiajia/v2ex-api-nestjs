"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const swaggerOptions = new swagger_1.DocumentBuilder()
        .setTitle('v2ex api document')
        .setDescription('v2ex-api-nest api document')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerOptions);
    swagger_1.SwaggerModule.setup('doc', app, document);
    await app.listen(3000);
}
bootstrap();
//# sourceMappingURL=main.js.map