import { Context } from 'telegraf';
import { factory } from '../../../factory';
import { SheetModel } from '../../../model/sheetModel/sheetModel';
import { UserModel } from '../../../model/userModel';

type CommandDelegate = (ctx: Context, sheetModel: SheetModel, userModel: UserModel) => void;

export const createCommand = (command: CommandDelegate) => {
    const { sheetModel, userModel } = factory;

    return (ctx: Context) => command(ctx, sheetModel, userModel);
};
