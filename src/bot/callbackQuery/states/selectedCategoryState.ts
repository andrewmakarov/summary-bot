import { Context } from 'telegraf';
import { Cache, WithKey, CacheItemBody } from '../../../cache';
import { IFactory } from '../../../factory';
import { SheetModel } from '../../../model/sheetModel/sheetModel';
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

const forwardMessageAllUsers = ({ telegram }: Context, cacheData: WithKey<CacheItemBody>) => {
    const { userMap, userMessageId } = cacheData;

    const userInitiatorId = cacheData.userId;
    const userInitiator = userMap.get(userInitiatorId);

    userMap.forEach((user, userId) => {
        const isNotInitiator = userId !== userInitiatorId;

        if (isNotInitiator) {
            telegram.forwardMessage(user.chatId, userInitiator!.chatId, userMessageId!);
        }
    });
};

const trySendBroadcast = (cacheData: WithKey<CacheItemBody>, categoriesIndex: number, sheetModel: SheetModel, ctx: CallbackQueryContext) => {
    const category = sheetModel.categories[categoriesIndex];
    const currentUser = cacheData.userMap.get(cacheData.userId);

    const currentDocument = sheetModel.documents.find((d) => d.id === currentUser?.currentDocumentId);
    const warningRule = currentDocument?.warnings.find((w) => w.category === category.text && cacheData.amount >= w.amount);

    if (warningRule) {
        forwardMessageAllUsers(ctx, cacheData);
    }

    if (cacheData.amount >= currentDocument!.maxAmountLimitAlert && !warningRule) {
        forwardMessageAllUsers(ctx, cacheData);
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
