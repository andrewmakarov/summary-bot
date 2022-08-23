import { UserModel } from './model/userModel';
import { SheetModel } from './model/sheetModel/sheetModel';

export interface IFactory {
    get sheetModel(): SheetModel;

    get userModel(): UserModel;
}

class Factory implements IFactory {
    private userModelInternal: UserModel;

    private sheetModelInternal: SheetModel;

    constructor() {
        this.sheetModelInternal = new SheetModel();

        const defaultDocumentId = this.sheetModelInternal.documents[0].id;
        this.userModelInternal = new UserModel(defaultDocumentId);
    }

    get sheetModel(): SheetModel {
        return this.sheetModelInternal;
    }

    get userModel(): UserModel {
        return this.userModelInternal;
    }
}

export const factory = new Factory();
