import { Context } from 'telegraf';
import { createDocumentsLayout } from '../../buttonLayout';
import { SheetModel } from '../../model/sheetModel';
// import { UserModel } from '../../model/userModel';
import { createCommand } from './base/createCommand';

const command = (ctx: Context, sheetModel: SheetModel) => {
    ctx.reply('Установи текущий документ', {
        reply_markup: {
            inline_keyboard: createDocumentsLayout(),
        },
    });
};

export const summaryCommand = createCommand(command);
