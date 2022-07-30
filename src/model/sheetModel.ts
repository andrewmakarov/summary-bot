import fs from 'fs';
import { Color, NumberFormat } from 'google-spreadsheet';
import path from 'path';
import { MODEL_PATH } from '../constants';

const ENCODING_TYPE = 'utf8';

export interface ICategory {
    key: string;
    text: string;
}

export interface IModel {
    months: Array<string>;
    categories: Array<ICategory>
    headerRowIndex: number;
    defaultFormat: NumberFormat;
    dateColumnName: ICategory;
    nameColumnName: ICategory;
    modelSheetName: string;
    rowColors: IRowColors;
    documents: Array<{
        id: string;
        text: string;
        currency: string;
    }>
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
        return this.JSONModel.dateColumnName;
    }

    get nameColumnName() {
        return this.JSONModel.nameColumnName;
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

    private get modelFilePath() {
        return path.resolve(__dirname, MODEL_PATH);
    }

    constructor() {
        const model = fs.readFileSync(this.modelFilePath, ENCODING_TYPE);
        this.JSONModel = JSON.parse(model);
    }
}
