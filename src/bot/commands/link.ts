import { Context } from 'telegraf';
import { SHEET_PATH } from '../../constants';
import { SheetModel } from '../../model/sheetModel';
import { createCommand } from './base/createCommand';

const command = (ctx: Context, sheetModel: SheetModel) => {
    sheetModel.documents.forEach((document) => {
        const text = `[${document.name}](${SHEET_PATH}${document.id})`;

        ctx.reply(text, {
            parse_mode: 'Markdown',
        });
    });
};

export const linkCommand = createCommand(command);
