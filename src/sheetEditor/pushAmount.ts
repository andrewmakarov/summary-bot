import { GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import { factory } from '../factory';
import { ICategory } from '../model/sheetModel/sheetModel';
import { createDocument, getOrCreateSheet } from './private';

const { sheetModel } = factory;

interface IRowData {
    [key: string]: string | number
}

const writeDescriptionToComment = (sheet: GoogleSpreadsheetWorksheet, category: ICategory, rowIndex: number, description: string) => {
    const result = sheet.getCellByA1(`${category.key}${rowIndex}`);
    result.note = description;
};

const fillCellsBackGround = (sheet: GoogleSpreadsheetWorksheet, rowIndex: number) => {
    const { color1, color2 } = sheetModel.rowColors;
    const targetColor = (new Date()).getDate() % 2 > 0 ? color1 : color2;

    [sheetModel.userNameColumn, sheetModel.dateColumn, ...sheetModel.categories].forEach(({ key }) => {
        const cell = sheet.getCellByA1(`${key}${rowIndex}`);
        cell.backgroundColor = targetColor;
    });
};

const createCells = (amount:number, categoryIndex: number, userName: string) => {
    const result: IRowData = {};
    const category = sheetModel.categories[categoryIndex];

    result[sheetModel.dateColumn.text] = (new Date()).toDateString();
    result[category.text] = amount;
    result[sheetModel.userNameColumn.text] = userName;

    return result;
};

const pushAmountCore = async (sheet: GoogleSpreadsheetWorksheet, amount: number, categoryIndex: number, description: string, userName: string) => {
    const category = sheetModel.categories[categoryIndex];

    const cells = createCells(amount, categoryIndex, userName);
    const { rowIndex } = await sheet.addRow(cells);

    await sheet.loadCells();

    writeDescriptionToComment(sheet, category, rowIndex, description);
    fillCellsBackGround(sheet, rowIndex);

    await sheet.saveUpdatedCells();
    await sheet.resetLocalCache(false);
};

export const pushAmountToSheet = async (documentId: string, amount: number, categoryIndex: number, description: string, userName: string = '') => {
    const document = await createDocument(documentId);
    const sheet = await getOrCreateSheet(document);

    await pushAmountCore(sheet, amount, categoryIndex, description, userName);
};
