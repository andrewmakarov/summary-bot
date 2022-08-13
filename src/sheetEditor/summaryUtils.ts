/* eslint-disable arrow-body-style */
import { factory } from '../factory';
import { noSpendingForCurrentPeriodText } from '../textUtils';
import { createDocument, getOrCreateSheet } from './private';

const { sheetModel } = factory;

interface ISheetRow {
    userName: string;
    date: Date;
    amount: number;
    category: string;
    note: string;
}

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

const createSummaryMap = async (documentId: string, startDate: Date, endDate: Date) => {
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

        if (compiledItem.date >= startDate && compiledItem.date <= endDate) {
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

const getFormattedAmount = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'decimal' }).format(value) + currency;
};

const createDocumentSummary = async (documentId: string, currency: string, startDate: Date, endDate: Date) => {
    const { userModel } = factory;
    const summaryMap = await createSummaryMap(documentId, startDate, endDate);

    let result = '';

    await (await userModel.getUserMap()).forEach(({ userName }) => {
        if (!summaryMap.has(userName)) {
            result += `*${userName}*\n💰 ${noSpendingForCurrentPeriodText}\n\n`;
        }
    });

    summaryMap.forEach((summary, userName) => {
        result += `*${userName}*
💰 Всего *${getFormattedAmount(summary.amount, currency)}*
🔥 Самая дорогая покупка *${getFormattedAmount(summary.maxAmount.value, currency)}* в ${summary.maxAmount.category}'е (${summary.maxAmount.note})\n\n`;
    });

    return result;
};

export const createGeneralSummary = (title: string, startDate: Date, endDate: Date) => {
    return factory.sheetModel.documents
        .filter((d) => d.active)
        .map(async ({ name, id, currency }) => {
            const documentSummary = await createDocumentSummary(id, currency, startDate, endDate);
            const result = `📚 ${name}: ${title}\n\n${documentSummary}`;

            return result;
        });
};
