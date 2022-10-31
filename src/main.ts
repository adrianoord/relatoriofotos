import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const options: CorsOptions = {
    origin: '*',
    preflightContinue: false,
    methods: '*'
  }
  app.enableCors(options);
  app.setGlobalPrefix('/api');
  await app.listen(3000, ()=>{
    console.log("http://localhost:3000/");
  });
}
bootstrap();
