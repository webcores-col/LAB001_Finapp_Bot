import { DateRange } from './types.js';

const now = () => new Date();

export const today = (): DateRange => {
  const current = now();
  const from = new Date(current.getFullYear(), current.getMonth(), current.getDate());
  const to = new Date(from);
  to.setDate(to.getDate() + 1);
  return { from, to };
};

export const thisWeek = (): DateRange => {
  const current = now();
  const day = current.getDay();
  const diff = current.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  const from = new Date(current.getFullYear(), current.getMonth(), diff);
  const to = new Date(from);
  to.setDate(from.getDate() + 7);
  return { from, to };
};

export const thisMonth = (): DateRange => {
  const current = now();
  const from = new Date(current.getFullYear(), current.getMonth(), 1);
  const to = new Date(current.getFullYear(), current.getMonth() + 1, 1);
  return { from, to };
};
