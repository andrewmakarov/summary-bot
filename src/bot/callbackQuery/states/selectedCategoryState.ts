import { GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import { Context } from 'telegraf';
import { Cache, WithKey, ICacheItemBody } from '../../../cache';
import { IFactory } from '../../../factory';
import { AmountInfo } from '../../../intermediateTypes';
import { SheetModel } from '../../../model/sheetModel/sheetModel';
import { createDocuments } from '../../../sheet/core';
import { addAmountToSheet } from '../../../sheet/pushAmount';
import { checkIsAmountAdded } from '../../../sheet/checkIsAmountAdded';
import { presets } from '../../../text';
import { textBuilder } from '../../../text/textBuilder';
import { bold } from '../../../text/utils';
import { botDecorator } from '../../decorators';
import { CallbackQueryContext, StateDelegate } from '../types';

const tryPushAmountAndGetText = async (sheet: GoogleSpreadsheetWorksheet, amountInfo: AmountInfo): Promise<[boolean, number]> => {
    try {
        const rowKey = await addAmountToSheet(sheet, amountInfo.amount, amountInfo.categoryIndex, amountInfo.description, amountInfo.user?.userName);

        return [true, rowKey];
    } catch (e) {
        // senla
        return [false, -1];
    }
};

const forwardMessageAllUsers = ({ telegram }: Context, cacheData: WithKey<ICacheItemBody>) => {
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

const trySendBroadcast = (cacheData: WithKey<ICacheItemBody>, categoriesIndex: number, sheetModel: SheetModel, ctx: CallbackQueryContext) => {
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
    const categoryIndex = parseInt(categoriesIndexRaw, 10);

    await ctx.editMessageText(presets.static.tryingAddInfo(), {
        parse_mode: 'Markdown',
        reply_markup: undefined,
    });

    await ctx.answerCbQuery();

    const cacheData = (ctx.state.cache as Cache).getAndDelete(key);

    if (cacheData) {
        const { sheetModel } = factory;

        const user = cacheData.userMap.get(cacheData.userId);
        const documentModel = sheetModel.documents.find((d) => d.id === user!.currentDocumentId);
        const [sheet, document] = await createDocuments(documentModel!.id);
        const amountData = { ...cacheData, ...{ user, categoryIndex } };

        const [isSuccess, rowKey] = await tryPushAmountAndGetText(sheet, amountData);

        if (isSuccess) {
            trySendBroadcast(cacheData, categoryIndex, factory.sheetModel, ctx);

            const category = sheetModel.categories[categoryIndex];
            const text = textBuilder()
                .space()
                .amount(cacheData.amount, documentModel!.currency, bold)
                .rightIcon()
                .text(category.text, bold);

            await botDecorator(ctx).editText(textBuilder().icon('☑️').merge(text).done());

            const isAmountPushed = await checkIsAmountAdded([sheet, document], rowKey, amountData);
            const resultEmoji = isAmountPushed ? '✅' : '❌';

            botDecorator(ctx).editText(textBuilder().icon(resultEmoji).merge(text).done());
        } else {
            botDecorator(ctx).errorTo.currentText();
        }
    } else {
        botDecorator(ctx).errorTo.currentText();
    }
};
