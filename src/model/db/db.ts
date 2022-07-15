import { MongoClient, ServerApiVersion } from 'mongodb';
import { DB_COLLECTION, DB_NAME, getURI } from './constants';

const createClient = () => new MongoClient(getURI(process.env.DB_USER!, process.env.DB_PASSWORD!), {
    connectTimeoutMS: 3000,
    keepAlive: true,
    serverApi: ServerApiVersion.v1,
});

export interface IUser {
    firstName: string;
    lastName?: string;
    userId: string;
    isAdmin: boolean;
}

export class DataBase {
    // constructor() {
    // }

    async addUser(userId: string, firstName: string, lastName?: string) {
        const client = createClient();
        await client.connect();

        const users = client.db(DB_NAME).collection<IUser>(DB_COLLECTION);

        const result = await users.findOne({
            userId,
        });

        if (!result) {
            users.insertOne({
                userId,
                firstName,
                lastName,
                isAdmin: false,
            });
        }

        client.close();
    }

    async getUsers() {
        const client = createClient();
        await client.connect();

        const users = client.db(DB_NAME).collection<IUser>(DB_COLLECTION);

        const result = await users.find().toArray();
        client.close();

        return result;
    }
}
