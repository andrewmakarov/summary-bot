import { UserModel } from './model/userModel';
import { SheetModel } from './model/sheetModel';
import { Cache } from './cache';

export interface IFactory {
    get sheetModel(): SheetModel;

    get userModel(): UserModel;

    get cache(): Cache;
}

class Factory implements IFactory {
    private userModelInternal: UserModel;

    private sheetModelInternal: SheetModel;

    private cacheInternal: Cache;

    constructor() {
        this.userModelInternal = new UserModel();
        this.sheetModelInternal = new SheetModel();
        this.cacheInternal = new Cache();
    }

    get sheetModel(): SheetModel {
        return this.sheetModelInternal;
    }

    get userModel(): UserModel {
        return this.userModelInternal;
    }

    get cache(): Cache {
        return this.cacheInternal;
    }
}

export const factory = new Factory();
