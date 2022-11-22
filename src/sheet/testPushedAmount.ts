import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import { factory } from '../factory';
import { AmountInfo } from '../intermediateTypes';

export const testPushedAmount = async ([sheet, document]: [GoogleSpreadsheetWorksheet, GoogleSpreadsheet], rowIndex: number, amountInfo: AmountInfo) => {
    const { sheetModel } = factory;
    await document.loadInfo();
    await sheet.loadCells();

    const category = sheetModel.categories[amountInfo.categoryIndex];

    const cell = sheet.getCellByA1(`${category.key}${rowIndex}`);

    if (cell.value !== amountInfo.amount) {
        return false;
    }

    if (cell.note !== amountInfo.description) {
        return false;
    }

    return true;
};
