import { Cache, WithKey, CacheItemBody } from '../../../cache';
import { IFactory } from '../../../factory';
import { pushAmountToSheet } from '../../../sheetEditor/pushAmount';
import {
    cacheIsEmptyText, formatErrorText, formatSuccessAmountText, tryingAddDInfoText,
} from '../../../textUtils';
import { CallbackQueryContext, StateDelegate } from '../types';

const tryPushAmountAndGetText = async (
    data: WithKey<CacheItemBody>,
    categoriesIndex: number,
    factory: IFactory,
): Promise<[boolean, string]> => {
    const { sheetModel } = factory;
    const category = sheetModel.categories[categoriesIndex];

    try {
        const user = data.userMap.get(data.userId);
        const document = sheetModel.documents.find((d) => d.id === user!.currentDocumentId);

        await pushAmountToSheet(document!.id, data.amount, categoriesIndex, data.description, user?.userName);

        return [true, formatSuccessAmountText(data.amount, document!.currency, document!.name, category.text)];
    } catch (e) {
        return [false, formatErrorText((e as Error).message)];
    }
};

export const selectedCategoryState: StateDelegate = async (ctx: CallbackQueryContext, factory: IFactory, [key, categoriesIndexRaw]: string[]) => {
    const categoriesIndex = parseInt(categoriesIndexRaw, 10);

    await ctx.editMessageText(tryingAddDInfoText, {
        parse_mode: 'Markdown',
        reply_markup: undefined,
    });

    const cache = ctx.state.cache as Cache;
    const data = cache.getAndDelete(key);

    const [isSuccess, text] = data
        ? await tryPushAmountAndGetText(data, categoriesIndex, factory) : [false, cacheIsEmptyText];

    if (isSuccess && data) {
        const { sheetModel } = factory;
        const category = sheetModel.categories[categoriesIndex];
        const currentUser = data.userMap.get(data.userId);

        const currentDocument = sheetModel.documents.find((d) => d.id === currentUser?.currentDocumentId);
        const warningRule = currentDocument?.warnings.find((w) => w.category === category.text && data.amount >= w.amount);

        if (warningRule) {
            data.userMap.forEach((user, userId) => {
                if (userId !== data.userId) {
                    ctx.telegram.sendMessage(user.chatId, 'Смотри, что творит')
                        .then(() => {
                            ctx.telegram.forwardMessage(user.chatId, currentUser?.chatId || 0, data.userMessageId!);
                        });
                }
            });
        }
    }

    await ctx.editMessageText(text, { parse_mode: 'Markdown' });
    await ctx.answerCbQuery();
};
