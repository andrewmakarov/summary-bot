import { Context } from 'telegraf';
import { utils as summaryUtils } from '../../sheet/summary';
import { presets } from '../../text';
import { createCommand } from './base/createCommand';
import { createWaitingMessage } from './base/createWaitingMessage';

const command = async (ctx: Context) => {
    const stopWaiting = await createWaitingMessage(ctx);

    const todayDate = new Date();
    const summaryMassages = await summaryUtils.createGeneralSummary(presets.static.todaySummary(), todayDate, todayDate);

    summaryMassages.forEach((message) => ctx.reply(message, { parse_mode: 'MarkdownV2' }));
    stopWaiting();
};

export const todayCommand = createCommand(command);
