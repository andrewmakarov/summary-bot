import { factory } from '../../factory';
import { selectCategoryState } from './states/selectCategoryState';
import { selectDocumentState } from './states/selectDocumentState';
import { CallbackQueryContext, CallbackType } from './types';

export const callbackQueryCommand = (ctx: CallbackQueryContext) => {
    const callbackResult = ctx.callbackQuery.data || '';
    const [callbackType, ...callbackParams] = callbackResult.split('|');

    switch (callbackType) {
        case CallbackType.SelectDocumentCommand: {
            selectDocumentState(ctx, factory, callbackParams);
            break;
        }
        case CallbackType.SelectCategoryCommand: {
            selectCategoryState(ctx, factory, callbackParams);
            break;
        }
        default:
            throw new Error('Don\'t know callback type');
    }
};
