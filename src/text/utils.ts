export const amount = (value: number, currency: string) => new Intl.NumberFormat('en-US', { style: 'decimal' }).format(value) + currency;
export const bold = (text: string) => `*${text}*`;
export const cursive = (text: string) => `_${text}_`;
