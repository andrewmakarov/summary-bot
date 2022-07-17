// eslint-disable-next-line import/prefer-default-export
export const calculateAmount = (text: string): [number, string] => {
    const amount = parseFloat(text);
    let description = '';

    if (!Number.isNaN(amount)) {
        description = text.substring(amount.toString().length).trim();
    }

    return [amount, description];
};

export const getUserName = (firstName: string, lastName: string = '') => `${firstName} ${lastName}`;
