import { textBuilder as tb } from './textBuilder';
import { amount, bold, cursive } from './utils';
import { icon } from './emoji';

export const presets = {
    dynamic: {
        defaultDocument: (documentName: string) => `Документ **${documentName}** установлен по умолчанию`,
        noSpendingForCurrentPeriod: (userName: string) => `**${userName}**\n${icon('💰')} Нет трат за текущий период\n\n`,

        formatSummaryBlock: (name: string, title: string, documentSummary: string) => `${icon('📚')} ${name}: ${title}\n\n${documentSummary}`,

        totalSummaryFooter: (totalAmount: number, currency: string) => `**Всего:** ${amount(totalAmount, currency)}`,
        estimatedCategoryText: (category: string) => `${icon('💁')} ${category}?`,

        halfDayNotification: (currency: string, value?: { amount: number }) => {
            if (value) {
                return `Отлично, ты не забываешь вносить расходы:\n${icon('💰')} тобой уже потрачено **${amount(value.amount, currency)}**`;
            }

            return `${icon('⏰')} Не забывай заполнять расходы, до сих пор нет никаких данных`;
        },

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
    },
    static: {
        tryingAddInfo: () => `${icon('👨‍💻')} Пытаюсь добавить данные...`,
        selectCategory: () => 'Выбери категорию',

        timeExpired: () => `${icon('🤷‍♂️')} Я не дождался, начни сначала`,
        pleaseWait: () => `${icon('👨‍💻')} Считаю, подожди...`,

        todaySummary: () => 'отчет за **сегодня**',
        weekSummaryText: () => 'отчет за **неделю**',

        amountEnteredWrongFormat: () => 'Неправильное значение\n**Пример:** 120 Помидоры и огурцы',

        cacheIsEmpty: () => 'Не нашелся обьект в кеше', // TODO
    },
};
