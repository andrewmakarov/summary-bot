export interface ICategory {
    key: string;
    text: string;
    icon: string;
    keywords: string[];
}

export interface IDocument {
    text: string;
    url: string
}

type SchemeMap = Map<string, Array<ICategory>>;

export class SheetModel {
    private scheme: SchemeMap = new Map<string, Array<ICategory>>();

    public addCategory(documentName: string, categories: Array<ICategory>) {
        this.scheme.set(documentName, categories);
    }

    public reset() {
        this.scheme.clear();
    }
}
