/* eslint-disable arrow-body-style */
import { factory } from '../../factory';
import {
    getTotalSummaryFooterText, getSimplifiedSummaryText, formatSummaryBlockText, noSpendingForCurrentPeriodText, getFormattedAmount,
} from '../../textUtils';
import { createCompiledList, createUserSummaryMap, filterCompiledList } from './core';

const createBodySummary = async (documentId: string, currency: string, startDate: Date, endDate: Date) => {
    const { userModel } = factory;

    const compiledList = await createCompiledList(documentId);
    const filteredList = filterCompiledList(compiledList, startDate, endDate);

    const summaryMap = await createUserSummaryMap(filteredList);

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

    result += getTotalSummaryFooterText(totalAmount, currency);

    return result;
};

const createExpensesMap = async (documentId: string, currency: string, startDate: Date, endDate: Date) => { // TODO
    const compiledList = filterCompiledList(await createCompiledList(documentId), startDate, endDate);

    const map = new Map<string, Array<{ category: string; amount: number }>>();

    compiledList.forEach(({ userName, category, amount }) => {
        if (!map.has(userName)) {
            map.set(userName, []);
        }

        const item = map.get(userName);
        item?.push({ category, amount });
    });

    let result = '';

    map.forEach((expenses, userName) => {
        result += `*${userName}*\n`;

        expenses.forEach((e) => {
            result += `${e.category}: ${getFormattedAmount(e.amount, currency)}\n`;
        });
    });

    return result;
};

export const createGeneralSummary = async (title: string, startDate: Date, endDate: Date = startDate) => {
    const result = factory.sheetModel.activeDocuments
        .map(async ({ name, id, currency }) => {
            const body = await createBodySummary(id, currency, startDate, endDate);

            return formatSummaryBlockText(name, title, body);
        });

    return Promise.all(result);
};
