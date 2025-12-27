export type MovementKind = 'income' | 'expense';

export type Movement = {
  id: string;
  budgetId: string;
  kind: MovementKind;
  amount: number;
  description: string;
  category?: string;
  occurredAt: Date;
};

export type Budget = {
  id: string;
  userId: string;
  name: string;
  slug: string;
  initialAmount: number;
  createdAt: Date;
};

export type BudgetStatus = {
  incomes: number;
  expenses: number;
  balance: number;
  movementCount: number;
  lastMovement?: Movement;
};

export type Intent =
  | { type: 'help' }
  | { type: 'createBudget'; name: string; initialAmount?: number }
  | { type: 'listBudgets' }
  | { type: 'getStatus'; budgetRef: string }
  | { type: 'listMovements'; budgetRef: string; limit: number }
  | {
      type: 'addIncome' | 'addExpense';
      budgetRef: string;
      amount: number;
      description: string;
      category?: string;
      occurredAt?: Date;
    }
  | { type: 'unknown'; raw: string };

export type DateRange = {
  from: Date;
  to: Date;
};

export type User = {
  id: string;
  platformId: string;
  platform: 'telegram' | 'whatsapp';
  createdAt: Date;
  lastInteraction: Date;
};

export type MessageContext = {
  userId: string;
  platform: 'telegram' | 'whatsapp';
  platformId: string;
};
