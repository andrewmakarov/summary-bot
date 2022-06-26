import Model from './model';

export interface ILayoutCategory {
    text: string;
    callback_data: string;
}

export interface IModelLayoutCreator {
    getCategories(guid: string): ILayoutCategory[][];
}

class ModelLayoutCreator implements IModelLayoutCreator {
    model: Model;

    constructor(model: Model) {
        this.model = model;
    }

    getCategories(guid: string) { // TODO rename
        return this.model.categories.map((category, index) => {
            const result = {
                text: category.text,
                callback_data: `${guid}_${index.toString()}`,
            };

            return [result];
        });
    }
}

export const createModelLayout = (model: Model): IModelLayoutCreator => new ModelLayoutCreator(model);
