import { Context } from 'telegraf';
import { SheetModel } from '../../model/sheetModel';
import { UserModel } from '../../model/userModel';
import { getMonthSummary } from '../../sheetEditor/getMonthSummary';
import { getSummaryText, iCountText } from '../../textUtils';
import { createCommand } from './base/createCommand';

const command = async (ctx: Context, sheetModel: SheetModel, userModel: UserModel) => {
    const message = await ctx.reply(iCountText);

    const user = await userModel.getUser(ctx.from!.id);
    const document = sheetModel.documents.find((d) => d.id === user!.currentDocumentId);
    const value = await getMonthSummary(document?.id!);

    ctx.telegram.editMessageText(message.chat.id, message.message_id, undefined, getSummaryText(value), {
        parse_mode: 'Markdown',
    });
};

export const summaryCommand = createCommand(command);
