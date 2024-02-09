import { KvStore } from "./postgres/kv.ts";

export type Context = {
  kv: KvStore;
};

export type ClientContext = {
  workspace: string;
  kv: KvStore;
};
