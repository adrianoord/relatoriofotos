export interface IProjectDB {
    id?: number;
    name: string;
    importacoes: Array<IImport>;
}

export interface IImport {
    fileName: string;
    description: string;
    position: number;
}

export interface IFolderProject {
    name: string;
    files: Array<IFile>;
}

export interface IFile {
    name: string;
}