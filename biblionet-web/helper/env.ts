export const Env = {
  stringOrThrow(key: string): string {
    const value = Deno.env.get(key);
    if (value === undefined) {
      throw new Error(`env lookup failed, key='${key}'`);
    }
    return value;
  },

  integerOrThrow(key: string): number {
    const value = Deno.env.get(key);
    if (value === undefined) {
      throw new Error(`env lookup failed, key='${key}'`);
    }
    if (Number.isInteger(Number(value))) {
      return Number(value);
    }
    throw new Error(`env parse of integer failed, key='${key}'`);
  },
};
