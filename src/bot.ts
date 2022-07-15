import { Context, Telegraf } from 'telegraf';
import { v1 } from 'uuid';
import cron from 'node-cron';
import { Update } from 'telegraf/typings/core/types/typegram';
import Model from './model';
import { DataBase } from './model/db';
import { createModelLayout } from './modelLayoutCreator';
import SheetsEditor from './sheetsEditor';
import {
    amountEnteredWrongFormatText, cacheIsEmptyText,
    countrySheetChoiceText, errorInCallbackQueryText,
    getSuccessAmountText, selectCategoryText,
    timeExpiredText, tryingAddDAmountText,
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

    private dataBase: DataBase;

    private messageCache: Map<string, ICacheItem>;

    private sheetsEditor: SheetsEditor;

    constructor(sheetsEditor: SheetsEditor, model: Model, dataBase: DataBase) {
        this.bot = new Telegraf(process.env.BOT_TOKEN!);
        this.sheetsEditor = sheetsEditor;
        this.model = model;
        this.dataBase = dataBase;
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

        // this.dataBase.getUsers().then((users) => {
        //     users.forEach((u) => {
        //         this.bot.telegram.sendMessage(u.userId, 'Test');
        //     });
        // });

        // cron.schedule('* */5 * * * *', () => {
        //     this.dataBase.getUsers().then((users) => {
        //         users.forEach((u) => {
        //             this.bot.telegram.sendMessage(u.userId, 'Test');
        //         });
        //     });
        // });

        // this.bot.telegram.sendMessage('429355799', 'sdfsdfsdfsf');
    }

    private async onStart(ctx: Context) {
        const from = ctx.message?.from;

        if (from) {
            const name = `${from.first_name} ${from.last_name}`;

            ctx.reply(`Hi ${name},\nWelcome to summary bot`);
            await this.dataBase.addUser(from.id.toString(), from.first_name, from.last_name);
            ctx.reply('You have been successfully added to the system 🎉🎉🎉');
        }
    }

    private onLinkCommand(ctx: Context) {
        ctx.reply('http://google.ru');
    }

    private async onCallbackQuery(ctx: Context) {
        const callbackQuery = ctx.callbackQuery!.data || '';

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
    }

    private async onText(ctx: Context & { message: { text: string } }) {
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
    }

    private subscribe() {
        this.bot.start(this.onStart.bind(this));
        this.bot.command('/link', this.onLinkCommand.bind(this));
        this.bot.on('callback_query', this.onCallbackQuery.bind(this));
        this.bot.on('text', this.onText.bind(this));
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
