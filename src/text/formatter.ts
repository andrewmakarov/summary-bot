import { Emoji } from './emoji';
import { bold, amount as formatAmount } from './utils';

export const formatter = {
    error: (text: string) => `${Emoji.bug} ${text}`,
    successAmount: (amount: number, currency: string, documentName: string, category: string, marker: string) => {
        const formattedAmount = formatAmount(amount, currency);

        return `${bold(formattedAmount)} ${Emoji.right} ${bold(category)} ${Emoji.right} ${documentName} ${marker}`;
    },
};
