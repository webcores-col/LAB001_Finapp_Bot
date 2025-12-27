import { Collection, ObjectId } from 'mongodb';
import { getDb } from './mongo.js';
import {
  Budget,
  BudgetStatus,
  Movement,
  MovementKind
} from '../domain/types.js';
import {
  calculateBudgetStatus,
  normalizeBudgetRef,
  slugifyBudgetName
} from '../domain/budget.js';

type BudgetDocument = {
  _id: ObjectId;
  userId: ObjectId;
  name: string;
  slug: string;
  nameNormalized: string;
  initialAmount: number;
  createdAt: Date;
};

type MovementDocument = {
  _id: ObjectId;
  budgetId: ObjectId;
  kind: MovementKind;
  amount: number;
  description: string;
  category?: string;
  occurredAt: Date;
  createdAt: Date;
};

type BudgetSummaryDocument = {
  _id: ObjectId;
  incomes: number;
  expenses: number;
  movementCount: number;
  lastMovement?: MovementDocument;
};

export type MovementInput = {
  budgetId: string;
  kind: MovementKind;
  amount: number;
  description: string;
  category?: string;
  occurredAt: Date;
};

const BUDGETS_COLLECTION = 'budgets';
const MOVEMENTS_COLLECTION = 'movements';

const getBudgetsCollection = async (): Promise<Collection<BudgetDocument>> => {
  const db = await getDb();
  return db.collection<BudgetDocument>(BUDGETS_COLLECTION);
};

const getMovementsCollection = async (): Promise<Collection<MovementDocument>> => {
  const db = await getDb();
  return db.collection<MovementDocument>(MOVEMENTS_COLLECTION);
};

const mapBudget = (doc: BudgetDocument): Budget => ({
  id: doc._id.toHexString(),
  userId: doc.userId.toHexString(),
  name: doc.name,
  slug: doc.slug,
  initialAmount: doc.initialAmount,
  createdAt: doc.createdAt
});

const mapMovement = (doc: MovementDocument): Movement => ({
  id: doc._id.toHexString(),
  budgetId: doc.budgetId.toHexString(),
  kind: doc.kind,
  amount: doc.amount,
  description: doc.description,
  category: doc.category,
  occurredAt: doc.occurredAt
});

const buildBudgetStatus = (
  budget: Budget,
  summary?: BudgetSummaryDocument | null
): BudgetStatus => {
  return calculateBudgetStatus(budget, {
    incomes: summary?.incomes ?? 0,
    expenses: summary?.expenses ?? 0,
    movementCount: summary?.movementCount ?? 0,
    lastMovement: summary?.lastMovement ? mapMovement(summary.lastMovement) : undefined
  });
};

const toObjectId = (value: string): ObjectId | null => {
  try {
    return new ObjectId(value);
  } catch (e) {
    return null;
  }
};

const ensureUniqueSlug = async (
  collection: Collection<BudgetDocument>,
  userId: ObjectId,
  slugBase: string
): Promise<string> => {
  const base = slugBase || 'presupuesto';
  let slug = base;
  let counter = 2;

  while (await collection.findOne({ userId, slug })) {
    slug = `${base}-${counter}`;
    counter += 1;
  }

  return slug;
};

export const createBudget = async (userId: string, name: string, initialAmount: number): Promise<Budget> => {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error('El nombre del presupuesto no puede estar vacío');
  }

  const userObjectId = toObjectId(userId);
  if (!userObjectId) {
    throw new Error('ID de usuario inválido');
  }

  const collection = await getBudgetsCollection();
  const existing = await collection.findOne({
    userId: userObjectId,
    nameNormalized: trimmedName.toLowerCase()
  });
  if (existing) {
    throw new Error('Ya existe un presupuesto con ese nombre');
  }

  const slug = await ensureUniqueSlug(collection, userObjectId, slugifyBudgetName(trimmedName));
  const now = new Date();
  const doc: BudgetDocument = {
    _id: new ObjectId(),
    userId: userObjectId,
    name: trimmedName,
    slug,
    nameNormalized: trimmedName.toLowerCase(),
    initialAmount,
    createdAt: now
  };

  await collection.insertOne(doc);
  return mapBudget(doc);
};

export const listBudgets = async (userId: string): Promise<Budget[]> => {
  const userObjectId = toObjectId(userId);
  if (!userObjectId) {
    return [];
  }

  const collection = await getBudgetsCollection();
  const docs = await collection.find({ userId: userObjectId }).sort({ createdAt: 1 }).toArray();
  return docs.map(mapBudget);
};

