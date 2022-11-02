import { IImport } from './../../interfaces/geral.interface';
import { join } from 'path';
import { ProjectsService } from './../projects/projects.service';
import { Injectable } from '@nestjs/common';
import { 
    Document,
    ISectionOptions,
    Header,
    ImageRun, 
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    BorderStyle,
    HorizontalPositionAlign,
    HorizontalPositionRelativeFrom,
    VerticalPositionAlign,
    VerticalPositionRelativeFrom,
    TextWrappingType,
    AlignmentType,
    TextWrappingSide,
    FrameAnchorType,
    Packer
} from 'docx';
import * as fs from 'fs';

@Injectable()
export class DocxService {

    constructor(private projects: ProjectsService) {
    }

    async createDocx(projectName: string) {
        console.log('Montando documento...')
        try {
            fs.unlinkSync(join(process.cwd(), `${projectName}.docx`));
        } catch(e){}
        const projects = await this.projects.getProjects();
        const project = projects.find(i=>i.name==projectName);
        if(!project) return;
        const header = new Header({
            children: [
                new Paragraph({
                    children: [
                        new ImageRun({
                            data: fs.readFileSync(join(process.cwd(), 'background.png')),
                            transformation: {
                                width: 800, height: 1127
                            },
                            floating: {
                                horizontalPosition: {
                                    relative: HorizontalPositionRelativeFrom.PAGE,
                                    align: HorizontalPositionAlign.CENTER
                                },
                                verticalPosition: {
                                    relative: VerticalPositionRelativeFrom.PAGE,
                                    align: VerticalPositionAlign.CENTER
                                }
                            }
                        })
                    ]
                })
            ]
        });
        
        const sections: ISectionOptions[] = [];
        const width = 250;
        const height = 333;
        let counter = 0;
        
        const importacoes = this.splitArrayBy(4, project.importacoes);

        for(const importGroup of importacoes) {
            counter=0;
            const images = [];
            const descriptions = [];
            while(counter<=importGroup.length-1) {
                switch(counter) {
                    case 0:
                        images[counter] = new ImageRun({
                            data: await this.projects.getImageBuffer(project.name, importGroup[counter].fileName),
                            transformation: {width,height},
                            floating: {
                                horizontalPosition: {
                                    relative: HorizontalPositionRelativeFrom.MARGIN,
                                    align: HorizontalPositionAlign.LEFT
                                },
                                verticalPosition: {
                                    relative: VerticalPositionRelativeFrom.MARGIN,
                                    align: VerticalPositionAlign.TOP
                                }
                            }
                        });
                        descriptions[counter] = new Paragraph({
                            frame: {
                                position: {
                                    x: 25,
                                    y: 5000,
                                },
                                width: 3700,
                                height: 1000,
                                anchor: {
                                    horizontal: FrameAnchorType.MARGIN,
                                    vertical: FrameAnchorType.MARGIN,
                                },
                                alignment: {
                                    x: HorizontalPositionAlign.LEFT,
                                    y: VerticalPositionAlign.TOP,
                                }
                            },
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: `FOTO ${importGroup[counter].position} - ${importGroup[counter].description}`,
                                    bold: false,
                                    size: 20,
                                    font: 'Helvetica Neue'
                                })
                            ]
                        });
                        break;
                    case 1:
                        images[counter] = new ImageRun({
                            data: await this.projects.getImageBuffer(project.name, importGroup[counter].fileName),
                            transformation: {width,height},
                            floating: {
                                horizontalPosition: {
                                    relative: HorizontalPositionRelativeFrom.MARGIN,
                                    align: HorizontalPositionAlign.RIGHT
                                },
                                verticalPosition: {
                                    relative: VerticalPositionRelativeFrom.MARGIN,
                                    align: VerticalPositionAlign.TOP
                                }
                            }
                        });
                        descriptions[counter] = new Paragraph({
                            frame: {
                                position: {
                                    x: 5300,
                                    y: 5000,
                                },
                                width: 3700,
                                height: 1000,
                                anchor: {
                                    horizontal: FrameAnchorType.MARGIN,
                                    vertical: FrameAnchorType.MARGIN,
                                },
                                alignment: {
                                    x: HorizontalPositionAlign.LEFT,
                                    y: VerticalPositionAlign.TOP,
                                }
                            },
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: `FOTO ${importGroup[counter].position} - ${importGroup[counter].description}`,
                                    bold: false,
                                    size: 20,
                                    font: 'Helvetica Neue'
                                })
                            ]
                        });
                        break;
                    case 2:
                        images[counter] = new ImageRun({
                            data: await this.projects.getImageBuffer(project.name, importGroup[counter].fileName),
                            transformation: {width,height},
                            floating: {
                                horizontalPosition: {
                                    relative: HorizontalPositionRelativeFrom.MARGIN,
                                    align: HorizontalPositionAlign.LEFT
                                },
                                verticalPosition: {
                                    relative: VerticalPositionRelativeFrom.MARGIN,
                                    align: VerticalPositionAlign.BOTTOM
                                }
                            }
                        });
                        descriptions[counter] = new Paragraph({
                            frame: {
                                position: {
                                    x: 25,
                                    y: 11650,
                                },
                                width: 3700,
                                height: 1000,
                                anchor: {
                                    horizontal: FrameAnchorType.MARGIN,
                                    vertical: FrameAnchorType.MARGIN,
                                },
                                alignment: {
                                    x: HorizontalPositionAlign.LEFT,
                                    y: VerticalPositionAlign.TOP,
                                }
                            },
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: `FOTO ${importGroup[counter].position} - ${importGroup[counter].description}`,
                                    bold: false,
                                    size: 20,
                                    font: 'Helvetica Neue'
                                })
                            ]
                        });
                        break;
                    case 3:
                        images[counter] = new ImageRun({
                            data: await this.projects.getImageBuffer(project.name, importGroup[counter].fileName),
                            transformation: {width,height},
                            floating: {
                                horizontalPosition: {
                                    relative: HorizontalPositionRelativeFrom.MARGIN,
                                    align: HorizontalPositionAlign.RIGHT
                                },
                                verticalPosition: {
                                    relative: VerticalPositionRelativeFrom.MARGIN,
                                    align: VerticalPositionAlign.BOTTOM
                                }
                            }
                        });
                        descriptions[counter] = new Paragraph({
                            frame: {
                                position: {
                                    x: 5300,
                                    y: 11650,
                                },
                                width: 3700,
                                height: 1000,
                                anchor: {
                                    horizontal: FrameAnchorType.MARGIN,
                                    vertical: FrameAnchorType.MARGIN,
                                },
                                alignment: {
                                    x: HorizontalPositionAlign.LEFT,
                                    y: VerticalPositionAlign.TOP,
                                }
                            },
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: `FOTO ${importGroup[counter].position} - ${importGroup[counter].description}`,
                                    bold: false,
                                    size: 20,
                                    font: 'Helvetica Neue'
                                })
                            ]
                        });
                        break;
                }
                counter++;
            }
            const paragraphs = [];
            paragraphs[0] = new Paragraph({
                children: [images[0],images[1]]
            });
            paragraphs[1] = new Paragraph({
                children: [images[2],images[3]]
            });
            const section: ISectionOptions = {
                headers: {
                    default: header
                },
                children: [...paragraphs,...descriptions],
                properties: {
                    page: {
                        margin: {
                            top: 1437,
                            bottom: 3767,
                            left: 1437,
                            right: 1437
                        }
                    }
                }
            }
            sections.push(section);
        };

        const doc = new Document({
            sections
        });
        console.log('Documento montado!');
        console.log('Criando docx - pode demorar bastante...');
        try {
            const buffer = await Packer.toStream(doc);
            let to_stream   = fs.createWriteStream(join(process.cwd(),`${projectName}.docx`));

            let written = 0;
            const promises = await Promise.all([
                new Promise((resolve)=>{
                    let timeout = setTimeout(resolve, 1000);
                    buffer.on('data', data => {
                        // do the piping manually here.
                        to_stream.write(data, () => {
                            written += data.length;
                            console.log(`written ${written}`);
                            clearTimeout(timeout);
                            timeout = setTimeout(resolve, 1000);
                        });
                    });
                })
            ])
            to_stream.close();
            console.log('Docx Criado!');
        } catch(e) {
            console.log(e);
            throw new Error('Falha ao criar documento');
        }
    }

    splitArrayBy(length: number, array: Array<IImport>): Array<Array<IImport>> {
        const newArray = [];
        for(let i=0;i<array.length;i+length) {
            newArray.push(array.splice(i, length))
        }
        return newArray;
    }
}
