import { MongoClient, Db } from 'mongodb';
import { loadConfig } from '../config.js';

let client: MongoClient | null = null;
let db: Db | null = null;

export const getMongoClient = async (): Promise<MongoClient> => {
  if (!client) {
    const config = loadConfig();
    client = new MongoClient(config.mongoUri);
    await client.connect();
    db = client.db();
  }
  return client;
};

export const getDb = async (): Promise<Db> => {
  if (!db) {
    await getMongoClient();
  }
  if (!db) {
    throw new Error('Mongo DB connection not available');
  }
  return db;
};
