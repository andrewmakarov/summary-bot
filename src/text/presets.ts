import { textBuilder as tb } from './textBuilder';
import { amount, bold, cursive } from './utils';

export const presets = {
    defaultDocument: (documentName: string) => tb()
        .text('Документ')
        .space()
        .text(documentName, bold)
        .space()
        .text('установлен по умолчанию')
        .done(),

    tryingAddInfo: () => tb()
        .icon('👨‍💻')
        .space()
        .text('Пытаюсь добавить данные')
        .done(),

    amountEnteredWrong: () => tb()
        .text('Неправильное', cursive)
        .space()
        .text('значение')
        .nextLine()
        .text('Пример:', bold)
        .space()
        .text('120 Помидоры и огурцы')
        .done(),

    selectCategory: () => tb()
        .text('Выбери категорию')
        .done(),

    timeExpired: () => tb()
        .icon('🤷‍♂️')
        .space()
        .text('Я не дождался, начни сначала')
        .done(),

    noSpendingForCurrentPeriod: () => tb()
        .text('Нет трат за текущий период')
        .done(),

    pleaseWait: () => tb()
        .icon('👨‍💻')
        .space()
        .text(' Считаю, подожди')
        .done(),

    todaySummary: () => tb()
        .text('отчет за')
        .space()
        .text('сегодня', bold)
        .done(),

    weekSummaryText: () => tb()
        .text('отчет за')
        .space()
        .text('неделю', bold)
        .done(),

    halfDayNotification: (userName: string, currency: string, value?: { amount: number }) => {
        if (value) {
            return tb()
                .text('Отлично, ты не забываешь вносить расходы:')
                .nextLine()
                .icon('💰')
                .space()
                .text('тобой уже потрачено')
                .space()
                .amount(value.amount, currency, bold)
                .done();
        }

        return tb()
            .icon('⏰')
            .space()
            .text('Не забывай заполнять расходы, до сих пор нет никаких данных')
            .done();
    },

    formatSummaryBlock: (name: string, title: string, documentSummary: string) => tb()
        .icon('📚')
        .space()
        .format('%s: %s\n\n%s', name, title, documentSummary)
        .done(),

    cacheIsEmpty: () => tb().text('Не нашелся обьект в кеше').done(), // TODO

    amountEnteredWrongFormat: () => tb()
        .text('Неправильное', cursive)
        .space()
        .text('значение')
        .nextLine()
        .text('Пример:', bold)
        .space()
        .text('120 Помидоры и огурцы')
        .done(),

    simplifiedSummary: (userName: string, currency: string, value: { amount: number, maxAmount: { value: number, category: string, note: string } }) => tb()
        .text(userName, bold)
        .nextLine()
        .icon('💰')
        .space()
        .text('Всего')
        .amount(value.amount, currency, bold)

        .nextLine()

        .icon('🔥')
        .space()
        .format('Самая дорогая покупка %s в %s', bold(amount(value.maxAmount.value, currency)), value.maxAmount.category)
        .format('\\(%s\\)', cursive(value.maxAmount.note))
        .nextLine()
        .nextLine()
        .done(),

    estimatedCategoryText: (category: string) => tb()
        .text('Возможно')
        .space()
        .text(category, bold)
        .text('?')
        .done(),

    totalSummaryFooter: (totalAmount: number, currency: string) => {
        tb()
            .text('Всего:', bold)
            .space()
            .amount(totalAmount, currency)
            .done();
    },
};
