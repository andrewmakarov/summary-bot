import { IPureUser } from '../model/userModel';

export interface ICacheItemBody {
    amount: number;
    description: string;
    userMap: Map<number, IPureUser>;
    userId: number;
    messageId?: number;
    userMessageId?: number;
}

export type WithKey<T> = T & {
    date: number;
};
