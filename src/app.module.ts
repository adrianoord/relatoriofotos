import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProjectsController } from './controller/projects/projects.controller';
import { ProjectsService } from './services/projects/projects.service';
import { DatabaseService } from './services/database/database.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DocxService } from './services/docx/docx.service';
import { DocxController } from './controller/docx/docx.controller';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    })
  ],
  controllers: [AppController, ProjectsController, DocxController],
  providers: [AppService, ProjectsService, DatabaseService, DocxService],
})
export class AppModule {}
