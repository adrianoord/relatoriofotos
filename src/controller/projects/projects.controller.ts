import { ProjectsService } from './../../services/projects/projects.service';
import { Controller, Get, Param, Res, Post, Put, Body } from '@nestjs/common';
import { Response } from 'express';

@Controller('projects')
export class ProjectsController {

    constructor(private projectsService: ProjectsService) {}

    @Get() 
    async getProjects(@Res() res: Response){
        return res.json(await this.projectsService.getProjects()).status(201);
    }

    @Get(':id')
    async getProject(@Param('id') id: number, @Res() res: Response) {
        return res.status(200).json(await this.projectsService.getProject(id));
    }

    @Put(':id')
    async updateProject(@Param('id') id: number, @Res() res: Response, @Body() body: any) {
        return res.json(await this.projectsService.updateProject(id, body)).status(201);
    }

    @Get('image/:project/:name')
    async getImage(@Param('project') project: string, @Param('name') name: string, @Res() res: Response) {
        try {
            const image = `data:image/jpeg;base64,${await this.projectsService.getImage(project, name)}`;
            return res.json({image}).status(200);
        } catch(e) {
            console.log(e);
            return res.json({message: "Imagem não existe"}).status(404);
        }
    }

    @Post('generate/:project')
    async genDoc(@Param('project') project: string, @Res() res: Response) {
        this.projectsService.createProject(project)
        .then(()=>res.status(201).send())
        .catch(()=>res.status(409).send())
    }
}
