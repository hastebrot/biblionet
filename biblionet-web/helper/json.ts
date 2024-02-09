export const Json = {
  // deno-lint-ignore no-explicit-any
  write(text: any): string {
    return JSON.stringify(text, null, 2);
  },

  read(text: string): string {
    return JSON.parse(text);
  },
};
