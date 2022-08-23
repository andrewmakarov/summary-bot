/* eslint-disable arrow-body-style */
import { factory } from '../factory';
import {
    getSimplifiedSummaryFooterText, getSimplifiedSummaryText, getSimplifiedSummaryTexTitle, noSpendingForCurrentPeriodText,
} from '../textUtils';
import { createDocument, getOrCreateSheet } from './private';

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

const createCompiledList = async (documentId: string) => {
    const document = await createDocument(documentId);
    const sheet = await getOrCreateSheet(document);
    const { dateColumn, userNameColumn } = sheetModel;

    await sheet.loadCells();
    const rows = await sheet.getRows();

    const createDate = (rawDate: string) => {
        const day = parseInt(rawDate, 10);

        const date = new Date();
        date.setDate(day);

        return date;
    };

    return rows.map((row) => {
        const date = createDate(row[dateColumn.text]);
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

export const createFilteredSummaryMap = async (documentId: string, startDate: Date, endDate: Date = startDate) => {
    const resultMap = new Map<string, { amount: number, maxAmount: { value: number, category: string, note: string } }>();
    const compiledList = await createCompiledList(documentId);

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

        if (trimDate(compiledItem.date) >= trimDate(startDate) && trimDate(compiledItem.date) <= trimDate(endDate)) {
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
        }
    });

    return resultMap;
};

const createTextSummaries = async (documentId: string, currency: string, startDate: Date, endDate: Date) => {
    const { userModel } = factory;
    const summaryMap = await createFilteredSummaryMap(documentId, startDate, endDate);

    let result = '';
    let totalAmount = 0;

    await (await userModel.getUserMap()).forEach(({ userName }) => {
        if (!summaryMap.has(userName)) {
            result += `*${userName}*\n💰 ${noSpendingForCurrentPeriodText}\n\n`;
        }
    });

    summaryMap.forEach((summary, userName) => {
        result += getSimplifiedSummaryText(userName, currency, summary);
        totalAmount += summary.amount;
    });

    result += getSimplifiedSummaryFooterText(totalAmount, currency);

    return result;
};

export const createGeneralSummary = async (title: string, startDate: Date, endDate: Date = startDate) => {
    const result = factory.sheetModel.documents
        .filter((d) => d.active)
        .map(async ({ name, id, currency }) => {
            const documentSummary = await createTextSummaries(id, currency, startDate, endDate);

            return getSimplifiedSummaryTexTitle(name, title, documentSummary);
        });

    return Promise.all(result);
};
