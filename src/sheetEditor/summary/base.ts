import { createDocument, getOrCreateSheet } from '../private';
import { factory } from '../../factory';

const { sheetModel } = factory;

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

const createDateFromString = (rawDate: string) => {
    const day = parseInt(rawDate, 10);

    const date = new Date();
    date.setDate(day);

    return date;
};

export const createCompiledList = async (documentId: string) => {
    const document = await createDocument(documentId);
    const sheet = await getOrCreateSheet(document);
    const { dateColumn, userNameColumn } = sheetModel;

    await sheet.loadCells();
    const rows = await sheet.getRows();

    return rows.map((row) => {
        const date = createDateFromString(row[dateColumn.text]);
        const userName = row[userNameColumn.text].trim();

        const categoryConfig = sheetModel.categories.find((c) => !!row[c.text]);
        const category = categoryConfig!.text;

        const amount = parseInt((row[category]).replaceAll(',', ''), 10);
        const { note } = sheet.getCellByA1(`${categoryConfig?.key}${row.rowIndex}`);

        return {
            date,
            userName,
            category,
            amount,
            note,
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
