import { Context } from 'telegraf';
import { Cache } from '../../../cache';
import { factory } from '../../../factory';
import { SheetModel } from '../../../model/sheetModel';
import { UserModel } from '../../../model/userModel';

type CommandDelegate = (ctx: Context, sheetModel: SheetModel, userModel: UserModel, cache: Cache) => void;

export const createCommand = (command: CommandDelegate) => {
    const { sheetModel, userModel, cache } = factory;

    return (ctx: Context) => command(ctx, sheetModel, userModel, cache);
};
