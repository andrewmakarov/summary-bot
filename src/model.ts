import fs from 'fs';
import { Color, NumberFormat } from 'google-spreadsheet';
import path from 'path';
import { MODEL_PATH, USER_MODEL_PATH } from './constants';

const ENCODING_TYPE = 'utf8';

export interface IUsersModel {
    [key: number]: string;
}

export interface ICategory {
    key: string;
    text: string;
    format?: NumberFormat;
}

export interface IModel {
    months: Array<string>;
    categories: Array<ICategory>
    headerRowIndex: number;
    defaultFormat: NumberFormat;
    dateColumnName: ICategory;
    modelSheetName: string;
    rowColors: IRowColors;
}

export interface IRowColors {
    color1: Color;
    color2: Color;
}

export default class Model {
    private JSONModel: IModel;

    private userJSONModel: IUsersModel;

    get rowColors() {
        return this.JSONModel.rowColors;
    }

    get defaultFormat() {
        return this.JSONModel.defaultFormat;
    }

    get headerRowIndex() {
        return this.JSONModel.headerRowIndex;
    }

    get dateColumn() {
        return this.JSONModel.dateColumnName;
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

    get users() {
        return this.userJSONModel;
    }

    private get modelFilePath() {
        return path.resolve(__dirname, MODEL_PATH);
    }

    private get userModelFilePath() {
        return path.resolve(__dirname, USER_MODEL_PATH);
    }

    constructor() {
        const model = fs.readFileSync(this.modelFilePath, ENCODING_TYPE);
        this.JSONModel = JSON.parse(model);

        const isUsersFileExist = fs.existsSync(this.userModelFilePath);
        if (!isUsersFileExist) {
            fs.writeFileSync(this.userModelFilePath, '{}');
        }

        const userModel = fs.readFileSync(this.userModelFilePath, ENCODING_TYPE);
        this.userJSONModel = JSON.parse(userModel);
    }

    addUser(id: number, name: string) {
        const idString = id.toString();

        if (!this.userJSONModel[idString]) {
            this.userJSONModel[idString] = name;
            fs.writeFileSync(this.userModelFilePath, JSON.stringify(this.userJSONModel), { encoding: ENCODING_TYPE });
        }
    }
}
