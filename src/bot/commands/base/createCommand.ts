import { Context } from 'telegraf';
import { Cache } from '../../../cache';
import { factory } from '../../../factory';
import { SheetModel } from '../../../model/sheetModel';
import { UserModel } from '../../../model/userModel';
import SheetsEditor from '../../../sheetsEditor';

type CommandDelegate = (ctx: Context, sheetModel: SheetModel, userModel: UserModel, sheetEditor: SheetsEditor, cache: Cache) => void;

export const createCommand = (command: CommandDelegate) => {
    const {
        sheetModel, userModel, sheetEditor, cache,
    } = factory;

    return (ctx: Context) => command(ctx, sheetModel, userModel, sheetEditor, cache);
};
