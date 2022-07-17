import Model from './model';

export interface ILayoutCategory {
    text: string;
    callback_data: string;
}

export enum CallbackType {
    SelectCategoryCommand = '1',
    SelectDocumentCommand = '2',
}

const createParameters = (callbackType: CallbackType, ...parameters: unknown[]) => [callbackType, ...parameters].join('|');

class ModelLayoutCreator {
    model: Model;

    constructor(model: Model) {
        this.model = model;
    }

    createCategories(guid: string) { // TODO rename
        const resultArray: ILayoutCategory[][] = [];

        this.model.categories.forEach((category, index) => {
            const result = {
                text: category.text,
                callback_data: createParameters(CallbackType.SelectCategoryCommand, guid, index),
            };

            if (index % 2 === 0) {
                resultArray.push([]);
            }

            const row = resultArray[resultArray.length - 1 || 0];
            row.push(result);
        });

        return resultArray;
    }

    createDocuments() {
        return [this.model.documents.map(({ id, text }) => ({
            text,
            callback_data: createParameters(CallbackType.SelectDocumentCommand, id),
        }))];
    }
}

export const createModelLayout = (model: Model): ModelLayoutCreator => new ModelLayoutCreator(model);
