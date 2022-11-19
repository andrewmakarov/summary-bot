import { IFactory } from '../../../factory';
import { presets } from '../../../text';
import { CallbackQueryContext, StateDelegate } from '../types';

export const selectedDocumentState: StateDelegate = async (ctx: CallbackQueryContext, { sheetModel, userModel }: IFactory, [documentId]: string[]) => {
    const userId = ctx.from!.id;

    const document = sheetModel.documents.find((d) => d.id === documentId);

    await ctx.editMessageText(presets.static.tryingAddInfo());

    await userModel.setDocumentId(userId, documentId);
    await ctx.editMessageText(presets.dynamic.defaultDocument(document!.name), { parse_mode: 'Markdown' });

    ctx.answerCbQuery();
};
