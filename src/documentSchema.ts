interface SchemaItem {
    name: string;
    A1: string;
}

const schema = new Map<string, Array<SchemaItem>>();

export const initSchema = (newSchema: Map<string, Array<SchemaItem>>) => {
    schema.clear();
    newSchema.forEach((value, key) => schema.set(key, value));
};

export const getSchema = (document: string): ReadonlyArray<SchemaItem> => schema.get(document) || [];
