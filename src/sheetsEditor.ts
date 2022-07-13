import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import Model, { ICategory } from './model';
import { isDebug } from './utils';

interface IRowData {
    [key: string]: string | number
}

export default class SheetsEditor {
    model: Model;

    constructor(model: Model) {
        this.model = model;
    }

    async createDocument(documentId: string) {
        const result = new GoogleSpreadsheet(documentId);

        await result.useServiceAccountAuth({
            client_email: process.env.CLIENT_EMAIL!,
            private_key: process.env.PRIVATE_KEY!,
        });

        await result.loadInfo();

        return result;
    }

    async getOrCreateSheet(document: GoogleSpreadsheet) {
        const prefix = isDebug() ? 'test' : (new Date()).getFullYear();

        const monthName = this.model.months[(new Date()).getMonth()];
        const sheetName = `${monthName}/${prefix}`;

        const { headerRowIndex } = this.model;

        let sheet = document.sheetsByTitle[sheetName];
        if (!sheet) {
            const sampleSheetName = document.sheetsByTitle[this.model.modelSheetName];

            sheet = await (sampleSheetName as any).duplicate({
                title: sheetName,
            });
        }

        await sheet.loadHeaderRow(headerRowIndex);

        return sheet;
    }

    async pushAmount(documentId: string, amount: number, categoryIndex: number, description: string, userName: string = '') {
        const document = await this.createDocument(documentId);
        const sheet = await this.getOrCreateSheet(document);

        await this.pushAmountCore(sheet, amount, categoryIndex, description, userName);
    }

    private async pushAmountCore(sheet: GoogleSpreadsheetWorksheet, amount: number, categoryIndex: number, description: string, userName: string) {
        const category = this.model.categories[categoryIndex];

        const cells = this.createCells(amount, categoryIndex, userName);
        const { rowIndex } = await sheet.addRow(cells);

        await sheet.loadCells();

        this.writeDescriptionToComment(sheet, category, rowIndex, description);
        this.fillCellsBackGround(sheet, rowIndex);

        await sheet.saveUpdatedCells();
        await sheet.resetLocalCache(false);
    }

    private writeDescriptionToComment(sheet: GoogleSpreadsheetWorksheet, category: ICategory, rowIndex: number, description: string) {
        const result = sheet.getCellByA1(`${category.key}${rowIndex}`);
        result.note = description;
    }

    private fillCellsBackGround(sheet: GoogleSpreadsheetWorksheet, rowIndex: number) {
        const { color1, color2 } = this.model.rowColors;
        const targetColor = (new Date()).getDate() % 2 > 0 ? color1 : color2;

        [this.model.nameColumnName, this.model.dateColumn, ...this.model.categories].forEach(({ key }) => {
            const cell = sheet.getCellByA1(`${key}${rowIndex}`);
            cell.backgroundColor = targetColor;
        });
    }

    private createCells(amount:number, categoryIndex: number, userName: string) {
        const result: IRowData = {};
        const category = this.model.categories[categoryIndex];

        result[this.model.dateColumn.text] = (new Date()).toDateString();
        result[category.text] = amount;
        result[this.model.nameColumnName.text] = userName;

        return result;
    }
}
