import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const options: CorsOptions = {
    origin: '*',
    preflightContinue: false,
    methods: '*'
  }
  app.enableCors(options);
  app.use(bodyParser.json({limit: '100mb'}));
  app.use(bodyParser.urlencoded({limit: '100mb', extended: true}));
  app.setGlobalPrefix('/api');
  await app.listen(3000, ()=>{
    console.log("http://localhost:3000/");
  });
}
bootstrap();
