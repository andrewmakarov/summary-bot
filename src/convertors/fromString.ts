export const fromString = (value: string) => ({
    toDate: () => {
        const day = parseInt(value, 10);

        const date = new Date();
        date.setDate(day);

        return date;
    },
});
