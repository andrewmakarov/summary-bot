import { Context } from 'telegraf';
import { SheetModel } from '../../model/sheetModel';
import { UserModel } from '../../model/userModel';
import { getTodaySummary } from '../../sheetEditor/getTodaySummary';
import { createCommand } from './base/createCommand';

const command = async (ctx: Context, sheetModel: SheetModel, userModel: UserModel) => {
    // ctx.reply('http://google.ru');

    const user = await userModel.getUser(ctx.from!.id);
    const document = sheetModel.documents.find((d) => d.id === user!.currentDocumentId);
    const userName = user?.userName || '';

    getTodaySummary(document!.id, userName);
};

export const todayCommand = createCommand(command);
