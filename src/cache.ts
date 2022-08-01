import { v1 } from 'uuid';

const msInMinutes = 10000;
let deleteTimerId: NodeJS.Timeout;

export type CacheData = {
    amount: number;
    description: string;

    messageId?: number;
    chatId?: number;
    inlineMessageId?: string;
};

export type CacheItem = { date: number } & CacheData;

export class Cache {
    private cacheInternal: Map<string, CacheItem> = new Map();

    private onExpiredCacheItem: (item: CacheItem) => void;

    constructor(onExpiredCacheItem: (item: CacheItem) => void) {
        this.onExpiredCacheItem = onExpiredCacheItem;
    }

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
        const value = this.get(guid);
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
                this.onExpiredCacheItem(item);
            }

            this.cacheInternal.delete(key);
        });
    }
}
