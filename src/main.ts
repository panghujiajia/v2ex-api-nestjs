import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const { PORT } = process.env;
    app.enableCors();
    const swaggerOptions = new DocumentBuilder()
        .setTitle('v2ex api document')
        .setDescription('v2ex-api-nest api document')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, swaggerOptions);
    SwaggerModule.setup('doc', app, document);
    console.log(`app is listening at ${PORT}`)
    await app.listen(PORT || 8888);
}
bootstrap();
