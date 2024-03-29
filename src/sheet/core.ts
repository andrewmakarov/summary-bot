import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import { factory } from '../factory';
import { isDebug } from '../utils';

const { sheetModel } = factory;

export const createDocument = async (documentId: string) => {
    const result = new GoogleSpreadsheet(documentId);

    await result.useServiceAccountAuth({
        client_email: process.env.CLIENT_EMAIL!,
        private_key: process.env.PRIVATE_KEY!,
    });

    await result.loadInfo();

    return result;
};

export const getOrCreateSheetLight = async (document: GoogleSpreadsheet, date?: Date) => { // TODO ?
    const prefix = isDebug() ? 'test' : (new Date()).getFullYear();

    const monthName = sheetModel.months[(date || new Date()).getMonth()];
    const sheetName = `${monthName}/${prefix}`;

    let sheet = document.sheetsByTitle[sheetName];
    if (!sheet) {
        const sampleSheetName = document.sheetsByTitle[sheetModel.modelSheetName];

        sheet = await (sampleSheetName as any).duplicate({
            title: sheetName,
        });
    }

    return sheet;
};

export const getOrCreateSheet = async (document: GoogleSpreadsheet, date?: Date) => {
    const sheet = await getOrCreateSheetLight(document, date);

    const { headerRowIndex } = sheetModel;
    await sheet.loadHeaderRow(headerRowIndex);

    return sheet;
};

export const createDocuments = async (documentId: string): Promise<[GoogleSpreadsheetWorksheet, GoogleSpreadsheet]> => {
    const document = await createDocument(documentId);
    const sheet = await getOrCreateSheet(document);

    return [sheet, document];
};
