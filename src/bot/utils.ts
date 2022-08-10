// eslint-disable-next-line import/prefer-default-export
export const getUserName = (firstName: string, lastName?: string) => {
    let result = firstName;

    if (lastName) {
        result += ` ${lastName}`;
    }

    return result;
};
