import { parentPort } from 'worker_threads';
import { SheetModel } from '../model/sheetModel/sheetModel';
import { loadCategories } from '../sheet/core';

// parentPort?.postMessage({ welcome: '' });

type HeaderItem = {
    icon: string;
    A1: string;
};

type DataRow = {
    id: number;
    date: Date;
    headerName: string;
    value: number;
    note: string;
    user: string; // TODO
};

class DocumentConfig {
    headers: Map<string, HeaderItem> = new Map();

    keyWords: Map<string, string[]> = new Map();
}

const start = async () => {
    const sheetModel = new SheetModel();

    const documentMap = new Map<string, Map<string, { a1: string, icon?: string }>>();
    const [key, name, date] = sheetModel.systemColumns;

    sheetModel.activeDocuments.forEach((document) => {
        const map = new Map<string, { a1: string, icon?: string }>();

        map.set(key, { a1: 'A' });
        map.set(name, { a1: 'B' });
        map.set(date, { a1: 'C' });

        documentMap.set(document.id, map);
    });

    const promises = sheetModel.activeDocuments.map((document) => loadCategories(document.id));
    const result = await Promise.all(promises);

    result.forEach((promiseResult, index) => {
        const currentDocument = sheetModel.activeDocuments[index];

        const map = documentMap.get(currentDocument.id);

        // if (map) {
        //     for (const r of result) {
        //         // map.set(r.)
        //     }
        // }
    });
};

start();
