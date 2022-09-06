import { Context, Telegraf } from 'telegraf';
import cron from 'node-cron';
import { isDebug } from '../utils';

import {
    documentCommand, linkCommand, startCommand, summaryCommand, textCommand, todayCommand,
} from './commands';
import { callbackQueryCommand } from './callbackQuery/callbackQueryCommand';
import { Cache, WithKey, CacheItemBody } from '../cache';
import { getHalfDayNotificationText, timeExpiredText, todaySummaryText } from '../textUtils';
import { factory } from '../factory';
import { createGeneralSummary } from '../sheetEditor/summary/summaryUtils';
import { createCompiledList, createUserSummaryMap, filterCompiledList } from '../sheetEditor/summary/base';

export default class Bot {
    private bot: Telegraf;

    private cache: Cache;

    private commands: Array<{ command: string, onAction: (ctx: Context) => void }>;

    constructor(cache: Cache) {
        this.bot = new Telegraf<Context>(process.env.BOT_TOKEN!);
        this.cache = cache;

        this.commands = [
            {
                command: '/start',
                onAction: startCommand,
            }, {
                command: '/link',
                onAction: linkCommand,
            }, {
                command: '/document',
                onAction: documentCommand,
            }, {
                command: '/today',
                onAction: todayCommand,
            }, {
                command: '/summary',
                onAction: summaryCommand,
            },
        ];

        this.subscribe();
        this.launch();

        cron.schedule('0 17 * * *', this.onEndDayBroadcast.bind(this));

        cron.schedule('0 10 * * *', this.onHalfDayBroadcast.bind(this));
    }

    private async onEndDayBroadcast() {
        const { userModel } = factory;
        const userMap = await userModel.getUserMap();

        const todayDate = new Date();
        const summaryMassages = await createGeneralSummary(todaySummaryText, todayDate);

        userMap.forEach((user) => {
            summaryMassages.forEach((text) => {
                this.bot.telegram.sendMessage(user.chatId, text, { parse_mode: 'MarkdownV2' });
            });
        });
    }

    private async onHalfDayBroadcast() {
        const { userModel, sheetModel } = factory;
        const userMap = await userModel.getUserMap();
        const todayDate = new Date();

        const onEachUser = (userName: string, chatId: number, currency: string, summaryMap: Map<string, { amount: number }>) => {
            const text = getHalfDayNotificationText(userName, currency, summaryMap.get(userName));

            this.bot.telegram.sendMessage(chatId, text, { parse_mode: 'MarkdownV2' });
        };

        sheetModel.activeDocuments
            .forEach(async ({ id, currency }) => {
                const compiledList = await createCompiledList(id);
                const filteredList = filterCompiledList(compiledList, todayDate, todayDate);
                const summaryMap = await createUserSummaryMap(filteredList);

                userMap.forEach(({ userName, chatId }) => onEachUser(userName, chatId, currency, summaryMap));
            });
    }

    private launch() {
        const debugConfig = undefined;
        const publicConfig = {
            webhook: {
                domain: process.env.URL,
                port: parseInt(process.env.PORT!, 10) || 5000,
            },
        };

        this.bot.launch(isDebug() ? debugConfig : publicConfig);
    }

    private subscribe() {
        this.bot.use(async (ctx, next) => {
            ctx.state.cache = this.cache;
            await next();
        });

        this.commands.forEach(({ command, onAction }) => this.bot.command(command, onAction));

        this.bot.on('callback_query', callbackQueryCommand);
        this.bot.on('text', textCommand);

        this.cache.onExpiredItem(this.onExpiredCacheItem.bind(this));
    }

    private onExpiredCacheItem(item: WithKey<CacheItemBody>) {
        const { messageId, userMap, userId } = item;
        const currentUser = userMap.get(userId);

        if (currentUser) {
            this.bot.telegram.editMessageText(currentUser.chatId, messageId, undefined, timeExpiredText);
        }
    }
}
