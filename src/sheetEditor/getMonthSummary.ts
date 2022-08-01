import { factory } from '../factory';
import { createDocument, getOrCreateSheetLight } from './private';

const { sheetModel } = factory;

export const getMonthSummary = async (documentId: string) => {
    const {
        range, spent, left, canSave,
    } = sheetModel.summary;

    const document = await createDocument(documentId);
    const sheet = await getOrCreateSheetLight(document);

    await sheet.loadCells(range);

    const rows = await sheet.getRows();

    const spentValue = rows[0][spent];
    const leftValue = rows[0][left];
    const canSaveValue = rows[0][canSave];

    return {
        spentValue,
        leftValue,
        canSaveValue,
    };
};
