import { Collection, ObjectId } from 'mongodb';
import { getDb } from './mongo.js';
import { User } from '../domain/types.js';

type UserDocument = {
  _id: ObjectId;
  platformId: string;
  platform: 'telegram' | 'whatsapp';
  createdAt: Date;
  lastInteraction: Date;
};

const USERS_COLLECTION = 'users';

const getUsersCollection = async (): Promise<Collection<UserDocument>> => {
  const db = await getDb();
  return db.collection<UserDocument>(USERS_COLLECTION);
};

const mapUser = (doc: UserDocument): User => ({
  id: doc._id.toHexString(),
  platformId: doc.platformId,
  platform: doc.platform,
  createdAt: doc.createdAt,
  lastInteraction: doc.lastInteraction
});

/**
 * Obtiene un usuario existente o lo crea si no existe
 * Actualiza la última interacción en cada llamada
 */
export const getOrCreateUser = async (
  platformId: string,
  platform: 'telegram' | 'whatsapp'
): Promise<User> => {
  const collection = await getUsersCollection();
  const now = new Date();

  // Buscar usuario existente
  let userDoc = await collection.findOne({ platformId, platform });

  if (userDoc) {
    // Usuario existe, actualizar última interacción
    await collection.updateOne(
      { _id: userDoc._id },
      { $set: { lastInteraction: now } }
    );
    userDoc.lastInteraction = now;
    return mapUser(userDoc);
  }

  // Usuario no existe, crear nuevo
  const newUserDoc: UserDocument = {
    _id: new ObjectId(),
    platformId,
    platform,
    createdAt: now,
    lastInteraction: now
  };

  await collection.insertOne(newUserDoc);
  console.log(`[User] New user created: ${platform}:${platformId}`);

  return mapUser(newUserDoc);
};

/**
 * Obtiene un usuario por su ID interno
 */
export const getUserById = async (userId: string): Promise<User | null> => {
  const collection = await getUsersCollection();

  let objectId: ObjectId;
  try {
    objectId = new ObjectId(userId);
  } catch {
    return null;
  }

  const userDoc = await collection.findOne({ _id: objectId });
  return userDoc ? mapUser(userDoc) : null;
};
