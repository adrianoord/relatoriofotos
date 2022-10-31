import { IProjectDB } from './../../interfaces/geral.interface';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class DatabaseService {

    private projects: Array<IProjectDB> = [];

    constructor() {
        this.loadJson();
    }

    private loadJson() {
        try {
            const db = JSON.parse(fs.readFileSync(process.cwd()+'/db.json', 'utf8'));
            if(!db) throw new Error('DB não existe');
            if(!db.projects) throw new Error('Projects não existe');
            this.projects = db.projects;
        } catch(e) {
            console.log(e);
            console.log('Falha ao ler arquivo db.json');
            process.exit();
        }
    }

    public saveJson() {
        try {
            const db = {projects: this.projects};
            fs.writeFileSync(process.cwd()+'/db.json', JSON.stringify(db),'utf8');
        } catch(e) {
            console.log('Falha ao salvar arquivo de ')
        }
    }

    public update(project: IProjectDB) {
        let newProject = this.findById(project.id);
        if(!newProject) return;
        newProject = project;
        this.saveJson();
    }

    public insert(project: IProjectDB) {
        const list = this.projects.map(i=>i.id);
        project.id = list.length>0?this.max(list)+1:1;
        this.projects.push(project);
        this.saveJson();
    }

    private max(arrNumber: number[]) {
        return Math.max.apply(null, arrNumber);
    }

    public findById(id: number) {
        const project = this.projects.find(i=>i.id==id);
        return project;
    }

    public getProjects() {
        this.loadJson();
        return this.projects;
    }

    public setProjects(projects: IProjectDB[]) {
        this.projects = projects;
        this.saveJson();
    }
}
