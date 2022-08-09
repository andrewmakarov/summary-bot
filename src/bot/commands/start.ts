import { Context } from 'telegraf';
import { SheetModel } from '../../model/sheetModel';
import { UserModel } from '../../model/userModel';
import { getUserName } from '../utils';
import { createCommand } from './base/createCommand';

const command = async (ctx: Context, sheetModel: SheetModel, userModel: UserModel) => {
    const from = ctx.message?.from;

    if (from) {
        const name = getUserName(from.first_name, from.last_name);
        ctx.reply(`Hi ${name},\nWelcome to summary bot`);

        await userModel.addUser(from.id, getUserName(from.first_name, from.last_name), ctx.chat?.id);
        ctx.reply('You have been successfully added to the system 🎉🎉🎉');
    }
};

export const startCommand = createCommand(command);
