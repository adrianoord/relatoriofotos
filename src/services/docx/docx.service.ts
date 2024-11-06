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
    HorizontalPositionAlign,
    HorizontalPositionRelativeFrom,
    VerticalPositionAlign,
    VerticalPositionRelativeFrom,
    AlignmentType,
    FrameAnchorType,
    Packer
} from 'docx';
import * as fs from 'fs';

@Injectable()
export class DocxService {

    constructor(private projects: ProjectsService) {
    }

    async createDocx(projectName: string, layout: number) {
        console.log(`Montando documento... Layout ${layout} por página`)
        try {
            fs.unlinkSync(join(process.cwd(), `${projectName}.docx`));
        } catch (e) { }
        const projects = await this.projects.getProjects();
        const project = projects.find(i => i.name == projectName);
        if (!project) return;
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
        let counter = 0;

        const importacoes = this.splitArrayBy(layout, project.importacoes);

        const layoutConfig = {
            2: [
                {
                    x: 2637.5,
                    y: 5250,
                    width: 3700,
                    height: 1000,
                    image: {
                        width: 525,
                        height: 350
                    },
                    floating: {
                        horizontalPosition: {
                            relative: HorizontalPositionRelativeFrom.MARGIN,
                            align: HorizontalPositionAlign.CENTER
                        },
                        verticalPosition: {
                            relative: VerticalPositionRelativeFrom.MARGIN,
                            align: VerticalPositionAlign.TOP
                        }
                    }
                },
                {
                    x: 2637.5,
                    y: 11650,
                    width: 3700,
                    height: 1000,
                    image: {
                        width: 525,
                        height: 350
                    },
                    floating: {
                        horizontalPosition: {
                            relative: HorizontalPositionRelativeFrom.MARGIN,
                            align: HorizontalPositionAlign.CENTER
                        },
                        verticalPosition: {
                            relative: VerticalPositionRelativeFrom.MARGIN,
                            align: VerticalPositionAlign.BOTTOM
                        }
                    }
                }
            ],
            4: [
                {
                    x: 25,
                    y: 5000,
                    width: 3700,
                    height: 1000,
                    image: {
                        width: 250,
                        height: 333
                    },
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
                },
                {
                    x: 5300,
                    y: 5000,
                    width: 3700,
                    height: 1000,
                    image: {
                        width: 250,
                        height: 333
                    },
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
                },
                {
                    x: 25,
                    y: 11650,
                    width: 3700,
                    height: 1000,
                    image: {
                        width: 250,
                        height: 333
                    },
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
                },
                {
                    x: 5300,
                    y: 11650,
                    width: 3700,
                    height: 1000,
                    image: {
                        width: 250,
                        height: 333
                    },
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
                }
            ]
        }

        for (const importGroup of importacoes) {
            counter = 0;
            const images = [];
            const descriptions = [];
            while (counter <= importGroup.length - 1) {
                const description = `Foto ${importGroup[counter].position} ${importGroup[counter].description ? '-' : ''} ${importGroup[counter].description}`;
                switch (counter) {
                    case 0:
                        images[counter] = new ImageRun({
                            data: await this.projects.getImageBuffer(project.name, importGroup[counter].fileName),
                            transformation: { 
                                width: layoutConfig[layout][counter].image.width,
                                height: layoutConfig[layout][counter].image.height
                            },
                            floating: layoutConfig[layout][counter].floating
                        });
                        descriptions[counter] = new Paragraph({
                            frame: {
                                position: {
                                    x: layoutConfig[layout][counter].x,
                                    y: layoutConfig[layout][counter].y,
                                },
                                width: layoutConfig[layout][counter].width,
                                height: layoutConfig[layout][counter].height,
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
                                    text: description,
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
                            transformation: { 
                                width: layoutConfig[layout][counter].image.width,
                                height: layoutConfig[layout][counter].image.height
                            },
                            floating: layoutConfig[layout][counter].floating
                        });
                        descriptions[counter] = new Paragraph({
                            frame: {
                                position: {
                                    x: layoutConfig[layout][counter].x,
                                    y: layoutConfig[layout][counter].y,
                                },
                                width: layoutConfig[layout][counter].width,
                                height: layoutConfig[layout][counter].height,
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
                                    text: description,
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
                            transformation: { 
                                width: layoutConfig[layout][counter].image.width,
                                height: layoutConfig[layout][counter].image.height
                            },
                            floating: layoutConfig[layout][counter].floating
                        });
                        descriptions[counter] = new Paragraph({
                            frame: {
                                position: {
                                    x: layoutConfig[layout][counter].x,
                                    y: layoutConfig[layout][counter].y,
                                },
                                width: layoutConfig[layout][counter].width,
                                height: layoutConfig[layout][counter].height,
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
                                    text: description,
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
                            transformation: { 
                                width: layoutConfig[layout][counter].image.width,
                                height: layoutConfig[layout][counter].image.height
                            },
                            floating: layoutConfig[layout][counter].floating
                        });
                        descriptions[counter] = new Paragraph({
                            frame: {
                                position: {
                                    x: layoutConfig[layout][counter].x,
                                    y: layoutConfig[layout][counter].y,
                                },
                                width: layoutConfig[layout][counter].width,
                                height: layoutConfig[layout][counter].height,
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
                                    text: description,
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

            switch(layout) {
                case 2:
                    paragraphs.push(new Paragraph({
                        children: [images[0]]
                    }));
                    paragraphs.push(new Paragraph({
                        children: [images[1]]
                    }));
                case 4:
                    paragraphs.push(new Paragraph({
                        children: [images[0], images[1]]
                    }));
                    paragraphs.push(new Paragraph({
                        children: [images[2], images[3]]
                    }));
                    break;
            }
            const section: ISectionOptions = {
                headers: {
                    default: header
                },
                children: [...paragraphs, ...descriptions],
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
            let to_stream = fs.createWriteStream(join(process.cwd(), `${projectName}.docx`));

            let written = 0;
            const promises = await Promise.all([
                new Promise((resolve) => {
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
        } catch (e) {
            console.log(e);
            throw new Error('Falha ao criar documento');
        }
    }

    splitArrayBy(length: number, array: Array<IImport>): Array<Array<IImport>> {
        const newArray = [];
        for (let i = 0; i < array.length; i + length) {
            newArray.push(array.splice(i, length))
        }
        return newArray;
    }
}
