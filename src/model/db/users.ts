import { MongoClient, ServerApiVersion } from 'mongodb';
import { DB_COLLECTION, DB_NAME, URI } from './constants';

const createClient = () => new MongoClient(URI, {
    connectTimeoutMS: 3000,
    keepAlive: true,
    serverApi: ServerApiVersion.v1,
});

export interface IUser {
    id: number;
    name: string;
    color: string;
}

export class Users {
    constructor() {
    }

    async addUser(id: number, name: string) {
        const client = createClient();
        await client.connect();

        const users = client.db(DB_NAME).collection<IUser>(DB_COLLECTION);

        await users.insertOne({
            id,
            name,
            color: '123456',
        });

        client.close();
    }

    async getUsers() {

    }

    dispose() {

    }
}
