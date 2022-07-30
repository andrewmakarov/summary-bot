import { CallbackType } from './bot/callbackQuery/types';
import { factory } from './factory';

export interface ILayoutCategory {
    text: string;
    callback_data: string;
}

const createParameters = (callbackType: CallbackType, ...parameters: unknown[]) => [callbackType, ...parameters].join('|');

export const createCategoriesLayout = (key: string) => {
    const result: ILayoutCategory[][] = [];
    const { sheetModel } = factory;

    sheetModel.categories.forEach((category, index) => {
        const cell = {
            text: category.text,
            callback_data: createParameters(CallbackType.SelectCategoryCommand, key, index),
        };

        if (index % 2 === 0) {
            result.push([]);
        }

        const lastRowIndex = result.length - 1 || 0;
        const row = result[lastRowIndex];

        row.push(cell);
    });

    return result;
};

export const createDocumentsLayout = () => {
    const { sheetModel } = factory;

    return [sheetModel.documents.map(({ id, text }) => ({
        text,
        callback_data: createParameters(CallbackType.SelectDocumentCommand, id),
    }))];
};
