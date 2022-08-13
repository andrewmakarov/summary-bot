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

export const getSummaryText = (config: ISummaryConfig) => `*Потрачено за этот месяц:*
${config.spentValue}

*Можно сэкономить в этом месяце:*
${config.canSaveValue}

*Осталось:*
${config.leftValue}`;
