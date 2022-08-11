import { Context } from 'telegraf';
import { Cache, WithKey, CacheItemBody } from '../../../cache';
import { IFactory } from '../../../factory';
import { SheetModel } from '../../../model/sheetModel';
import { pushAmountToSheet } from '../../../sheetEditor/pushAmount';
import {
    cacheIsEmptyText, formatErrorText, formatSuccessAmountText, getMaxAmountLimitText, getWarningText, tryingAddDInfoText,
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

const foreachByUsers = ({ telegram }: Context, cacheData: WithKey<CacheItemBody>, onGetText: (userName: string) => string) => {
    const { userMap, userMessageId } = cacheData;

    const userInitiatorId = cacheData.userId;
    const userInitiator = userMap.get(userInitiatorId);
    const text = onGetText(userInitiator!.userName);

    userMap.forEach((user, userId) => {
        const isNotInitiator = userId !== userInitiatorId;

        if (isNotInitiator) {
            telegram.sendMessage(user.chatId, text, { parse_mode: 'MarkdownV2' })
                .then(() => telegram.forwardMessage(user.chatId, userInitiator!.chatId, userMessageId!));
        }
    });
};

const trySendBroadcast = (cacheData: WithKey<CacheItemBody>, categoriesIndex: number, sheetModel: SheetModel, ctx: CallbackQueryContext) => {
    const category = sheetModel.categories[categoriesIndex];
    const currentUser = cacheData.userMap.get(cacheData.userId);

    const currentDocument = sheetModel.documents.find((d) => d.id === currentUser?.currentDocumentId);
    const warningRule = currentDocument?.warnings.find((w) => w.category === category.text && cacheData.amount >= w.amount);

    if (warningRule) {
        foreachByUsers(ctx, cacheData, (userName) => getWarningText(userName, category.text));
    }

    if (cacheData.amount >= currentDocument!.maxAmountLimitAlert && !warningRule) {
        foreachByUsers(ctx, cacheData, (userName) => getMaxAmountLimitText(userName, category.text, cacheData.amount, currentDocument!.currency));
    }
};

export const selectedCategoryState: StateDelegate = async (ctx: CallbackQueryContext, factory: IFactory, [key, categoriesIndexRaw]: string[]) => {
    const categoriesIndex = parseInt(categoriesIndexRaw, 10);

    await ctx.editMessageText(tryingAddDInfoText, {
        parse_mode: 'Markdown',
        reply_markup: undefined,
    });

    const cache = ctx.state.cache as Cache;
    const cacheData = cache.getAndDelete(key);

    const [isSuccess, text] = cacheData
        ? await tryPushAmountAndGetText(cacheData, categoriesIndex, factory) : [false, cacheIsEmptyText];

    if (isSuccess && cacheData) {
        trySendBroadcast(cacheData, categoriesIndex, factory.sheetModel, ctx);
    }

    await ctx.editMessageText(text, { parse_mode: 'Markdown' });
    await ctx.answerCbQuery();
};
