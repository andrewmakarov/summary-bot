import { GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import { factory } from '../factory';
import { ICategory } from '../model/sheetModel';
import { createDocument, getOrCreateSheet } from './private';

const { sheetModel } = factory;

const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];

export const getTodaySummary = async (documentId: string, userName: string) => {
    const document = await createDocument(documentId);
    const sheet = await getOrCreateSheet(document);

    const rows = await sheet.getRows();

    const todayDate = new Date();
    const todayString = `${todayDate.getDate()}, ${daysOfWeek[todayDate.getDay()]}`;

    const map = new Map<string, number>();

    rows.forEach((row) => {
        const rowDate = row[sheetModel.dateColumn.text];
        if (rowDate === todayString) {
            sheetModel.categories.forEach(({ text }) => {
                const rawValue = row[text];

                if (rawValue) {
                    const value = parseInt((rawValue as string).replaceAll(',', ''), 10);

                    if (!map.has(text)) {
                        map.set(text, 0);
                    }
                    const tempValue = map.get(text);
                    map.set(text, tempValue! + value);
                }
            });
        }
    });
};
