// import { CallbackQueryContext, StateDelegate } from '../types';

import { CallbackQueryContext } from './callbackQuery/types';

// eslint-disable-next-line @typescript-eslint/naming-convention
const parse_mode = 'Markdown';

export const editText = (ctx: CallbackQueryContext, message: string) => ctx.editMessageText(message, { parse_mode });
