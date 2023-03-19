import { factory } from '../factory';
import { loadDocument, getOrCreateSheet } from './core';

const { sheetModel } = factory;

export const getMonthSummary = async (documentId: string) => { // TODO
    const {
        range, spent, left, canSave,
    } = sheetModel.summary;

    const document = await loadDocument(documentId);
    const sheet = await getOrCreateSheet(document, { loadHeaderRow: false });

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
