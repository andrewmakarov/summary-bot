import { Context } from 'telegraf';
import { createCategoriesLayout } from '../../buttonLayout';
import { amountEnteredWrongFormatText, selectCategoryText } from '../../textUtils';
import { createCommand } from './base/createCommand';
import { Cache, CacheData } from '../../cache';

type MessageContext = Context & {
    message: { text: string; };
};

const calculateAmount = (text: string): [number, string] => {
    const amount = parseFloat(text);
    let description = '';

    if (!Number.isNaN(amount)) {
        description = text.substring(amount.toString().length).trim();
    }

    return [amount, description];
};

const createCacheItem = (amount: number, description: string, ctx: Context): CacheData => ({
    amount,
    description,
    chatId: ctx.chat?.id,
    inlineMessageId: ctx.inlineMessageId,
});

const command = async (ctx: Context) => {
    const [amount, description] = calculateAmount((ctx as MessageContext).message.text);
    const isValid = !Number.isNaN(amount) && description !== '';

    if (isValid) {
        const cacheItem = createCacheItem(amount, description, ctx);

        const cache = ctx.state.cache as Cache;
        const key = cache.add(cacheItem);

        const keyboardLayout = createCategoriesLayout(key);

        const message = await ctx.reply(selectCategoryText, {
            reply_markup: { inline_keyboard: keyboardLayout },
            reply_to_message_id: ctx.message?.message_id,
        });

        const updatedCacheItem = cache.get(key);
        if (updatedCacheItem) {
            updatedCacheItem.messageId = message.message_id;
        }
    } else {
        ctx.reply(amountEnteredWrongFormatText, {
            parse_mode: 'Markdown',
            reply_to_message_id: ctx.message?.message_id,
        });
    }
};

export const textCommand = createCommand(command);
