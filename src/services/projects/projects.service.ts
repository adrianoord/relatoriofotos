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
        this.projectsFolders = this.projectsFolders.filter(i=>{
            return folders.includes(i.name);
        });
        for(let project of this.projectsFolders) {
            const files = await this.getProjectFolderContent(project.name);
            const order: IImport[] = [];
            for(let file of files) {
                const imported = project.importacoes.find(i=>i.fileName==file.name);
                if(imported) {
                    order[imported.position-1]=imported;
                } else {
                    let position = order.length>0?this.max(order.map(i=>i.position))+1:1;
                    while(project.importacoes.find(i=>i.position==position)) {
                        position++;
                    }
                    const newImport: IImport = {
                        fileName: file.name,
                        description: '',
                        position 
                    }
                    order[position-1]=newImport;
                }
            }
            const orderFiltered = order.filter(i=>files.map(f=>f.name).includes(i.fileName));
            orderFiltered.filter(i=>{
                i.position = orderFiltered.map(oF=>oF.fileName).indexOf(i.fileName)+1;
            })
            project.importacoes=orderFiltered;
        }
        this.database.setProjects(this.projectsFolders);
    }

    private getFolders() {
        return new Promise<string[]>((resolve, reject)=>{
            try {
                const folders = fs.readdirSync(`${process.cwd()}/projects`, {withFileTypes:true})
                    .filter(item=>item.isDirectory())
                    .map(item=>item.name);
                resolve(folders);
            } catch(e) {
                console.log(e);
            }
        });
    }

    private getProjectFolderContent(project:string) {
        return new Promise<IFile[]>((resolve,reject)=>{
            const mapFolder = fs.readdirSync(join(process.cwd(), 'projects', project), {withFileTypes:true})
                .filter(item=>item.isFile()&&['.jpeg', '.jpg', '.png', '.bmp', '.HEIC'].find(i=>item.name.toLocaleLowerCase().includes(i)))
            const files: IFile[] = [];
            for(let file of mapFolder) {
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
        const project = this.projectsFolders.find(i=>i.id==id);
        return project;
    }

    public async updateProject(id: number, imports: IImport[]) {
        await this.updateProjects();
        const project = this.projectsFolders.find(i=>i.id==id);
        project.importacoes = imports;
        this.database.setProjects(this.projectsFolders);
        return project;
    }

    public createProject(name: string) {
        return new Promise<string | void>(async (resolve, reject)=>{
            await this.updateProjects();
            if(!fs.existsSync(join(process.cwd(), 'projects', `${name}`)))
            {
                const newProject: IProjectDB = {
                    name,
                    importacoes: []
                }
                fs.mkdirSync(join(process.cwd(), 'projects', `${name}`));
                this.database.insert(newProject);
                await this.updateProjects();
                resolve(join(process.cwd(), 'projects', `${name}`));
            }
            else{
                reject();
            }
        });
    }

    public addFileToProject(id: number, importacao: IImport) {
        const project = this.database.findById(id);
        if(!project) return;
        return project.importacoes.push(importacao);
    }

    public insertFile(project: string, name: string, file: any) {
        return new Promise<void>((resolve, reject)=>{
            if(!fs.existsSync(join(process.cwd(), 'projects', `${project}`, `${name}`)))
            {
                fs.writeFileSync(join(process.cwd(), 'projects', `${project}`, `${name}`), file, 'base64');
                resolve();
            }
            else{
                reject();
            }
        });  
    }

    public async getImage(project: string, fileName: string) {
        const isHEIC = fileName.toLocaleLowerCase().includes('.heic');
        let input: any = '';
        if(isHEIC) {
            const inputBuffer = await promisify(fs.readFile)(join(process.cwd(), 'projects', `${project}`, `${fileName}`));
            const outputBuffer = await heicConvert({
                buffer: inputBuffer,
                format: 'JPEG'
            });
            input = outputBuffer;
        } else {
            input = join(process.cwd(), 'projects', `${project}`, `${fileName}`);
        }
        const image = (await sharp(input)
            .jpeg({quality:20})
            .toBuffer()).toString('base64');
        return image;
    }

    public async getImageBuffer(project: string, fileName: string) {
        const isHEIC = fileName.toLocaleLowerCase().includes('.heic');
        let input: any = '';
        if(isHEIC) {
            const inputBuffer = await promisify(fs.readFile)(join(process.cwd(), 'projects', `${project}`, `${fileName}`));
            const outputBuffer = await heicConvert({
                buffer: inputBuffer,
                format: 'JPEG'
            });
            input = outputBuffer;
        } else {
            input = join(process.cwd(), 'projects', `${project}`, `${fileName}`);
        }
        const image = (await sharp(input)
            .jpeg({quality:100})
            .toBuffer());
        return image;
    }

    private max(arrNumber: number[]) {
        return Math.max.apply(null, arrNumber);
    }
}
