interface ISummaryConfig {
    spentValue: string;
    leftValue: string;
    canSaveValue: string;
}

export const getSuccessAmountText = (amount: number, currency: string, documentName: string, category: string) => `*${amount}${currency}* успешно занесено в *${category}*(${documentName})`;
export const getDefaultDocumentText = (documentName: string) => `Документ *${documentName}* установлен по умолчанию`;

export const amountEnteredWrongFormatText = '_Неправильное_ значение\n*Пример:* 120 Помидоры и огурцы';
export const selectCategoryText = 'Выбери категорию';
export const tryingAddDInfoText = '✍️Пытаюсь добавить данные✍️';
export const errorInCallbackQueryText = 'Ошибка в *callback_query*';
export const cacheIsEmptyText = 'Не нашелся обьект в кеше';
export const timeExpiredText = 'Я не дождалься, начни сначала';

export const iCountText = '✍️Считаю, подожди✍️';

export const getSummaryText = (config: ISummaryConfig) => `*Потрачено за этот месяц:*
${config.spentValue}

*Можно сэкономить в этом месяце:*
${config.canSaveValue}

*Осталось:*
${config.leftValue}`;
