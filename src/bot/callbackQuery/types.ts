import { Context } from 'telegraf';
import { CallbackQuery } from 'telegraf/typings/core/types/typegram';
import { IFactory } from '../../factory';

export type StateDelegate = (ctx: CallbackQueryContext, factory: IFactory, callbackParams: string[]) => void;
export type CallbackQueryContext = Context & { callbackQuery: CallbackQuery };
export enum CallbackType {
    SelectCategoryCommand = '1',
    SelectDocumentCommand = '2',
}
