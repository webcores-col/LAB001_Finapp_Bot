const whitelist = new Set<string>();
const requestCounts = new Map<string, number>();

export const addToWhitelist = (id: string) => {
  whitelist.add(id);
};

export const isAllowed = (id: string): boolean => {
  return whitelist.has(id);
};

export const rateLimit = (key: string, limit = 10) => {
  const current = requestCounts.get(key) ?? 0;
  if (current >= limit) {
    return false;
  }
  requestCounts.set(key, current + 1);
  return true;
};
