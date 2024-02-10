import { apiHandler } from "./api.ts";
import { Env } from "./helper/env.ts";
import { Log } from "./helper/log.ts";
import { KvStore, migrateKvStore } from "./postgres/kv.ts";
import { postgres } from "./postgres/pg.ts";

const domainName = "biblionet";
const serviceName = "biblionet-db";
const apiPort = Env.integerOrThrow("PORT");
const postgresAddr = "0.0.0.0:5432";
const postgresSchema = `${domainName}.${serviceName}`;

if (import.meta.main) {
  const sql = postgres(
    `postgres://postgres:postgres@${postgresAddr}?search_path=${postgresSchema}`,
    {
      onnotice: () => {}, // defaults to console.log.
      max: 10, // max number of connections.
      idle_timeout: 0, // idle connection timeout in seconds.
      connect_timeout: 30, // connect timeout in seconds.
      prepare: true, // enables prepare mode.
    }
  );
  addEventListener("beforeunload", async () => {
    await sql.end();
  });
  await migrateKvStore(sql, postgresSchema, false);
  const ctx = {
    kv: new KvStore(sql),
  };
  // console.log(await sql`select count(*) from kv;`)

  Deno.serve({
    port: apiPort,
    onListen() {
      Log.debug(
        "http server running",
        Log.inspect({
          domainName,
          serviceName,
          apiPort,
        })
      );
    },
    async handler(req: Request) {
      return await apiHandler(ctx, req);
    },
  });
}
