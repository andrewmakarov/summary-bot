import { IFactory } from '../../../factory';
import { getDefaultDocumentText, tryingAddDInfoText } from '../../../textUtils';
import { CallbackQueryContext, StateDelegate } from '../types';

export const selectedDocumentState: StateDelegate = async (ctx: CallbackQueryContext, { sheetModel, userModel }: IFactory, [documentId]: string[]) => {
    const userId = ctx.from!.id;

    const document = sheetModel.documents.find((d) => d.id === documentId);

    await ctx.editMessageText(tryingAddDInfoText);

    await userModel.setDocumentId(userId, documentId);
    await ctx.editMessageText(getDefaultDocumentText(document!.text), { parse_mode: 'Markdown' });

    ctx.answerCbQuery();
};
