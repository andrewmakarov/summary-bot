import { Context } from 'telegraf';
import { utils as summaryUtils } from '../../sheetEditor/summary';
import { presets } from '../../text';
import { createCommand } from './base/createCommand';
import { createWaitingMessage } from './base/createWaitingMessage';

const command = async (ctx: Context) => {
    const stopWaiting = await createWaitingMessage(ctx);

    const today = new Date();
    const summaryMassages = await summaryUtils.createGeneralSummary(presets.todaySummary(), new Date(2020, 5, 5), today); // TODO

    summaryMassages.forEach((message) => ctx.reply(message, { parse_mode: 'Markdown' }));
    stopWaiting();
};

export const summaryCommand = createCommand(command);
