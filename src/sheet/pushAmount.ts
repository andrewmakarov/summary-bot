import { GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import { factory } from '../factory';
import { ICategory } from '../model/sheetModel/sheetModel';

const { sheetModel } = factory;

interface IRowData {
    [key: string]: string | number
}

const addNoteToCell = (sheet: GoogleSpreadsheetWorksheet, category: ICategory, rowIndex: number, description: string) => {
    const cell = sheet.getCellByA1(`${category.key}${rowIndex}`);
    cell.note = description;
};

const fillBackColorRow = (sheet: GoogleSpreadsheetWorksheet, rowIndex: number) => {
    const { color1, color2 } = sheetModel.rowColors;
    const targetColor = (new Date()).getDate() % 2 > 0 ? color1 : color2;
    const columns = [sheetModel.userNameColumn, sheetModel.dateColumn, ...sheetModel.categories];

    columns.forEach(({ key }) => {
        const cell = sheet.getCellByA1(`${key}${rowIndex}`);
        cell.backgroundColor = targetColor;
    });
};

const createDataRow = (amount:number, categoryIndex: number, userName: string): IRowData => {
    const result = {};
    const category = sheetModel.categories[categoryIndex];

    // eslint-disable-next-line @typescript-eslint/dot-notation
    result['Key'] = new Date().valueOf(); // TODO
    result[sheetModel.userNameColumn.text] = userName;
    result[sheetModel.dateColumn.text] = (new Date()).toDateString();
    result[category.text] = amount;

    return result;
};

export const addAmountToSheet = async (sheet: GoogleSpreadsheetWorksheet, amount: number, categoryIndex: number, description: string, userName: string = '') => {
    const category = sheetModel.categories[categoryIndex];

    const dataRow = createDataRow(amount, categoryIndex, userName);
    const sheetRow = await sheet.addRow(dataRow);

    await sheet.loadCells();

    addNoteToCell(sheet, category, sheetRow.rowIndex, description);
    fillBackColorRow(sheet, sheetRow.rowIndex);

    await sheet.saveUpdatedCells();
    await sheet.resetLocalCache(false);

    return dataRow.Key as number;
};
