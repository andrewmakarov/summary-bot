import { GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import { factory } from '../factory';
import { ICategory } from '../model/sheetModel';
import { createDocument, getOrCreateSheet } from './private';
import { createCompiledList } from './summaryUtils';

const { sheetModel } = factory;

interface IDataRow {
    userName: string;
    date: Date;
    amount: number;
    category: string;
}

export const getTodaySummary = async (documentId: string, userName: string) => {
    const document = await createCompiledList(documentId);
    const t = 1;
};
