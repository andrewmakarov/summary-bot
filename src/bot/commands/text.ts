import { Context } from 'telegraf';
import { SheetModel } from '../../model/sheetModel';
import { createCategoriesLayout } from '../../buttonLayout';
import { amountEnteredWrongFormatText, selectCategoryText } from '../../textUtils';
import { createCommand } from './base/createCommand';
import { Cache, CacheData } from '../../cache';
import { UserModel } from '../../model/userModel';

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

const command = async (ctx: Context, sheetModel: SheetModel, userModel: UserModel, cache: Cache) => {
    const [amount, description] = calculateAmount((ctx as MessageContext).message.text);
    const isValid = !Number.isNaN(amount) && description !== '';

    if (isValid) {
        const item: CacheData = { amount, description, ctx };
        const key = cache.add(item);

        const keyboardLayout = createCategoriesLayout(key);

        const message = await ctx.reply(selectCategoryText, {
            reply_markup: { inline_keyboard: keyboardLayout },
            reply_to_message_id: ctx.message?.message_id,
        });

        item.messageId = message.message_id;
    } else {
        ctx.reply(amountEnteredWrongFormatText, {
            parse_mode: 'Markdown',
            reply_to_message_id: ctx.message?.message_id,
        });
    }
};

export const textCommand = createCommand(command);
