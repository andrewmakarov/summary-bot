import { v1 } from 'uuid';
import { IUser } from './model/userModel/userModel';

const msInMinutes = 10000;
let deleteTimerId: NodeJS.Timeout;

export type CacheItemBody = {
    amount: number;
    description: string;
    userMap: Map<number, Omit<IUser, 'userId'>>;
    userId: number;
    messageId?: number;
};

export type WithKey<TSchema> = TSchema & {
    date: number;
};

export class Cache {
    private cacheInternal: Map<string, WithKey<CacheItemBody>> = new Map();

    private onExpiredCacheItem?: (item: WithKey<CacheItemBody>) => void;

    public onExpiredItem(onExpiredCacheItem:(item: WithKey<CacheItemBody>) => void) {
        this.onExpiredCacheItem = onExpiredCacheItem;
    }

    public add(data: CacheItemBody) {
        const guid = v1();
        const date = new Date().valueOf();

        const value = { ...data, date };
        this.cacheInternal.set(guid, value);

        this.startClearingCache();

        return guid;
    }

    public update(key: string, obj: Partial<CacheItemBody>) {
        const item = this.cacheInternal.get(key);
        if (item) {
            this.cacheInternal.set(key, { ...item, ...obj });
        }
    }

    private startClearingCache() {
        if (deleteTimerId) {
            clearTimeout(deleteTimerId);
        }

        deleteTimerId = setTimeout(() => this.clearOldItems(), msInMinutes);
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

            if (difference > msInMinutes) {
                expiredKeys.push(key);
            }
        });

        expiredKeys.forEach((key) => {
            const item = this.cacheInternal.get(key);

            if (item && this.onExpiredCacheItem) {
                this.onExpiredCacheItem(item);
            }

            this.cacheInternal.delete(key);
        });
    }
}
