export const getSuccessAmountText = (amount: number, currency: string, category: string) => `*${amount}${currency}* успешно занесено в *${category}*`;
export const getDefaultDocumentText = (documentName: string) => `Документ *${documentName}* установлен по умолчанию`;

export const amountEnteredWrongFormatText = '_Неправильное_ значение\n*Пример:* 120 Помидоры и огурцы';
export const selectCategoryText = 'Выбери категорию';
export const tryingAddDInfoText = '✍️Пытаюсь добавить данные✍️';
export const errorInCallbackQueryText = 'Ошибка в *callback_query*';
export const cacheIsEmptyText = 'Не нашелся обьект в кеше';
export const timeExpiredText = 'Я не дождалься, начни сначала';
