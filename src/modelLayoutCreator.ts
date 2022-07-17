import Model from './model';

export interface ILayoutCategory {
    text: string;
    callback_data: string;
}

export interface IModelLayoutCreator {
    createCategories(guid: string): ILayoutCategory[][];
    createDocuments(guid: string): { text: string, callback_data: string }[][];
}

export enum CallbackType {
    DocumentSelectedAfterWriteAmount = '1',
    CategorySelected = '2',
}

const createParameters = (callbackType: CallbackType, ...parameters: unknown[]) => [callbackType, ...parameters].join('|');

class ModelLayoutCreator implements IModelLayoutCreator {
    model: Model;

    constructor(model: Model) {
        this.model = model;
    }

    createCategories(guid: string) { // TODO rename
        const resultArray: ILayoutCategory[][] = [];

        this.model.categories.forEach((category, index) => {
            const result = {
                text: category.text,
                callback_data: createParameters(CallbackType.CategorySelected, guid, index),
            };

            if (index % 2 === 0) {
                resultArray.push([]);
            }

            const row = resultArray[resultArray.length - 1 || 0];
            row.push(result);
        });

        return resultArray;
    }

    createDocuments(guid: string) {
        return [this.model.documents.map((document, index) => ({
            text: document.text,
            callback_data: createParameters(CallbackType.DocumentSelectedAfterWriteAmount, guid, index),
        }))];
    }
}

export const createModelLayout = (model: Model): IModelLayoutCreator => new ModelLayoutCreator(model);
