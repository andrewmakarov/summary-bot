import { CallbackType } from '../../callbackQuery/types';
import { factory } from '../../../factory';
import { presets } from '../../../text';

export interface ILayoutCategory {
    text: string;
    callback_data: string;
}

const createParameters = (callbackType: CallbackType, ...parameters: unknown[]) => [callbackType, ...parameters].join('|');

export const createCategoriesLayout = (key: string, estimatedCategoryIndex: number) => {
    const result: ILayoutCategory[][] = [];
    const { sheetModel } = factory;
    const { categories } = sheetModel;

    if (estimatedCategoryIndex !== -1) {
        const category = categories[estimatedCategoryIndex];

        result.push([{
            text: presets.dynamic.estimatedCategoryText(category.text),
            callback_data: createParameters(CallbackType.SelectCategoryCommand, key, estimatedCategoryIndex),
        }]);
    }

    categories.forEach(({ icon, text }, index) => {
        const cell = {
            text: `${icon} ${text}`,
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

    return [sheetModel.documents.map(({ id, name }) => ({
        text: name,
        callback_data: createParameters(CallbackType.SelectDocumentCommand, id),
    }))];
};
