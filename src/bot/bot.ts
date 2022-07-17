import { Context, Telegraf, session } from 'telegraf';
import { v1 } from 'uuid';
import cron from 'node-cron';
import { CallbackQuery } from 'telegraf/typings/core/types/typegram';
import Model from '../model';
import { DataBase } from '../model/db';
import { CallbackType, createModelLayout } from '../modelLayoutCreator';
import SheetsEditor from '../sheetsEditor';
import {
    amountEnteredWrongFormatText, cacheIsEmptyText,
    getDefaultDocumentText,
    getSuccessAmountText, selectCategoryText,
    timeExpiredText, tryingAddDInfoText,
} from '../textUtils';
import { isDebug } from '../utils';
import { calculateAmount, getUserName } from './utils';

const DELETE_CACHE_TIMER_VALUE = 60000;

interface ICacheItem {
    amount: number;
    description: string;
    documentIndex?: number;
}

export default class Bot {
    private bot: Telegraf;

    private model: Model;

    private dataBase: DataBase;

    private messageCache: Map<string, ICacheItem>;

    private sheetsEditor: SheetsEditor;

    private commands: Array<{ command: string, onAction: (ctx: Context) => void }>;

    constructor(sheetsEditor: SheetsEditor, model: Model, dataBase: DataBase) {
        this.bot = new Telegraf<Context>(process.env.BOT_TOKEN!);
        this.sheetsEditor = sheetsEditor;
        this.model = model;
        this.dataBase = dataBase;
        this.messageCache = new Map();

        this.commands = [
            {
                command: '/link',
                onAction: this.onLinkCommand.bind(this),
            }, {
                command: '/document',
                onAction: this.onDocumentCommand.bind(this),
            }, {
                command: '/today',
                onAction: this.onTodayCommand.bind(this),
            }, {
                command: '/summary',
                onAction: this.onSummaryCommand.bind(this),
            },
        ];

        this.bot.use(session());

        this.subscribe();
        this.launch();

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

    // Commands

    private async onStartCommand(ctx: Context) {
        const from = ctx.message?.from;

        if (from) {
            const name = getUserName(from.first_name, from.last_name);
            ctx.reply(`Hi ${name},\nWelcome to summary bot`);

            await this.dataBase.addUser(from.id, from.first_name, from.last_name);
            ctx.reply('You have been successfully added to the system 🎉🎉🎉');
        }
    }

    private onLinkCommand(ctx: Context) {
        ctx.reply('http://google.ru');
    }

    private onDocumentCommand(ctx: Context) {
        ctx.reply('Установи текущий документ', {
            reply_markup: {
                inline_keyboard: createModelLayout(this.model).createDocuments(),
            },
        });
    }

    private onTodayCommand(ctx: Context) {
        ctx.reply('http://google.ru');
    }

    private onSummaryCommand(ctx: Context) {
        ctx.reply('Установи текущий документ', {
            reply_markup: {
                inline_keyboard: createModelLayout(this.model).createDocuments(),
            },
        });
    }

    // CallbackQuery

    private async onCallbackQuery(ctx: Context & { callbackQuery: CallbackQuery }) {
        const result = ctx.callbackQuery.data || '';
        const [callbackType] = result.split('|');

        // console.log((ctx as any).session);

        switch (callbackType) {
            case CallbackType.SelectDocumentCommand: {
                const [, documentId] = result.split('|');
                const userId = ctx.from!.id;

                const document = this.model.documents.find((d) => d.id === documentId);

                await ctx.editMessageText(tryingAddDInfoText);

                await this.dataBase.setDocumentId(userId, documentId);
                await ctx.editMessageText(getDefaultDocumentText(document!.text), { parse_mode: 'Markdown' });

                await ctx.answerCbQuery();

                break;
            }
            case CallbackType.SelectCategoryCommand: {
                try {
                    const [, guid, categoriesIndexRaw] = result.split('|');
                    const categoriesIndex = parseInt(categoriesIndexRaw, 10);

                    await ctx.editMessageText(tryingAddDInfoText, {
                        parse_mode: 'Markdown',
                        reply_markup: undefined,
                    });

                    const text = await this.tryPushAmountAndGetText(guid, categoriesIndex, ctx.from!.id);

                    this.messageCache.delete(guid);

                    await ctx.editMessageText(text, { parse_mode: 'Markdown' });
                    await ctx.answerCbQuery();
                } catch (e) {
                    console.log(e);
                }
                break;
            }
            default:
        }
    }

    // Common

    private async onText(ctx: Context & { message: { text: string } }) {
        const [amount, description] = calculateAmount(ctx.message.text);
        const isValid = !Number.isNaN(amount) && description !== '';

        if (isValid) {
            const guid = v1();

            this.messageCache.set(guid, { amount, description });
            const keyboardLayout = createModelLayout(this.model).createCategories(guid);

            ctx.reply(selectCategoryText, {
                reply_markup: { inline_keyboard: keyboardLayout },
            });

            // TODO
            this.startClearingCache(ctx, ctx.message.message_id, guid);
        } else {
            ctx.reply(amountEnteredWrongFormatText, { parse_mode: 'Markdown' });
        }
    }

    // Core

    private launch() {
        const config = isDebug() ? undefined : {
            webhook: {
                domain: process.env.URL,
                port: parseInt(process.env.PORT!, 10) || 5000,
            },
        };

        this.bot.launch(config);
    }

    private startClearingCache(ctx: Context, messageId: number, guid: string) {
        setTimeout(() => {
            if (this.messageCache.delete(guid)) {
                ctx.deleteMessage(messageId);
                ctx.reply(timeExpiredText);
            }
        }, DELETE_CACHE_TIMER_VALUE);
    }

    private subscribe() {
        this.bot.start(this.onStartCommand.bind(this));
        this.commands.forEach(({ command, onAction }) => this.bot.command(command, onAction));

        this.bot.on('callback_query', this.onCallbackQuery.bind(this));
        this.bot.on('text', this.onText.bind(this));
    }

    private async tryPushAmountAndGetText(guid: string, categoriesIndex: number, userId: number) {
        // const name = `${ctx.from?.first_name} ${ctx.from?.last_name || ''}`.trim();

        const data = this.messageCache.get(guid);
        if (data) {
            const category = this.model.categories[categoriesIndex];

            try {
                const user = await this.dataBase.getUser(userId);
                const document = this.model.documents.find((d) => d.id === user!.currentDocumentId);
                const userName = getUserName(user!.firstName, user!.lastName);

                await this.sheetsEditor.pushAmount(document!.id, data.amount, categoriesIndex, data.description, userName);

                return getSuccessAmountText(data.amount, document!.currency, category.text);
            } catch (e) {
                return (e as Error).message;
            }
        }

        return cacheIsEmptyText;
    }
}
