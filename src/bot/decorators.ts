import { Context } from 'telegraf';
import { presets } from '../text';

// eslint-disable-next-line @typescript-eslint/naming-convention
const parse_mode = 'Markdown';

export const botDecorator = (ctx: Context) => ({
    editText: (message: string) => ctx.editMessageText(message, { parse_mode }),

    errorTo: {
        currentText: () => ctx.editMessageText(presets.static.somethingWasWrong()),
    },
});
