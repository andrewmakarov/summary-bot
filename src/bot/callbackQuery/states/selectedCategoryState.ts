import { Cache, WithKey, CacheItemBody } from '../../../cache';
import { IFactory } from '../../../factory';
import { pushAmountToSheet } from '../../../sheetEditor/pushAmount';
import {
    cacheIsEmptyText, formatErrorText, formatSuccessAmountText, tryingAddDInfoText,
} from '../../../textUtils';
import { CallbackQueryContext, StateDelegate } from '../types';

const tryPushAmountAndGetText = async (data: WithKey<CacheItemBody>, categoriesIndex: number, userId: number, factory: IFactory) => {
    const { sheetModel } = factory;

    if (data) {
        const category = sheetModel.categories[categoriesIndex];

        try {
            const user = data.userMap.get(data.userId);
            const document = sheetModel.documents.find((d) => d.id === user!.currentDocumentId);

            await pushAmountToSheet(document!.id, data.amount, categoriesIndex, data.description, user?.userName);

            return formatSuccessAmountText(data.amount, document!.currency, document!.name, category.text);
        } catch (e) {
            return formatErrorText((e as Error).message);
        }
    }

    return cacheIsEmptyText;
};

export const selectedCategoryState: StateDelegate = async (ctx: CallbackQueryContext, factory: IFactory, [key, categoriesIndexRaw]: string[]) => {
    const categoriesIndex = parseInt(categoriesIndexRaw, 10);

    await ctx.editMessageText(tryingAddDInfoText, {
        parse_mode: 'Markdown',
        reply_markup: undefined,
    });

    const cache = ctx.state.cache as Cache;
    const data = cache.getAndDelete(key);

    const text = data
        ? await tryPushAmountAndGetText(data, categoriesIndex, ctx.from!.id, factory)
        : cacheIsEmptyText;

    // await ctx.telegram.forwardMessage(5527199508, data?.chatId!, data?.messageId!, { disable_notification: false });

    ctx.editMessageText(text, { parse_mode: 'Markdown' });
    ctx.answerCbQuery();
};
