import { apiHandler } from "./api.ts";
import { Env } from "./helper/env.ts";
import { Log } from "./helper/log.ts";

const domainName = "biblionet";
const serviceName = "biblionet-web";
const apiPort = Env.integerOrThrow("PORT");

if (import.meta.main) {
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
      return await apiHandler(req);
    },
  });
}
