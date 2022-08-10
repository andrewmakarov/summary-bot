import fs from 'fs';
import { Color, NumberFormat } from 'google-spreadsheet';
import path from 'path';
import { MODEL_DIR_PATH, MODEL_BASE_FILE_NAME } from '../constants';

const ENCODING_TYPE = 'utf8';

export interface ICategory {
    key: string;
    text: string;
}

export interface IWarning {
    category: string;
    amount: number;
}

export interface IDocument {
    id: string;
    name: string;
    currency: string;
    warnings: Array<IWarning>;
}

export interface IModel {
    months: Array<string>;
    categories: Array<ICategory>
    headerRowIndex: number;
    defaultFormat: NumberFormat;
    dateColumn: ICategory;
    userNameColumn: ICategory;
    modelSheetName: string;
    rowColors: IRowColors;
    documents: Array<IDocument>,
    summary: {
        spent: string
        left: string
        canSave: string
        range: string
    },
}

export interface IRowColors {
    color1: Color;
    color2: Color;
}

export class SheetModel {
    private JSONModel: IModel;

    get rowColors() {
        return this.JSONModel.rowColors;
    }

    get headerRowIndex() {
        return this.JSONModel.headerRowIndex;
    }

    get dateColumn() {
        return this.JSONModel.dateColumn;
    }

    get userNameColumn() {
        return this.JSONModel.userNameColumn;
    }

    get categories() {
        return this.JSONModel.categories;
    }

    get modelSheetName() {
        return this.JSONModel.modelSheetName;
    }

    get months() {
        return this.JSONModel.months;
    }

    get documents() {
        return this.JSONModel.documents;
    }

    get summary() {
        return this.JSONModel.summary;
    }

    private get modelFilePath() {
        return path.resolve(__dirname, MODEL_DIR_PATH);
    }

    constructor() {
        const dirs = fs.readdirSync(this.modelFilePath, { withFileTypes: true });
        this.JSONModel = this.createModelBaseJSON(dirs);

        dirs.forEach((d) => {
            if (d.name !== MODEL_BASE_FILE_NAME) {
                this.JSONModel.documents.push(this.readJSON<IDocument>(d.name));
            }
        });
    }

    private createModelBaseJSON(dirs: fs.Dirent[]) {
        const modelBaseDirObject = dirs.find((d) => d.name === MODEL_BASE_FILE_NAME);

        return this.readJSON<IModel>(modelBaseDirObject!.name);
    }

    private readJSON<T>(filePath: string) {
        const resultPath = path.join(this.modelFilePath, filePath);
        const modelBaseContent = fs.readFileSync(resultPath, ENCODING_TYPE);

        return JSON.parse(modelBaseContent) as T;
    }
}
