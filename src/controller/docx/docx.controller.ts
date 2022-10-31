import { DocxService } from './../../services/docx/docx.service';
import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('docx')
export class DocxController {
    constructor(private docxService: DocxService) {}

    @Get(':project')
    async getProject(@Param('project') projectName: string, @Res() res: Response) {
        try {
            await this.docxService.createDocx(projectName);
            return res.status(201).json({
                message:"Documento criado!"
            });
        } catch(e) {
            return res.status(500).json({
                message:"Falha ao criar documento!"
            });
        }
    }
}
