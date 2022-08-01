import { Context, Telegraf } from 'telegraf';
// import cron from 'node-cron';
import { isDebug } from '../utils';

import {
    documentCommand, linkCommand, startCommand, summaryCommand, textCommand, todayCommand,
} from './commands';
import { callbackQueryCommand } from './callbackQuery/callbackQueryCommand';
import { Cache, CacheItem } from '../cache';
import { timeExpiredText } from '../textUtils';

export default class Bot {
    private bot: Telegraf;

    private cache: Cache;

    private commands: Array<{ command: string, onAction: (ctx: Context) => void }>;

    constructor() {
        this.bot = new Telegraf<Context>(process.env.BOT_TOKEN!);
        this.cache = new Cache(this.onExpiredCacheItem.bind(this));

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
    }

    private onExpiredCacheItem(item: CacheItem) {
        const { messageId, inlineMessageId, chatId } = item;

        this.bot.telegram.editMessageText(chatId, messageId, inlineMessageId, timeExpiredText);
    }
}
