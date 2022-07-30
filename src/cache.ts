import { Context } from 'telegraf';
import { v1 } from 'uuid';
import { timeExpiredText } from './textUtils';

const msInMinutes = 10000;
let deleteTimerId: NodeJS.Timeout;

export type CacheData = {
    amount: number;
    description: string;

    ctx: Context;
    messageId?: number;
};

type CacheItem = { date: number } & CacheData;

export class Cache {
    private cacheInternal: Map<string, CacheItem> = new Map();

    public add(data: CacheData) {
        const guid = v1();
        const date = new Date().valueOf();

        const value = { ...data, date };
        this.cacheInternal.set(guid, value);

        this.startClearingCache();

        return guid;
    }

    private startClearingCache() {
        if (deleteTimerId) {
            clearTimeout(deleteTimerId);
        }

        deleteTimerId = setTimeout(() => this.clearOldItems(), msInMinutes);
    }

    public get(guid: string) {
        const value = this.cacheInternal.get(guid);

        return value;
    }

    public getAndDelete(guid: string) {
        const value = this.cacheInternal.get(guid);
        this.cacheInternal.delete(guid);

        return value;
    }

    private clearOldItems() {
        const expiredKeys: Array<string> = [];
        const currentDate = new Date();

        this.cacheInternal.forEach(({ date }, key) => {
            const difference = currentDate.valueOf() - date;

            if (difference > msInMinutes / 2) {
                expiredKeys.push(key);
            }
        });

        expiredKeys.forEach((key) => {
            const item = this.cacheInternal.get(key);

            if (item) {
                const { ctx, messageId } = item;

                ctx.telegram.editMessageText(ctx.chat?.id, messageId, ctx.inlineMessageId, timeExpiredText);
            }

            this.cacheInternal.delete(key);
        });
    }
}
