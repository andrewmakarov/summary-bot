import { UserModel } from './model/userModel';
import { SheetModel } from './model/sheetModel/sheetModel';

export interface IFactory {
    get sheetModel(): SheetModel;
    get userModel(): UserModel;
}

const createFactory = (): IFactory => {
    const sheetModelInternal = new SheetModel();

    const defaultDocumentId = sheetModelInternal.documents[0].id;
    const userModelInternal = new UserModel(defaultDocumentId);

    return {
        sheetModel: sheetModelInternal,
        userModel: userModelInternal,
    };
};

export const factory = createFactory();
