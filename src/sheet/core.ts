import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import { factory } from '../factory';
import { isDebug } from '../utils';

const START_A1_CHAR_CODE = 65;
const Months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

interface IGetOrCreateSheet {
    date?: Date,
    loadHeaderRow: boolean
}

const { sheetModel } = factory;

export const loadDocument = async (documentId: string) => {
    const result = new GoogleSpreadsheet(documentId);

    await result.useServiceAccountAuth({
        client_email: process.env.CLIENT_EMAIL!,
        private_key: process.env.PRIVATE_KEY!,
    });

    await result.loadInfo();

    return result;
};

const getOrCreateSheetCore = async (document: GoogleSpreadsheet, date?: Date) => {
    const prefix = isDebug() ? 'test' : (new Date()).getFullYear();

    const monthName = sheetModel.months[(date || new Date()).getMonth()];
    const sheetName = `${monthName}/${prefix}`;

    let sheet = document.sheetsByTitle[sheetName];
    if (!sheet) {
        const sampleSheetName = document.sheetsByTitle[isDebug() ? 'Sample/New' : sheetModel.modelSheetName];

        sheet = await (sampleSheetName as any).duplicate({
            title: sheetName,
        });
    }

    return sheet;
};

export const getOrCreateSheet = async (document: GoogleSpreadsheet, config: IGetOrCreateSheet = { loadHeaderRow: true }) => {
    const sheet = await getOrCreateSheetCore(document, config.date);

    if (config.loadHeaderRow) {
        const { headerRowIndex } = sheetModel;
        await sheet.loadHeaderRow(headerRowIndex);
    }

    return sheet;
};

export const createDocuments = async (documentId: string): Promise<[GoogleSpreadsheetWorksheet, GoogleSpreadsheet]> => { // TODO rename
    const document = await loadDocument(documentId);
    const sheet = await getOrCreateSheet(document);

    return [sheet, document];
};

interface IColumnCategory {
    a1: string;
    icon: string;
    name: string
}

export const loadCategories = async (documentId: string): Promise<Array<IColumnCategory>> => {
    const [sheet] = await createDocuments(documentId);

    return sheet.headerValues
        .slice(3) // TODO
        .map((value, index) => {
            const [icon, name] = value.split(' ');
            const a1 = String.fromCharCode(START_A1_CHAR_CODE + index);

            return { icon, name, a1 } as IColumnCategory;
        });
};
