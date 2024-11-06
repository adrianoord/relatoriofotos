import { DocxService } from './../../services/docx/docx.service';
import { Req, Controller, Param, Post, Res } from '@nestjs/common';
import { Response, Request } from 'express';
import { join } from 'path';

@Controller('docx')
export class DocxController {
    constructor(private docxService: DocxService) {}

    @Post(':project')
    async generateDocx(@Param('project') projectName: string, @Res() res: Response, @Req() req: Request) {
        try {
            await this.docxService.createDocx(projectName, req.body.layout);
            return res.status(201).json({
                message:`Documento criado! ${join(process.cwd(), `${projectName}.docx`)}`
            });
        } catch(e) {
            return res.status(500).json({
                message:"Falha ao criar documento!"
            });
        }
    }
}
