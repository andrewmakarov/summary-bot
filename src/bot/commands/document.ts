import { Context } from 'telegraf';
import { createDocumentsLayout } from './base/buttonLayout';
import { createCommand } from './base/createCommand';

const command = (ctx: Context) => {
    ctx.reply('Установи текущий документ', {
        reply_markup: {
            inline_keyboard: createDocumentsLayout(),
        },
    });
};

export const documentCommand = createCommand(command);
