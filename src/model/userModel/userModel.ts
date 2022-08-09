import { Collection, MongoClient, ServerApiVersion } from 'mongodb';
import { DB_COLLECTION, DB_NAME, getURI } from './constants';

const createClient = () => new MongoClient(getURI(process.env.DB_USER!, process.env.DB_PASSWORD!), {
    connectTimeoutMS: 3000,
    keepAlive: true,
    serverApi: ServerApiVersion.v1,
});

export interface IUser {
    userId: number;
    userName: string;
    isAdmin: boolean;
    currentDocumentId: string
    chatId: number;
}
export class UserModel {
    private defaultDocumentId: string;

    constructor(defaultDocumentId: string) {
        this.defaultDocumentId = defaultDocumentId;
    }

    private async getCollection(): Promise<[MongoClient, Collection<IUser>]> {
        const client = createClient();
        await client.connect();

        return [client, client.db(DB_NAME).collection<IUser>(DB_COLLECTION)];
    }

    async addUser(userId: number, userName: string, chatId: number = 0) {
        const [client, users] = await this.getCollection();

        const result = await users.findOne({
            userId,
        });

        if (!result) {
            await users.insertOne({
                userId,
                userName,
                chatId,
                currentDocumentId: this.defaultDocumentId,
                isAdmin: false,
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

    async getUserMap() {
        const client = createClient();
        await client.connect();

        const users = client.db(DB_NAME).collection<IUser>(DB_COLLECTION);

        const userList = await users.find().toArray();
        client.close();

        const result = new Map<number, Omit<IUser, 'userId'>>();

        userList.forEach((user) => {
            result.set(user.userId, {
                userName: user.userName,
                chatId: user.chatId,
                currentDocumentId: user.currentDocumentId,
                isAdmin: user.isAdmin,
            });
        });

        return result;
    }

    async getUser(userId: number) {
        const [client, users] = await this.getCollection();

        const result = await users.findOne({ userId });

        client.close();

        return result;
    }
}
