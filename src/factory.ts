import { UserModel } from './model/userModel';
import { SheetModel } from './model/sheetModel';

export interface IFactory {
    get sheetModel(): SheetModel;

    get userModel(): UserModel;
}

class Factory implements IFactory {
    private userModelInternal: UserModel;

    private sheetModelInternal: SheetModel;

    constructor() {
        this.userModelInternal = new UserModel();
        this.sheetModelInternal = new SheetModel();
    }

    get sheetModel(): SheetModel {
        return this.sheetModelInternal;
    }

    get userModel(): UserModel {
        return this.userModelInternal;
    }
}

export const factory = new Factory();