export const listBudgetsWithStatus = async (userId: string): Promise<
  Array<{ budget: Budget; status: BudgetStatus }>
> => {
  const budgets = await listBudgets(userId);
  if (budgets.length === 0) {
    return [];
  }

  const movementCollection = await getMovementsCollection();
  const ids = budgets.map((budget) => toObjectId(budget.id)).filter((id): id is ObjectId => Boolean(id));

  if (ids.length === 0) {
    return budgets.map((budget) => ({ budget, status: buildBudgetStatus(budget) }));
  }

  const summaries = await movementCollection
    .aggregate<BudgetSummaryDocument>([
      { $match: { budgetId: { $in: ids } } },
      { $sort: { occurredAt: -1 } },
      {
        $group: {
          _id: '$budgetId',
          incomes: {
            $sum: {
              $cond: [{ $eq: ['$kind', 'income'] }, '$amount', 0]
            }
          },
          expenses: {
            $sum: {
              $cond: [{ $eq: ['$kind', 'expense'] }, '$amount', 0]
            }
          },
          movementCount: { $sum: 1 },
          lastMovement: { $first: '$$ROOT' }
        }
      }
    ])
    .toArray();

  const summaryMap = new Map<string, BudgetSummaryDocument>();
  summaries.forEach((summary) => {
    summaryMap.set(summary._id.toHexString(), summary);
  });

  return budgets.map((budget) => ({
    budget,
    status: buildBudgetStatus(budget, summaryMap.get(budget.id))
  }));
};

export const findBudgetByRef = async (userId: string, ref: string): Promise<Budget | null> => {
  const trimmed = ref.trim();
  if (!trimmed) {
    return null;
  }

  const userObjectId = toObjectId(userId);
  if (!userObjectId) {
    return null;
  }

  const collection = await getBudgetsCollection();
  const slug = normalizeBudgetRef(trimmed);
  const nameNormalized = trimmed.toLowerCase();

  // Buscar por slug o nombre normalizado, siempre filtrando por userId
  const doc = await collection.findOne({
    userId: userObjectId,
    $or: [
      { slug },
      { nameNormalized }
    ]
  });

  return doc ? mapBudget(doc) : null;
};

export const getBudgetById = async (budgetId: string): Promise<Budget | null> => {
  const collection = await getBudgetsCollection();
  const asObjectId = toObjectId(budgetId);
  if (!asObjectId) {
    return null;
  }
  const doc = await collection.findOne({ _id: asObjectId });
  return doc ? mapBudget(doc) : null;
};

export const getBudgetStatus = async (budgetId: string): Promise<BudgetStatus> => {
  const budget = await getBudgetById(budgetId);
  if (!budget) {
    throw new Error('Presupuesto no encontrado');
  }

  const movementCollection = await getMovementsCollection();
  const asObjectId = toObjectId(budgetId);

  const [summary] = await movementCollection
    .aggregate<BudgetSummaryDocument>([
      { $match: { budgetId: asObjectId } },
      { $sort: { occurredAt: -1 } },
      {
        $group: {
          _id: '$budgetId',
          incomes: {
            $sum: {
              $cond: [{ $eq: ['$kind', 'income'] }, '$amount', 0]
            }
          },
          expenses: {
            $sum: {
              $cond: [{ $eq: ['$kind', 'expense'] }, '$amount', 0]
            }
          },
          movementCount: { $sum: 1 },
          lastMovement: { $first: '$$ROOT' }
        }
      }
    ])
    .toArray();

  return buildBudgetStatus(budget, summary ?? null);
};

export const insertMovement = async (movement: MovementInput): Promise<Movement> => {
  const collection = await getMovementsCollection();
  const asObjectId = toObjectId(movement.budgetId);
  if (!asObjectId) {
    throw new Error('Presupuesto no encontrado');
  }

  const doc: MovementDocument = {
    _id: new ObjectId(),
    budgetId: asObjectId,
    kind: movement.kind,
    amount: movement.amount,
    description: movement.description,
    category: movement.category,
    occurredAt: movement.occurredAt,
    createdAt: new Date()
  };

  await collection.insertOne(doc);
  return mapMovement(doc);
};

export const listMovements = async (
  budgetId: string,
  limit: number
): Promise<Movement[]> => {
  const collection = await getMovementsCollection();
  const asObjectId = toObjectId(budgetId);
  if (!asObjectId) {
    return [];
  }

  const docs = await collection
    .find({ budgetId: asObjectId })
    .sort({ occurredAt: -1 })
    .limit(limit)
    .toArray();

  return docs.map(mapMovement);
};
