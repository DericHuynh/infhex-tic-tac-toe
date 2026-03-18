import './env.js';
import { MongoClient, type Db } from 'mongodb';

const mongoUri = process.env.MONGODB_URI ?? null;
const mongoDbName = process.env.MONGODB_DB_NAME ?? 'ih3t';

let mongoClient: MongoClient | null = null;
let databasePromise: Promise<Db | null> | null = null;

export async function getMongoDatabase(): Promise<Db | null> {
    if (!mongoUri) {
        return null;
    }

    if (databasePromise !== null) {
        return databasePromise;
    }

    databasePromise = (async () => {
        mongoClient = new MongoClient(mongoUri);
        await mongoClient.connect();
        return mongoClient.db(mongoDbName);
    })().catch((error: unknown) => {
        databasePromise = null;
        mongoClient = null;

        console.error(JSON.stringify({
            type: 'mongo',
            event: 'connection-error',
            timestamp: new Date().toISOString(),
            database: mongoDbName,
            message: error instanceof Error ? error.message : String(error)
        }));

        return null;
    });

    return databasePromise;
}

export async function closeMongoConnection(): Promise<void> {
    const client = mongoClient;
    mongoClient = null;
    databasePromise = null;

    if (!client) {
        return;
    }

    await client.close();
}
