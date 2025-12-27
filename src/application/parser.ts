import { Intent } from '../domain/types.js';

const stripQuotes = (value: string): string => {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
};

const parseAmount = (raw: string): number | null => {
  const sanitized = raw
    .replace(/[^0-9,.-]/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '.');
  if (!sanitized) {
    return null;
  }
  const value = Number(sanitized);
  return Number.isFinite(value) ? value : null;
};

const extractDescriptionAndCategory = (
  raw: string
): { description: string; category?: string } => {
  let text = raw.trim();
  if (!text) {
    return { description: '' };
  }

  let category: string | undefined;
  const pipeIndex = text.lastIndexOf('|');
  if (pipeIndex !== -1) {
    category = text.slice(pipeIndex + 1).trim();
    text = text.slice(0, pipeIndex).trim();
  } else {
    const hashMatch = text.match(/#([\p{L}0-9_-]+)$/u);
    if (hashMatch) {
      category = hashMatch[1].toLowerCase();
      text = text.slice(0, text.length - hashMatch[0].length).trim();
    }
  }

  return { description: text, category: category || undefined };
};

const parseBudgetRef = (raw: string): string => {
  return stripQuotes(raw).trim();
};

export const parseMessageToIntent = (message: string): Intent => {
  const trimmed = message.trim();
  if (!trimmed) {
    return { type: 'unknown', raw: message };
  }

  const normalized = trimmed.toLowerCase();

  if (['ayuda', 'help', 'menu'].includes(normalized)) {
    return { type: 'help' };
  }

  if (
    normalized === 'presupuestos' ||
    normalized === 'listar presupuestos' ||
    normalized === 'lista de presupuestos'
  ) {
    return { type: 'listBudgets' };
  }

  const createMatch = trimmed.match(/^(crear|nuevo)\s+presupuesto\s+(.+)$/i);
  if (createMatch) {
    const rest = createMatch[2].trim();
    if (!rest) {
      return { type: 'unknown', raw: message };
    }

    let name = rest;
    let initialAmount: number | undefined;

    const quoted = rest.match(/^("[^"]+"|'[^']+')\s*(.*)$/);
    if (quoted) {
      name = stripQuotes(quoted[1]);
      const numeric = parseAmount(quoted[2]);
      if (numeric !== null) {
        initialAmount = numeric;
      }
    } else {
      const parts = rest.split(/\s+/);
      const last = parts[parts.length - 1];
      const numeric = parseAmount(last);
      if (numeric !== null) {
        initialAmount = numeric;
        name = rest.slice(0, rest.length - last.length).trim();
      }
    }

    if (!name) {
      name = rest;
    }

    return {
      type: 'createBudget',
      name: stripQuotes(name).trim(),
      initialAmount
    };
  }

  const statusMatch = trimmed.match(/^(saldo|estado|presupuesto)\s+(.+)$/i);
  if (statusMatch) {
    return { type: 'getStatus', budgetRef: parseBudgetRef(statusMatch[2]) };
  }

  const movementsMatch = trimmed.match(/^movimientos\s+(.+)$/i);
  if (movementsMatch) {
    const rest = movementsMatch[1].trim();
    if (!rest) {
      return { type: 'unknown', raw: message };
    }

    let limit = 5;
    let budgetPart = rest;
    const limitMatch = rest.match(/(.*)\s+(\d{1,3})$/);
    if (limitMatch) {
      const parsed = Number.parseInt(limitMatch[2], 10);
      if (Number.isFinite(parsed)) {
        limit = parsed;
        budgetPart = limitMatch[1].trim();
      }
    }

    const budgetRef = parseBudgetRef(budgetPart);
    if (!budgetRef) {
      return { type: 'unknown', raw: message };
    }

    return {
      type: 'listMovements',
      budgetRef,
      limit: limit > 0 ? limit : 5
    };
  }

  const movementMatch = trimmed.match(
    /^(ingreso|gasto)\s+((?:"[^"]+"|'[^']+'|\S+))\s+([0-9.,-]+)\s+(.+)$/i
  );
  if (movementMatch) {
    const [, verb, rawBudget, amountRaw, rest] = movementMatch;
    const amount = parseAmount(amountRaw);
    const { description, category } = extractDescriptionAndCategory(rest);
    if (amount === null || !description) {
      return { type: 'unknown', raw: message };
    }

    return {
      type: verb.toLowerCase() === 'ingreso' ? 'addIncome' : 'addExpense',
      budgetRef: parseBudgetRef(rawBudget),
      amount,
      description,
      category
    };
  }

  return { type: 'unknown', raw: message };
};
