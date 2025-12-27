import { Intent } from '../domain/types.js';

export const KNOWN_INTENTS: Intent['type'][] = [
  'help',
  'createBudget',
  'listBudgets',
  'getStatus',
  'listMovements',
  'addIncome',
  'addExpense'
];

export const isKnownIntent = (intent: Intent['type']): boolean => {
  return KNOWN_INTENTS.includes(intent);
};
