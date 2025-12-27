import { Budget, Movement, MovementKind, BudgetStatus } from './types.js';

export const slugifyBudgetName = (name: string): string => {
  return name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .trim();
};

export const normalizeBudgetRef = (ref: string): string => {
  return slugifyBudgetName(ref.trim());
};

type BudgetStatusInput = {
  incomes: number;
  expenses: number;
  movementCount: number;
  lastMovement?: Movement | null;
};

export const calculateBudgetStatus = (budget: Budget, data: BudgetStatusInput): BudgetStatus => {
  const balance = budget.initialAmount + data.incomes - data.expenses;

  return {
    incomes: data.incomes,
    expenses: data.expenses,
    balance,
    movementCount: data.movementCount,
    lastMovement: data.lastMovement ?? undefined
  };
};

export const movementSign = (kind: MovementKind): 1 | -1 => {
  return kind === 'income' ? 1 : -1;
};
