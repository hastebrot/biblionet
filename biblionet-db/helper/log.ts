export const Log = {
  // deno-lint-ignore no-explicit-any
  debug(...data: any[]) {
    console.debug(...data);
  },

  // deno-lint-ignore no-explicit-any
  error(...data: any[]) {
    console.error(...data);
  },

  // deno-lint-ignore no-explicit-any
  log(label: string, ...data: any[]) {
    console.log(label + ":", ...data);
  },

  inspect(value: unknown, options?: Deno.InspectOptions) {
    return Deno.inspect(value, {
      colors: true,
      compact: true,
      ...options,
    });
  },
};
