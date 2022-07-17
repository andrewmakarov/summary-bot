import { Collection, MongoClient, ServerApiVersion } from 'mongodb';
import Model from '../../model';
import { DB_COLLECTION, DB_NAME, getURI } from './constants';

const createClient = () => new MongoClient(getURI(process.env.DB_USER!, process.env.DB_PASSWORD!), {
    connectTimeoutMS: 3000,
    keepAlive: true,
    serverApi: ServerApiVersion.v1,
});

export interface IUser {
    userId: number;
    firstName: string;
    lastName?: string;
    isAdmin: boolean;
    currentDocumentId: string
}
export class DataBase {
    private model: Model;

    constructor(model: Model) {
        this.model = model;
    }

    private async getCollection(): Promise<[MongoClient, Collection<IUser>]> {
        const client = createClient();
        await client.connect();

        return [client, client.db(DB_NAME).collection<IUser>(DB_COLLECTION)];
    }

    async addUser(userId: number, firstName: string, lastName?: string) {
        const [client, users] = await this.getCollection();

        const result = await users.findOne({
            userId,
        });

        if (!result) {
            await users.insertOne({
                userId,
                firstName,
                lastName,
                isAdmin: false,
                currentDocumentId: this.model.documents[0].id,
            });
        }

        client.close();
    }

    async setDocumentId(userId: number, currentDocumentId: string) {
        const [client, users] = await this.getCollection();

        await users.updateOne({ userId }, {
            $set: { currentDocumentId },
        });

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

    async getUser(userId: number) {
        const [client, users] = await this.getCollection();

        const result = await users.findOne({ userId });

        client.close();

        return result;
    }
}
