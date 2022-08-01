import { factory } from '../factory';
import { createDocument, getOrCreateSheet } from './private';

const { sheetModel } = factory;

interface IDataRow {
    userName: string;
    date: Date;
    amount: number;
    category: string;
    note: string;
}

const createDate = (rawDate: string) => {
    const day = parseInt(rawDate, 10);

    const date = new Date();
    date.setDate(day);

    return date;
};

export const createCompiledList = async (documentId: string) => {
    const document = await createDocument(documentId);
    const sheet = await getOrCreateSheet(document);

    await sheet.loadCells();
    const rows = await sheet.getRows();

    const { dateColumn, userNameColumn } = sheetModel;

    const result: Array<IDataRow> = [];

    rows.forEach((row) => {
        const date = createDate(row[dateColumn.text]);
        const userName = row[userNameColumn.text];

        const categoryConfig = sheetModel.categories.find((c) => !!row[c.text]);
        const category = categoryConfig?.text || '';

        const amount = parseInt((row[category]).replaceAll(',', ''), 10);
        const { note } = sheet.getCellByA1(`${categoryConfig?.key}${row.rowIndex}`);

        const item: IDataRow = {
            date,
            userName,
            category,
            amount,
            note,
        };

        result.push(item);
    });

    return result;
};
