import { factory } from '../../factory';
import { selectedCategoryState } from './states/selectedCategoryState';
import { selectedDocumentState } from './states/selectedDocumentState';
import { CallbackQueryContext, CallbackType } from './types';

export const callbackQueryCommand = (ctx: CallbackQueryContext) => {
    const callbackResult = ctx.callbackQuery.data || '';
    const [callbackType, ...callbackParams] = callbackResult.split('|');

    switch (callbackType) {
        case CallbackType.SelectDocumentCommand: {
            selectedDocumentState(ctx, factory, callbackParams);
            break;
        }
        case CallbackType.SelectCategoryCommand: {
            selectedCategoryState(ctx, factory, callbackParams);
            break;
        }
        default:
            throw new Error('Don\'t know callback type');
    }
};
