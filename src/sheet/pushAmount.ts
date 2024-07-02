import { GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import { factory } from '../factory';
import { ICategory } from '../model/sheetModel/sheetModel';

const { sheetModel } = factory;

interface IRowData {
    [key: string]: string | number
}

const writeNote = (sheet: GoogleSpreadsheetWorksheet, category: ICategory, rowIndex: number, description: string) => {
    const cell = sheet.getCellByA1(`${category.key}${rowIndex}`);
    cell.note = description;
};

const fillBackGround = (sheet: GoogleSpreadsheetWorksheet, rowIndex: number) => {
    const { color1, color2 } = sheetModel.rowColors;
    const targetColor = (new Date()).getDate() % 2 > 0 ? color1 : color2;
    const columns = [sheetModel.userNameColumn, sheetModel.dateColumn, ...sheetModel.categories];

    columns.forEach(({ key }) => {
        const cell = sheet.getCellByA1(`${key}${rowIndex}`);
        cell.backgroundColor = targetColor;
    });
};

const createRow = (amount:number, categoryIndex: number, userName: string): IRowData => {
    const result = {};
    const category = sheetModel.categories[categoryIndex];

    result[sheetModel.dateColumn.text] = (new Date()).toDateString();
    result[category.text] = amount;
    result[sheetModel.userNameColumn.text] = userName;

    return result;
};

const pushAmountCore = async (sheet: GoogleSpreadsheetWorksheet, amount: number, categoryIndex: number, description: string, userName: string) => {
    const category = sheetModel.categories[categoryIndex];

    const row = createRow(amount, categoryIndex, userName);
    const { rowIndex } = await sheet.addRow(row);

    await sheet.loadCells();

    writeNote(sheet, category, rowIndex, description);
    fillBackGround(sheet, rowIndex);

    await sheet.saveUpdatedCells();
    await sheet.resetLocalCache(false);

    return rowIndex;
};

export const pushAmountToSheet = async (sheet: GoogleSpreadsheetWorksheet, amount: number, categoryIndex: number, description: string, userName: string = '') => {
    const result = await pushAmountCore(sheet, amount, categoryIndex, description, userName);
    return result;
};
