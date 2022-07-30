import { UserModel } from './model/userModel';
import { SheetModel } from './model/sheetModel';
import SheetsEditor from './sheetsEditor';
import { Cache } from './cache';

export interface IFactory {
    get sheetModel(): SheetModel;

    get userModel(): UserModel;

    get sheetEditor(): SheetsEditor;

    get cache(): Cache;
}

class Factory implements IFactory {
    private userModelInternal: UserModel;

    private sheetModelInternal: SheetModel;

    private sheetEditorInternal: SheetsEditor;

    private cacheInternal: Cache;

    constructor() {
        this.userModelInternal = new UserModel();
        this.sheetModelInternal = new SheetModel();
        this.sheetEditorInternal = new SheetsEditor(this.sheetModelInternal);
        this.cacheInternal = new Cache();
    }

    get sheetModel(): SheetModel {
        return this.sheetModelInternal;
    }

    get userModel(): UserModel {
        return this.userModelInternal;
    }

    get sheetEditor(): SheetsEditor {
        return this.sheetEditorInternal;
    }

    get cache(): Cache {
        return this.cacheInternal;
    }
}

export const factory = new Factory();
