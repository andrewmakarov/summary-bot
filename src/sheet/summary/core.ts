import { loadDocument, getOrCreateSheet } from '../core';
import { factory } from '../../factory';
import { fromString } from '../../convertors';

interface ISheetRow {
    userName: string;
    date: Date;
    amount: number;
    category: string;
    note: string;
}

const trimDate = (date: Date) => {
    const result = new Date(date);
    result.setMinutes(0, 0, 0);

    return result;
};

export const createCompiledList = async (documentId: string) => {
    const { sheetModel } = factory;
    const document = await loadDocument(documentId);
    const sheet = await getOrCreateSheet(document);

    const { dateColumn, userNameColumn } = sheetModel;

    await sheet.loadCells();
    const rows = await sheet.getRows();

    return rows.map((row) => {
        const datee = sheet.getCellByA1(`${dateColumn.key}${row.rowIndex}`);
        const date = fromString(row[dateColumn.text]).toDate();
        const userName = (sheet.getCellByA1(`${userNameColumn.key}${row.rowIndex}`).value as string).trim();

        const categoryConfig = sheetModel.categories.find((c) => !!row[c.text]);

        if (!categoryConfig) {
            const text = `Document=${document.title}\nSheet=${sheet.title}\n${row.rowIndex} row without info`; // TODO move text
            throw new Error(text);
        }

        const { note, value } = sheet.getCellByA1(`${categoryConfig.key}${row.rowIndex}`);

        return {
            date,
            userName,
            note,
            category: categoryConfig.text,
            amount: value,
        } as ISheetRow;
    });
};

export const filterCompiledList = (compiledList: Array<ISheetRow>, startDate: Date, endDate: Date = startDate) => {
    const trimmedStartDate = trimDate(startDate);
    const trimmedEndDate = trimDate(endDate);

    return compiledList.filter((c) => trimDate(c.date) >= trimmedStartDate && trimDate(c.date) <= trimmedEndDate);
};

export const createUserSummaryMap = async (compiledList: Array<ISheetRow>) => {
    const resultMap = new Map<string, { amount: number, maxAmount: { value: number, category: string, note: string } }>();

    const createDefaultItem = () => ({
        amount: 0,
        maxAmount: {
            value: 0,
            category: '',
            note: '',
        },
    });

    compiledList.forEach((compiledItem) => {
        const { userName } = compiledItem;

        if (!resultMap.has(userName)) {
            resultMap.set(userName, createDefaultItem());
        }

        const mapItem = resultMap.get(userName);
        if (mapItem) {
            mapItem.amount += compiledItem.amount;

            if (compiledItem.amount > mapItem.maxAmount.value) {
                mapItem.maxAmount.value = compiledItem.amount;
                mapItem.maxAmount = {
                    value: compiledItem.amount,
                    category: compiledItem.category,
                    note: compiledItem.note,
                };
            }
        }
    });

    return resultMap;
};
