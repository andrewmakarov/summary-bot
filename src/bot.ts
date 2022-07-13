import { Telegraf } from 'telegraf';
import { v1 } from 'uuid';
import Model from './model';
import { createModelLayout } from './modelLayoutCreator';
import SheetsEditor from './sheetsEditor';
import {
    amountEnteredWrongFormatText, cacheIsEmptyText, countrySheetChoiceText, errorInCallbackQueryText, getSuccessAmountText, selectCategoryText, timeExpiredText, tryingAddDAmountText,
} from './textUtils';
import { isDebug } from './utils';

const DELETE_CACHE_TIMER_VALUE = 60000;

interface ICacheItem {
    amount: number;
    description: string;
    documentIndex?: number;
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

        if (isDebug()) {
            this.bot.launch();
        } else {
            this.bot.launch({
                webhook: {
                    domain: process.env.URL,
                    port: parseInt(process.env.PORT!, 10) || 5000,
                },
            });
        }
    }

    private subscribe() {
        this.bot.start((ctx) => {
            const { from } = ctx.message;

            const name = `${from.first_name} ${from.last_name}`;
            // this.model.addUser(from.id, name);

            ctx.reply(`Hi ${name},\nWelcome to summary bot`);
        });

        this.bot.on('callback_query', async (ctx) => {
            const callbackQuery = ctx.callbackQuery.data || '';

            if (callbackQuery.startsWith('c|')) {
                const [_, documentIndexRaw, guid] = callbackQuery.split('|');

                const value = this.messageCache.get(guid);
                if (value) {
                    const documentIndex = parseInt(documentIndexRaw, 10);
                    this.messageCache.set(guid, { ...value, documentIndex });
                    const keyboardLayout = createModelLayout(this.model).createCategories(guid);

                    if (keyboardLayout) {
                        ctx.editMessageText(selectCategoryText, {
                            reply_markup: { inline_keyboard: keyboardLayout },
                        });

                        ctx.answerCbQuery(`Будет записано в ${this.model.documents[documentIndex].text}`);
                    } else {
                        console.log('Cache is empty');
                    }
                }
            } else {
                await ctx.editMessageText(tryingAddDAmountText, {
                    parse_mode: 'Markdown',
                    reply_markup: undefined,
                });

                try {
                    const [guid] = callbackQuery.split('|');
                    const name = `${ctx.from?.first_name} ${ctx.from?.last_name || ''}`.trim();
                    const text = await this.tryPushAmountAndGetText(callbackQuery, name);

                    this.messageCache.delete(guid);

                    await ctx.editMessageText(text, { parse_mode: 'Markdown' });
                    await ctx.answerCbQuery();
                } catch (e) {
                    console.log(e);
                }
            }
        });

        this.bot.on('text', async (ctx) => {
            const [amount, description] = getAmount(ctx.message.text);
            const isValid = !Number.isNaN(amount) && description !== '';

            if (isValid) {
                const guid = v1();
                this.messageCache.set(guid, { amount, description });

                const message = await ctx.reply(countrySheetChoiceText, {
                    reply_markup: {
                        inline_keyboard: createModelLayout(this.model).createDocuments(guid),
                    },
                });

                setTimeout(() => {
                    if (this.messageCache.delete(guid)) {
                        ctx.deleteMessage(message.message_id);
                        ctx.reply(timeExpiredText);
                    }
                }, DELETE_CACHE_TIMER_VALUE);
            } else {
                ctx.reply(amountEnteredWrongFormatText, { parse_mode: 'Markdown' });
            }
        });
    }

    private async tryPushAmountAndGetText(callbackDate?: string, userName?: string) {
        if (callbackDate) {
            const [guid, categoriesIndexRaw] = callbackDate.split('|');

            const data = this.messageCache.get(guid);
            if (data) {
                const categoriesIndex = parseInt(categoriesIndexRaw, 10);
                const category = this.model.categories[categoriesIndex];

                try {
                    const document = this.model.documents[data.documentIndex || 0];
                    await this.sheetsEditor.pushAmount(document.id!, data.amount, categoriesIndex, data.description, userName);

                    return getSuccessAmountText(data.amount, document.currency, category.text);
                } catch (e) {
                    return (e as Error).message;
                }
            }

            return cacheIsEmptyText;
        }

        return errorInCallbackQueryText;
    }
}
