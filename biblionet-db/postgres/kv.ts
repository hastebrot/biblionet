import { postgres } from "./pg.ts";

export type Key = readonly KeyPart[];
export type KeyPart = string | number | boolean | bigint | Uint8Array;
export type Entry<T = unknown> = { key: Key; val: T; ts: string; ref?: Key };
export type KvResult<T> = Entry<T>;
export type KvListResult<T> = Entry<T>[];

export class KvStore {
  // deno-lint-ignore no-explicit-any
  private sql: postgres.Sql<any>;

  constructor(sql: postgres.Sql) {
    this.sql = sql;
  }

  async get<T>({ key }: { key: Key }): Promise<KvResult<T>> {
    // TODO(benjamin): check if `where key =` uses index.
    return toKvResult(
      await this.sql`
        select key, val, ts from kv
        where key = ${keyToHash(key)}::jsonb
        limit 1;
      `
    );
  }

  async delete({ key }: { key: Key }): Promise<KvResult<unknown>> {
    // TODO(benjamin): check if delete is idempotent.
    // TODO(benjamin): check if `where key =` uses index.
    return toKvResult(
      await this.sql`
        delete from kv
        where key = ${keyToHash(key)}::jsonb
        returning null;
      `
    );
  }

  async set({ key, val, ref }: { key: Key; val: unknown; ref?: Key }): Promise<KvResult<unknown>> {
    return toKvResult(
      await this.sql`
        insert into kv (key, ref, val, ts)
        values (${keyToHash(key)}, ${ref ? keyToHash(ref) : null}, ${val}, now())
        on conflict (key) do update
        set ref = ${ref ? keyToHash(ref) : null}, val = ${val}, ts = now()
        returning null;
      `
    );
  }

  async list<T>({
    prefixKey,
    startAt,
    limitBy,
  }: {
    prefixKey: Key;
    startAt?: number;
    limitBy?: number;
  }): Promise<KvListResult<T>> {
    return toKvListResult(
      await this.sql`
        select key, val, ts from kv
        where key @> ${keyToHash(prefixKey)}::jsonb
        and key @? ${keyAtOffset(prefixKey, 1)}::jsonpath
        order by key asc
        ${limitBy ? this.sql`limit ${limitBy}` : this.sql``}
        ${startAt ? this.sql`offset ${startAt}` : this.sql``};
      `
    );
  }

  async listRef<T>({
    prefixRef,
    startAt,
    limitBy,
  }: {
    prefixRef: Key;
    startAt?: number;
    limitBy?: number;
  }): Promise<KvListResult<T>> {
    return toKvListResult(
      await this.sql`
        select key, ref, val, ts from kv
        where ref @> ${keyToHash(prefixRef)}::jsonb
        and ref @? ${keyAtOffset(prefixRef, 1)}::jsonpath
        order by ref asc
        ${limitBy ? this.sql`limit ${limitBy}` : this.sql``}
        ${startAt ? this.sql`offset ${startAt}` : this.sql``};
      `
    );
  }
}

export async function migrateKvStore(sql: postgres.Sql, schemaName: string, dropSchema = false) {
  if (dropSchema) {
    await sql`drop schema if exists "${sql.unsafe(schemaName)}" cascade;`;
  }
  await sql`create schema if not exists "${sql.unsafe(schemaName)}";`;
  await sql`set search_path to "${sql.unsafe(schemaName)}";`;
  await sql`create table if not exists kv (
    key jsonb unique not null,
    ref jsonb unique null,
    val jsonb not null,
    ts timestamp not null
  );`;
  await sql`create index if not exists kv_key_gin on kv using gin(key jsonb_path_ops);`;
  await sql`create index if not exists kv_ref_gin on kv using gin(ref jsonb_path_ops);`;
  await sql`set enable_seqscan = off;`;
}

const toKvResult = <T>(rows: postgres.RowList<postgres.Row[]>): KvResult<T> => {
  return rows.map((row) => {
    return { key: row.key, val: row.val, ts: row.ts };
  })[0];
};

const toKvListResult = <T>(rows: postgres.RowList<postgres.Row[]>): KvListResult<T> => {
  return rows.map((row) => {
    return { key: row.key, val: row.val, ts: row.ts };
  });
};

const keyToHash = (key: Key) => {
  return Object.fromEntries(
    Array.from(key, (value, index) => {
      return [index, value];
    })
  );
};

const keyAtOffset = (key: Key, offset: number) => {
  const lastIndex = key.length - 1;
  return `$."${lastIndex + offset}"`;
};
