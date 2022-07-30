import { Context } from 'telegraf';
import { SheetModel } from '../../model/sheetModel';
import { UserModel } from '../../model/userModel';
import { createCommand } from './base/createCommand';

const command = (ctx: Context, sheetModel: SheetModel, userModel: UserModel) => {
    ctx.reply('http://google.ru');
};

export const todayCommand = createCommand(command);
