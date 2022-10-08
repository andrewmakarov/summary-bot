import { Context } from 'telegraf';
import { pleaseWaitText } from '../../../text/core';

export const createWaitingMessage = async (ctx: Context) => {
    const message = await ctx.reply(pleaseWaitText);

    return () => {
        ctx.telegram.deleteMessage(message.chat.id, message.message_id);
    };
};
