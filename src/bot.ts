import { Telegraf } from 'telegraf';
import { v1 } from 'uuid';
import Model from './model';
import { createModelLayout } from './modelLayoutCreator';
import SheetsEditor from './sheetsEditor';
import {
    amountEnteredWrongFormatText, cacheIsEmptyText, errorInCallbackQueryText, getSuccessAmountText, selectCategoryText, tryingAddDAmountText,
} from './textUtils';

interface ICacheItem {
    amount: number;
    description: string;
}

const getAmount = (text: string): [number, string] => {
    const amount = parseFloat(text);
    let description = '';

    if (!Number.isNaN(amount)) {
        description = text.substring(amount.toString().length).trim();
    }

    return [amount, description];
};

export default class Bot {
    private bot: Telegraf;

    private model: Model;

    private messageCache: Map<string, ICacheItem>;

    private sheetsEditor: SheetsEditor;

    constructor(sheetsEditor: SheetsEditor, model: Model) {
        this.bot = new Telegraf(process.env.BOT_TOKEN!);
        this.sheetsEditor = sheetsEditor;
        this.model = model;
        this.messageCache = new Map();

        this.subscribe();
        this.bot.launch();
    }

    private subscribe() {
        this.bot.start((ctx) => {
            const { from } = ctx.message;

            const name = `${from.first_name} ${from.last_name}`;
            this.model.addUser(from.id, name);

            ctx.reply(`Hi ${name},\nWelcome to summary bot`);
        });

        // this.bot.hears('hi', (ctx) => ctx.reply('Hey there'));

        this.bot.on('callback_query', async (ctx) => {
            await ctx.editMessageText(tryingAddDAmountText, {
                parse_mode: 'Markdown',
                reply_markup: undefined,
            });

            // console.log(ctx.from?.id);

            const text = await this.tryPushAmountAndGetText(ctx.callbackQuery.data, ctx.from?.id);

            await ctx.editMessageText(text, { parse_mode: 'Markdown' });
            await ctx.answerCbQuery();
        });

        this.bot.on('text', (ctx) => {
            const keyboardLayout = this.tryCreateCategoryKeyboardLayout(ctx.message.text);

            if (keyboardLayout) {
                ctx.reply(selectCategoryText, {
                    reply_markup: { inline_keyboard: keyboardLayout },
                });
            } else {
                ctx.reply(amountEnteredWrongFormatText, { parse_mode: 'Markdown' });
            }
        });
    }

    private tryCreateCategoryKeyboardLayout(text: string) {
        const [amount, description] = getAmount(text);
        const isValid = !Number.isNaN(amount) && description !== '';

        if (isValid) {
            const key = v1();
            this.messageCache.set(key, { amount, description });
            // TODO this.messageCache.delete(key);

            return createModelLayout(this.model).getCategories(key);
        }

        return undefined;
    }

    private async tryPushAmountAndGetText(callbackDate?: string, userId?: number) {
        if (callbackDate) {
            const [key, categoriesIndexRaw] = callbackDate.split('_');

            const data = this.messageCache.get(key);
            if (data) {
                const categoriesIndex = parseInt(categoriesIndexRaw, 10);
                const category = this.model.categories[categoriesIndex];

                try {
                    await this.sheetsEditor.pushAmount(data.amount, categoriesIndex, data.description, userId);
                    return getSuccessAmountText(data.amount, category.text);
                } catch (e) {
                    return (e as Error).message;
                }
            }

            return cacheIsEmptyText;
        }

        return errorInCallbackQueryText;
    }
}
