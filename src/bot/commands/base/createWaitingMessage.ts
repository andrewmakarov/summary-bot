import { Context } from 'telegraf';
import { presets } from '../../../text';

export const createWaitingMessage = async (ctx: Context) => {
    const message = await ctx.reply(presets.static.pleaseWait());

    return () => {
        ctx.telegram.deleteMessage(message.chat.id, message.message_id);
    };
};
