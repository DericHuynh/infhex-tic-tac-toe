import type { Collection, Document } from 'mongodb';
import type {
    FinishedGameRecord,
    FinishedGameSummary,
    GameMove,
    SessionFinishReason,
} from '@ih3t/shared';
import { getMongoDatabase } from './mongo';

interface CreateGameHistoryPayload {
    id: string;
    sessionId: string;
    createdAt: number;
}

interface StartedGameHistoryPayload extends CreateGameHistoryPayload {
    startedAt: number;
    players: string[];
}

interface FinishedGameHistoryPayload extends StartedGameHistoryPayload {
    finishedAt: number;
    winningPlayerId: string | null;
    reason: SessionFinishReason;
    moves: GameMove[];
}

interface GameHistoryDocument extends Document {
    id: string;
    sessionId: string;
    state: 'lobby' | 'ingame' | 'finished';
    players: string[];
    winningPlayerId: string | null;
    reason: SessionFinishReason | null;
    moveCount: number;
    moves: GameMove[];
    createdAt: number;
    startedAt: number | null;
    finishedAt: number | null;
    gameDurationMs: number | null;
    updatedAt: number;
}

const mongoDbName = process.env.MONGODB_DB_NAME ?? 'ih3t';
const mongoCollectionName = process.env.MONGODB_GAME_HISTORY_COLLECTION ?? 'gameHistory';

let collectionPromise: Promise<Collection<GameHistoryDocument> | null> | null = null;

async function getGameHistoryCollection(): Promise<Collection<GameHistoryDocument> | null> {
    if (collectionPromise !== null) {
        return collectionPromise;
    }

    collectionPromise = (async () => {
        const database = await getMongoDatabase();
        if (!database) {
            return null;
        }

        const collection = database.collection<GameHistoryDocument>(mongoCollectionName);

        await collection.createIndex({ id: 1 }, { unique: true });
        await collection.createIndex({ state: 1, finishedAt: -1 });
        await collection.createIndex({ sessionId: 1, finishedAt: -1 });

        console.log(JSON.stringify({
            type: 'game-history',
            event: 'game-history-storage-ready',
            timestamp: new Date().toISOString(),
            storage: 'mongodb',
            database: mongoDbName,
            collection: mongoCollectionName
        }));

        return collection;
    })().catch((error: unknown) => {
        collectionPromise = null;

        console.error(JSON.stringify({
            type: 'game-history',
            event: 'game-history-storage-error',
            timestamp: new Date().toISOString(),
            storage: 'mongodb',
            message: error instanceof Error ? error.message : String(error)
        }));

        return null;
    });

    return collectionPromise;
}

function createGameHistoryDocument(payload: CreateGameHistoryPayload): Omit<GameHistoryDocument, '_id'> {
    return {
        id: payload.id,
        sessionId: payload.sessionId,
        state: 'lobby',
        players: [],
        winningPlayerId: null,
        reason: null,
        moveCount: 0,
        moves: [],
        createdAt: payload.createdAt,
        startedAt: null,
        finishedAt: null,
        gameDurationMs: null,
        updatedAt: payload.createdAt
    };
}

function mapSummary(document: GameHistoryDocument): FinishedGameSummary {
    const startedAt = document.startedAt ?? document.createdAt;
    const finishedAt = document.finishedAt ?? document.updatedAt;

    return {
        id: document.id,
        sessionId: document.sessionId,
        players: [...document.players],
        winningPlayerId: document.winningPlayerId,
        reason: document.reason ?? 'terminated',
        moveCount: document.moveCount,
        createdAt: document.createdAt,
        startedAt,
        finishedAt,
        gameDurationMs: document.gameDurationMs ?? Math.max(0, finishedAt - startedAt)
    };
}

function mapRecord(document: GameHistoryDocument): FinishedGameRecord {
    return {
        ...mapSummary(document),
        moves: [...document.moves]
    };
}

function logMissingGameHistory(event: string, gameId: string, extraDetails: Record<string, unknown> = {}) {
    console.error(JSON.stringify({
        type: 'game-history',
        event,
        timestamp: new Date().toISOString(),
        storage: 'mongodb',
        gameId,
        message: 'Game history does not exist.',
        ...extraDetails
    }));
}

