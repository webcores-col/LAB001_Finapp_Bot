import { Intent, Budget, BudgetStatus, Movement, MessageContext } from '../domain/types.js';
import {
  createBudget,
  findBudgetByRef,
  getBudgetStatus,
  insertMovement,
  listBudgetsWithStatus,
  listMovements,
  MovementInput
} from '../infrastructure/repositories.js';
import { formatCurrency, formatDate } from '../infrastructure/format.js';

const HELP_MESSAGE = `🤖 Finanzas Bot

Comandos disponibles:
- ayuda → Muestra este mensaje
- presupuestos → Lista todos los presupuestos
- crear presupuesto <nombre> [monto inicial] → Crea un nuevo presupuesto
- saldo <presupuesto> → Muestra el saldo y estado del presupuesto
- movimientos <presupuesto> [limite] → Últimos movimientos
- ingreso <presupuesto> <monto> <descripcion> [| categoria] → Registra un ingreso
- gasto <presupuesto> <monto> <descripcion> [| categoria] → Registra un gasto`; 

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

const resolveBudget = async (userId: string, budgetRef: string): Promise<Budget> => {
  const cleaned = stripQuotes(budgetRef);
  const budget = await findBudgetByRef(userId, cleaned);
  if (!budget) {
    throw new Error(`No encontré el presupuesto "${cleaned}". Usa 'presupuestos' para ver la lista disponible.`);
  }
  return budget;
};

const formatStatus = (budget: Budget, status: BudgetStatus): string => {
  const lines = [
    `📊 ${budget.name}`,
    `Referencia: ${budget.slug}`,
    `Saldo disponible: ${formatCurrency(status.balance)}`
  ];

  if (budget.initialAmount > 0) {
    lines.push(`Monto inicial: ${formatCurrency(budget.initialAmount)}`);
  }

  if (status.movementCount > 0) {
    lines.push(
      `Ingresos: ${formatCurrency(status.incomes)} | Gastos: ${formatCurrency(status.expenses)}`
    );
  }

  if (status.lastMovement) {
    lines.push(
      `Último movimiento (${formatDate(status.lastMovement.occurredAt)}): ` +
        `${status.lastMovement.kind === 'income' ? '+' : '-'}${formatCurrency(status.lastMovement.amount)} — ${status.lastMovement.description}`
    );
  }

  return lines.join('\n');
};

const formatMovementLine = (movement: Movement): string => {
  const sign = movement.kind === 'income' ? '+' : '-';
  const base = `${formatDate(movement.occurredAt)} · ${sign}${formatCurrency(movement.amount)} · ${movement.description}`;
  return movement.category ? `${base} (#${movement.category})` : base;
};

const handleCreateBudget = async (
  userId: string,
  name: string,
  initialAmount?: number
): Promise<string> => {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return 'Debes indicar un nombre válido para el presupuesto.';
  }
  const amount = Number.isFinite(initialAmount) && initialAmount ? initialAmount : 0;
  if (amount < 0) {
    return 'El monto inicial debe ser mayor o igual a cero.';
  }

  try {
    const budget = await createBudget(userId, trimmedName, amount);
    const status = await getBudgetStatus(budget.id);
    return `✅ Presupuesto "${budget.name}" creado.
${formatStatus(budget, status)}`;
  } catch (error) {
    if (error instanceof Error) {
      return `⚠️ ${error.message}`;
    }
    return 'Ocurrió un error al crear el presupuesto.';
  }
};

const handleBudgetStatus = async (userId: string, budgetRef: string): Promise<string> => {
  try {
    const budget = await resolveBudget(userId, budgetRef);
    const status = await getBudgetStatus(budget.id);
    return formatStatus(budget, status);
  } catch (error) {
    if (error instanceof Error) {
      return `⚠️ ${error.message}`;
    }
    return 'Ocurrió un error al consultar el presupuesto.';
  }
};

const handleListBudgets = async (userId: string): Promise<string> => {
  const entries = await listBudgetsWithStatus(userId);
  if (entries.length === 0) {
    return 'Aún no tienes presupuestos. Usa "crear presupuesto" para comenzar.';
  }

  const lines = entries.map(({ budget, status }) => {
    return `• ${budget.name} → ${formatCurrency(status.balance)} (ingresos ${formatCurrency(
      status.incomes
    )} | gastos ${formatCurrency(status.expenses)})`;
  });

  return ['📋 Presupuestos registrados:', ...lines].join('\n');
};

const handleListMovements = async (
  userId: string,
  budgetRef: string,
  limit: number
): Promise<string> => {
  try {
    const budget = await resolveBudget(userId, budgetRef);
    const movements = await listMovements(budget.id, Math.max(1, limit));
    if (movements.length === 0) {
      return `No hay movimientos registrados para ${budget.name}.`;
    }

    const lines = movements.map((movement) => `• ${formatMovementLine(movement)}`);
    return [`🧾 Movimientos recientes de ${budget.name}:`, ...lines].join('\n');
  } catch (error) {
    if (error instanceof Error) {
      return `⚠️ ${error.message}`;
    }
    return 'Ocurrió un error al consultar los movimientos.';
  }
};

const handleMovementRegistration = async (
  userId: string,
  intent: Extract<Intent, { type: 'addIncome' | 'addExpense' }>
): Promise<string> => {
  const normalizedAmount = Number.isFinite(intent.amount) ? Math.abs(intent.amount) : NaN;
  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
    return 'El monto debe ser un número positivo.';
  }

  try {
    const budget = await resolveBudget(userId, intent.budgetRef);
    const movementInput: MovementInput = {
      budgetId: budget.id,
      kind: intent.type === 'addIncome' ? 'income' : 'expense',
      amount: normalizedAmount,
      description: intent.description,
      category: intent.category,
      occurredAt: intent.occurredAt ?? new Date()
    };

    await insertMovement(movementInput);
    const status = await getBudgetStatus(budget.id);
    const sign = movementInput.kind === 'income' ? '+' : '-';
    return `✅ Movimiento registrado en ${budget.name}:
${sign}${formatCurrency(movementInput.amount)} — ${movementInput.description}${
      movementInput.category ? ` (#${movementInput.category})` : ''
    }

${formatStatus(budget, status)}`;
  } catch (error) {
    if (error instanceof Error) {
      return `⚠️ ${error.message}`;
    }
    return 'No se pudo registrar el movimiento.';
  }
};

export const handleIntent = async (intent: Intent, context: MessageContext): Promise<string> => {
  switch (intent.type) {
    case 'help':
      return HELP_MESSAGE;
    case 'createBudget':
      return handleCreateBudget(context.userId, intent.name, intent.initialAmount);
    case 'listBudgets':
      return handleListBudgets(context.userId);
    case 'getStatus':
      return handleBudgetStatus(context.userId, intent.budgetRef);
    case 'listMovements':
      return handleListMovements(context.userId, intent.budgetRef, intent.limit);
    case 'addIncome':
    case 'addExpense':
      return handleMovementRegistration(context.userId, intent);
    default:
      return `No entendí tu solicitud. Escribe "ayuda" para ver los comandos disponibles.`;
  }
};
