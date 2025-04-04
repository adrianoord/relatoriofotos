import { join } from 'path';
import { DatabaseService } from './../database/database.service';
import { IProjectDB, IFile, IImport } from './../../interfaces/geral.interface';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as sharp from 'sharp';
import { promisify } from 'util';
import * as heicConvert from 'heic-convert';

@Injectable()
export class ProjectsService {
    private projectsFolders: Array<IProjectDB> = [];

    constructor(
        private database: DatabaseService
    ) {
        this.updateProjects();
    }

    async updateProjects() {
        this.projectsFolders = this.database.getProjects();
        const folders = await this.getFolders();
        this.projectsFolders = this.projectsFolders.filter(i => {
            return folders.includes(i.name);
        });
        for (let project of this.projectsFolders) {
            const files = await this.getProjectFolderContent(project.name);
            const order: IImport[] = project.importacoes;
            for (let file of files) {
                const imported = project.importacoes.find(i => i.fileName == file.name);
                if (!imported) {
                    let position = order.length > 0 ? this.max(order.map(i => i.position)) + 1 : 1;
                    while (order.find(i => (i ? i.position : null) == position)) {
                        position++;
                    }
                    const newImport: IImport = {
                        fileName: file.name,
                        description: '',
                        position
                    }
                    order[position - 1] = newImport;
                }
            }
            const orderFiltered = order.filter(i => files.map(f => f.name).includes(i.fileName));
            project.importacoes = orderFiltered;
        }
        this.database.setProjects(this.projectsFolders);
    }

    private getFolders() {
        return new Promise<string[]>((resolve, reject) => {
            try {
                const folders = fs.readdirSync(`${process.cwd()}/projects`, { withFileTypes: true })
                    .filter(item => item.isDirectory())
                    .map(item => item.name);
                resolve(folders);
            } catch (e) {
                console.log(e);
            }
        });
    }

    private getProjectFolderContent(project: string) {
        return new Promise<IFile[]>((resolve, reject) => {
            const mapFolder = fs.readdirSync(join(process.cwd(), 'projects', project), { withFileTypes: true })
                .filter(item => item.isFile() && ['.jpeg', '.jpg', '.png', '.bmp', '.heic'].find(i => item.name.toLocaleLowerCase().includes(i)))
            const files: IFile[] = [];
            for (let file of mapFolder) {
                files.push({
                    name: file.name
                })
            }
            resolve(files);
        });
    }

    public async getProjects() {
        await this.updateProjects();
        return this.projectsFolders;
    }

    public async getProject(id: number) {
        await this.updateProjects();
        const project = this.projectsFolders.find(i => i.id == id);
        return project;
    }

    public async updateProject(id: number, imports: IImport[]) {
        await this.updateProjects();
        const project = this.projectsFolders.find(i => i.id == id);
        project.importacoes = imports;
        this.database.setProjects(this.projectsFolders);
        return project;
    }

    public createProject(name: string) {
        return new Promise<string | void>(async (resolve, reject) => {
            await this.updateProjects();
            const newProject: IProjectDB = {
                name,
                importacoes: []
            }
            const existFolder = fs.existsSync(join(process.cwd(), 'projects', `${name}`))
            const existProject = this.projectsFolders.find(i => i.name == name);
            if (!existFolder || !existProject) {
                if (!existFolder) {
                    fs.mkdirSync(join(process.cwd(), 'projects', `${name}`));
                }
                if (!existProject) {
                    this.database.insert(newProject);
                    await this.updateProjects();
                }
                resolve(join(process.cwd(), 'projects', `${name}`));
            }
            else {
                reject();
            }
        });
    }

    public addFileToProject(id: number, importacao: IImport) {
        const project = this.database.findById(id);
        if (!project) return;
        return project.importacoes.push(importacao);
    }

    public insertFile(project: string, name: string, file: any) {
        return new Promise<void>((resolve, reject) => {
            if (!fs.existsSync(join(process.cwd(), 'projects', `${project}`, `${name}`))) {
                fs.writeFileSync(join(process.cwd(), 'projects', `${project}`, `${name}`), file, 'base64');
                resolve();
            }
            else {
                reject();
            }
        });
    }

    public deleteImage(project: string, fileName: string) {
        try {
            if (!fs.existsSync(join(process.cwd(), 'lixo', `${project}`))) {
                fs.mkdirSync(join(process.cwd(), 'lixo', `${project}`));
            }
            fs.renameSync(join(process.cwd(), 'projects', `${project}`, `${fileName}`), join(process.cwd(), 'lixo', `${project}`, `${fileName}`));
            this.updateProjects();
        } catch (e) {
            throw new Error(e.message);
        }
    }

    public async getImage(project: string, fileName: string) {
        const isHEIC = fileName.toLocaleLowerCase().includes('.heic');
        let input: any = '';
        if (isHEIC) {
            const inputBuffer = await promisify(fs.readFile)(join(process.cwd(), 'projects', `${project}`, `${fileName}`));
            const outputBuffer = await heicConvert({
                buffer: inputBuffer as any,
                format: 'JPEG'
            });
            input = outputBuffer;
        } else {
            input = join(process.cwd(), 'projects', `${project}`, `${fileName}`);
        }

        const metadata = await sharp(input).metadata();
        if (metadata.width > 1024) {
            const orientation = metadata.orientation;
            return (await sharp(input)
                .rotate()
                .resize(1024, Math.round(1024 * (orientation == 6 ? metadata.width / metadata.height : metadata.height / metadata.width)))
                .jpeg({ quality: 50 })
                .toBuffer())
                .toString('base64');
        }
        return (await sharp(input)
            .rotate()
            .jpeg({ quality: 50 })
            .toBuffer())
            .toString('base64');
    }

    public async getImageBuffer(project: string, fileName: string) {
        const isHEIC = fileName.toLocaleLowerCase().includes('.heic');
        let input: any = '';
        if (isHEIC) {
            const inputBuffer = await promisify(fs.readFile)(join(process.cwd(), 'projects', `${project}`, `${fileName}`));
            const outputBuffer = await heicConvert({
                buffer: inputBuffer as any,
                format: 'JPEG'
            });
            input = outputBuffer;
        } else {
            input = join(process.cwd(), 'projects', `${project}`, `${fileName}`);
        }
        const image = (await sharp(input)
            .rotate()
            .jpeg({ quality: 50 })
            .toBuffer());
        return image;
    }

    private max(arrNumber: number[]) {
        return Math.max.apply(null, arrNumber);
    }
}