export async function createGameHistory(payload: CreateGameHistoryPayload): Promise<boolean> {
    const collection = await getGameHistoryCollection();
    if (!collection) {
        return false;
    }

    try {
        await collection.insertOne(createGameHistoryDocument(payload) as GameHistoryDocument);
        return true;
    } catch (error: unknown) {
        console.error(JSON.stringify({
            type: 'game-history',
            event: 'game-history-create-error',
            timestamp: new Date().toISOString(),
            storage: 'mongodb',
            gameId: payload.id,
            message: error instanceof Error ? error.message : String(error)
        }));

        return false;
    }
}

export async function startGameHistory(payload: StartedGameHistoryPayload): Promise<boolean> {
    const collection = await getGameHistoryCollection();
    if (!collection) {
        return false;
    }

    try {
        const result = await collection.updateOne(
            { id: payload.id },
            {
                $set: {
                    state: 'ingame',
                    players: [...payload.players],
                    startedAt: payload.startedAt,
                    updatedAt: payload.startedAt
                }
            }
        );

        if (result.matchedCount === 0) {
            logMissingGameHistory('game-history-start-error', payload.id);
            return false;
        }

        return true;
    } catch (error: unknown) {
        console.error(JSON.stringify({
            type: 'game-history',
            event: 'game-history-start-error',
            timestamp: new Date().toISOString(),
            storage: 'mongodb',
            gameId: payload.id,
            message: error instanceof Error ? error.message : String(error)
        }));

        return false;
    }
}

export async function appendGameMove(payload: StartedGameHistoryPayload, move: GameMove): Promise<boolean> {
    const collection = await getGameHistoryCollection();
    if (!collection) {
        return false;
    }

    try {
        const result = await collection.updateOne(
            { id: payload.id },
            {
                $set: {
                    updatedAt: move.timestamp
                },
                $push: {
                    moves: move
                } as never,
                $inc: {
                    moveCount: 1
                }
            }
        );

        if (result.matchedCount === 0) {
            logMissingGameHistory('game-history-move-error', payload.id, {
                moveNumber: move.moveNumber
            });
            return false;
        }

        return true;
    } catch (error: unknown) {
        console.error(JSON.stringify({
            type: 'game-history',
            event: 'game-history-move-error',
            timestamp: new Date().toISOString(),
            storage: 'mongodb',
            gameId: payload.id,
            moveNumber: move.moveNumber,
            message: error instanceof Error ? error.message : String(error)
        }));

        return false;
    }
}

export async function finalizeGameHistory(payload: FinishedGameHistoryPayload): Promise<boolean> {
    const collection = await getGameHistoryCollection();
    if (!collection) {
        return false;
    }

    try {
        const result = await collection.updateOne(
            { id: payload.id },
            {
                $set: {
                    state: 'finished',
                    players: [...payload.players],
                    winningPlayerId: payload.winningPlayerId,
                    reason: payload.reason,
                    moveCount: payload.moves.length,
                    moves: [...payload.moves],
                    startedAt: payload.startedAt,
                    finishedAt: payload.finishedAt,
                    gameDurationMs: Math.max(0, payload.finishedAt - payload.startedAt),
                    updatedAt: payload.finishedAt
                }
            }
        );

        if (result.matchedCount === 0) {
            logMissingGameHistory('game-history-finalize-error', payload.id);
            return false;
        }

        return true;
    } catch (error: unknown) {
        console.error(JSON.stringify({
            type: 'game-history',
            event: 'game-history-finalize-error',
            timestamp: new Date().toISOString(),
            storage: 'mongodb',
            gameId: payload.id,
            message: error instanceof Error ? error.message : String(error)
        }));

        return false;
    }
}

export async function listFinishedGames(limit = 50): Promise<FinishedGameSummary[] | null> {
    const collection = await getGameHistoryCollection();
    if (!collection) {
        return null;
    }

    const documents = await collection
        .find({ state: 'finished' })
        .sort({ finishedAt: -1 })
        .limit(limit)
        .toArray();

    return documents.map(mapSummary);
}

export async function getFinishedGame(id: string): Promise<FinishedGameRecord | null | undefined> {
    const collection = await getGameHistoryCollection();
    if (!collection) {
        return null;
    }

    const document = await collection.findOne({ id, state: 'finished' });
    if (!document) {
        return undefined;
    }

    return mapRecord(document);
}
