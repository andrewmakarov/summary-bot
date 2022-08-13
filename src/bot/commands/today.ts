import { Context } from 'telegraf';
import { createGeneralSummary } from '../../sheetEditor/summaryUtils';
import { createCommand } from './base/createCommand';
import { createWaitingMessage } from './base/createWaitingMessage';

const command = async (ctx: Context) => {
    const stopWaiting = await createWaitingMessage(ctx);

    const todayDate = new Date();
    const summaryMassages = await createGeneralSummary('Отчет за сегодня', todayDate, todayDate);

    Promise.all(summaryMassages).then((messages) => {
        stopWaiting();
        messages.forEach((m) => ctx.reply(m, { parse_mode: 'Markdown' }));
    });
};

export const todayCommand = createCommand(command);
