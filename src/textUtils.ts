export const getFormattedAmount = (value: number, currency: string) => new Intl.NumberFormat('en-US', { style: 'decimal' }).format(value) + currency;

interface ISummaryConfig {
    spentValue: string;
    leftValue: string;
    canSaveValue: string;
}

export const formatErrorText = (text: string) => `☠️ ${text} ☠️`;
export const formatSuccessAmountText = (amount: number, currency: string, documentName: string, category: string) => `*${amount}${currency}* успешно занесено в *${category}*(${documentName})`;
export const getDefaultDocumentText = (documentName: string) => `Документ *${documentName}* установлен по умолчанию`;
export const getWarningText = (userName: string, category: string) => `😮😮😮\nСмотри, что *${userName}* добавил в *${category}*`;
export const getMaxAmountLimitText = (userName: string, category: string, amount: number, currency: string) => `😮😮😮\nОго, *${userName}* установил рекорд *${amount}${currency} в ${category}*`;

export const amountEnteredWrongFormatText = '_Неправильное_ значение\n*Пример:* 120 Помидоры и огурцы';
export const selectCategoryText = 'Выбери категорию';
export const tryingAddDInfoText = '👨‍💻 Пытаюсь добавить данные';
export const errorInCallbackQueryText = 'Ошибка в *callback_query*';
export const cacheIsEmptyText = 'Не нашелся обьект в кеше';
export const timeExpiredText = '🤷‍♂️ Я не дождалься, начни сначала';
export const noSpendingForCurrentPeriodText = 'Нет трат за текущий период';

export const pleaseWaitText = '👨‍💻 Считаю, подожди';

export const todaySummaryText = 'отчет за *сегодня*';
export const weekSummaryText = 'отчет за *неделю*';

// TODO rename
export const getSummaryText5 = (config: ISummaryConfig) => `*Потрачено за этот месяц:*
${config.spentValue}

*Можно сэкономить в этом месяце:*
${config.canSaveValue}

*Осталось:*
${config.leftValue}`;

export const getHalfDayNotificationText = (userName: string, currency: string, value?: { amount: number }) => {
    const result = value
        ? `Отлично, ты не забываешь вносить расходы:\n💰 тобой уже потрачено ${getFormattedAmount(value.amount, currency)}`
        : '⏰ Не забывай заполнять расходы, до сих пор нет никаких данных';

    return result;
};

export const getSimplifiedSummaryText = (userName: string, currency: string, value: { amount: number, maxAmount: { value: number, category: string, note: string } }) => `*${userName}*
💰 Всего *${getFormattedAmount(value.amount, currency)}*
🔥 Самая дорогая покупка *${getFormattedAmount(value.maxAmount.value, currency)}* в ${value.maxAmount.category}'е \\(_${value.maxAmount.note}_\\)\n\n`;

export const getSimplifiedSummaryTexTitle = (name: string, title: string, documentSummary: string) => `📚 ${name}: ${title}\n\n${documentSummary}`;

export const getSimplifiedSummaryFooterText = (totalAmount: number, currency: string) => `*Всего:* ${totalAmount}${currency}`;
