import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import Model, { ICategory } from './model';

interface IRowData {
    [key: string]: string | number
}

export default class SheetsEditor {
    model: Model;

    constructor(model: Model) {
        this.model = model;
    }

    async createDocument() {
        const result = new GoogleSpreadsheet(process.env.SPREADSHEET_ID);

        await result.useServiceAccountAuth({
            client_email: process.env.CLIENT_EMAIL!,
            private_key: process.env.PRIVATE_KEY!,
        });

        await result.loadInfo();

        return result;
    }

    async getOrCreateSheet(document: GoogleSpreadsheet) {
        const monthName = this.model.months[(new Date()).getMonth()];
        const { headerRowIndex } = this.model;

        let sheet = document.sheetsByTitle[monthName];
        if (!sheet) {
            const sampleSheetName = document.sheetsByTitle[this.model.modelSheetName];

            sheet = await (sampleSheetName as any).duplicate({
                title: monthName,
            });

            const categoriesWithoutDate = this.model.categories.map((c) => c.text);
            const finalCategories = [this.model.dateColumn.text, ...categoriesWithoutDate];

            await sheet.setHeaderRow(finalCategories, headerRowIndex); // TODO
        } else {
            await sheet.loadHeaderRow(headerRowIndex);
        }

        return sheet;
    }

    async pushAmount(amount: number, categoryIndex: number, description: string, userId: number = 0) {
        const document = await this.createDocument();
        const sheet = await this.getOrCreateSheet(document);

        const userName = this.model.users[userId];
        const newDescription = `${userName}: ${description}`;

        await this.pushAmountCore(sheet, amount, categoryIndex, newDescription);
    }

    private async pushAmountCore(sheet: GoogleSpreadsheetWorksheet, amount: number, categoryIndex: number, description: string) {
        const { dateColumn } = this.model;
        const category = this.model.categories[categoryIndex];

        const cells = this.createCells(amount, categoryIndex);
        const { rowIndex } = await sheet.addRow(cells);

        await sheet.loadCells();

        this.updateAmountCell(sheet, category, rowIndex, description);
        this.updateDateCell(sheet, dateColumn, rowIndex);
        this.fillCellsBackGround(sheet, rowIndex);

        await sheet.saveUpdatedCells();
        await sheet.resetLocalCache(false);
    }

    private updateAmountCell(sheet: GoogleSpreadsheetWorksheet, category: ICategory, rowIndex: number, description: string) {
        const result = sheet.getCellByA1(`${category.key}${rowIndex}`);
        result.note = description;
        result.numberFormat = this.model.defaultFormat;
        result.horizontalAlignment = 'LEFT';
    }

    private updateDateCell(sheet: GoogleSpreadsheetWorksheet, dateColumn: ICategory, rowIndex: number) {
        const result = sheet.getCellByA1(`${dateColumn.key}${rowIndex}`);
        result.numberFormat = dateColumn.format!;
        result.horizontalAlignment = 'LEFT';
    }

    private fillCellsBackGround(sheet: GoogleSpreadsheetWorksheet, rowIndex: number) {
        const { color1, color2 } = this.model.rowColors;
        const targetColor = (new Date()).getDate() % 2 > 0 ? color1 : color2;

        [this.model.dateColumn, ...this.model.categories].forEach(({ key }) => {
            const cell = sheet.getCellByA1(`${key}${rowIndex}`);

            cell.backgroundColor = targetColor;
        });
    }

    private createCells(amount:number, categoryIndex: number) {
        const result: IRowData = {};

        const categoryObject = this.model.categories[categoryIndex];

        result[this.model.dateColumn.text] = (new Date()).toDateString();
        result[categoryObject.text] = amount;

        return result;
    }
}
