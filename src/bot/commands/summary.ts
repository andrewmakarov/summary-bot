import { Context } from 'telegraf';
import { createGeneralSummary } from '../../sheetEditor/summaryUtils';
import { todaySummaryText } from '../../textUtils';
import { createCommand } from './base/createCommand';
import { createWaitingMessage } from './base/createWaitingMessage';

const command = async (ctx: Context) => {
    const stopWaiting = await createWaitingMessage(ctx);

    const today = new Date();
    const summaryMassages = await createGeneralSummary(todaySummaryText, new Date(2020, 5, 5), today);

    Promise.all(summaryMassages).then((messages) => {
        stopWaiting();
        messages.forEach((m) => ctx.reply(m, { parse_mode: 'Markdown' }));
    });
};

export const summaryCommand = createCommand(command);
