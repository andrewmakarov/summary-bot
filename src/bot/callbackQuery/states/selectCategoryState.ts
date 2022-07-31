import { IFactory } from '../../../factory';
import { pushAmountToSheet } from '../../../sheetEditor/pushAmount';
import { cacheIsEmptyText, getSuccessAmountText, tryingAddDInfoText } from '../../../textUtils';
import { getUserName } from '../../utils';
import { CallbackQueryContext, StateDelegate } from '../types';

const tryPushAmountAndGetText = async (guid: string, categoriesIndex: number, userId: number, factory: IFactory) => {
    const { sheetModel, userModel, cache } = factory;

    const data = cache.getAndDelete(guid);
    if (data) {
        const category = sheetModel.categories[categoriesIndex];

        try {
            const user = await userModel.getUser(userId);
            const document = sheetModel.documents.find((d) => d.id === user!.currentDocumentId);
            const userName = getUserName(user!.firstName, user!.lastName);

            await pushAmountToSheet(document!.id, data.amount, categoriesIndex, data.description, userName);

            return getSuccessAmountText(data.amount, document!.currency, category.text);
        } catch (e) {
            return (e as Error).message;
        }
    }

    return cacheIsEmptyText;
};

export const selectCategoryState: StateDelegate = async (ctx: CallbackQueryContext, factory: IFactory, [key, categoriesIndexRaw]: string[]) => {
    const categoriesIndex = parseInt(categoriesIndexRaw, 10);

    await ctx.editMessageText(tryingAddDInfoText, {
        parse_mode: 'Markdown',
        reply_markup: undefined,
    });

    const text = await tryPushAmountAndGetText(key, categoriesIndex, ctx.from!.id, factory);
    await ctx.editMessageText(text, { parse_mode: 'Markdown' });

    ctx.answerCbQuery();
};
