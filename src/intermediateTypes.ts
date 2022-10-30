import { ICacheItemBody, WithKey } from './cache';
import { IPureUser } from './model/userModel';

export type AmountInfo = WithKey<ICacheItemBody> & { user?: IPureUser, categoryIndex: number }; // TODO move to cache
