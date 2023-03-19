import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import { factory } from '../factory';
import { AmountInfo } from '../intermediateTypes';
import { createCompiledList } from './summary/core';

export const checkIsAmountAdded = async ([sheet, document]: [GoogleSpreadsheetWorksheet, GoogleSpreadsheet], rowKey: number, amountInfo: AmountInfo) => {
    const { sheetModel } = factory;

    await createCompiledList(document.spreadsheetId);

    // await document.loadInfo();
    // await sheet.loadCells();

    const category = sheetModel.categories[amountInfo.categoryIndex];

    const cell = sheet.getCellByA1(`${category.key}${24}`);

    if (cell.value !== amountInfo.amount) {
        return false;
    }

    if (cell.note !== amountInfo.description) {
        return false;
    }

    return true;
};
