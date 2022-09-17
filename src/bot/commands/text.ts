import { Context } from 'telegraf';
import { createCategoriesLayout } from './base/buttonLayout';
import { amountEnteredWrongFormatText, selectCategoryText } from '../../textUtils';
import { createCommand } from './base/createCommand';
import { Cache } from '../../cache/cache';
import { factory } from '../../factory';

type MessageContext = Context & {
    message: { text: string; };
};

const getEstimatedCategoryIndex = (description: string) => {
    const { sheetModel } = factory;
    const preparedDescription = description.toLowerCase();

    return sheetModel.categories.findIndex(({ keywords }) => keywords.some((word) => preparedDescription.match(word)));
};

const calculateAmount = (text: string): [number, string] => {
    const amount = parseFloat(text);
    let description = '';

    if (!Number.isNaN(amount)) {
        description = text.substring(amount.toString().length).trim();
    }

    return [amount, description];
};

const command = async (ctx: Context) => {
    const [amount, description] = calculateAmount((ctx as MessageContext).message.text);
    const isValid = !Number.isNaN(amount) && description !== '';

    if (isValid) {
        const userMap = await factory.userModel.getUserMap();

        const cacheItem = {
            amount,
            description,
            userMap,
            userId: ctx.from?.id!,
            userMessageId: ctx.message?.message_id,
        };

        const cache = ctx.state.cache as Cache;
        const key = cache.add(cacheItem);

        const estimatedCategoryIndex = getEstimatedCategoryIndex(description);

        const message = await ctx.reply(selectCategoryText, {
            reply_markup: { inline_keyboard: createCategoriesLayout(key, estimatedCategoryIndex) },
            reply_to_message_id: ctx.message?.message_id,
        });

        cache.update(key, { messageId: message.message_id });
    } else {
        ctx.reply(amountEnteredWrongFormatText, {
            parse_mode: 'MarkdownV2',
            reply_to_message_id: ctx.message?.message_id,
        });
    }
};

export const textCommand = createCommand(command);
