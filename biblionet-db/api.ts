import { BlockStoreClient } from "./client.ts";
import { Fmt } from "./helper/fmt.ts";
import { Json } from "./helper/json.ts";
import { throwError } from "./helper/mod.ts";
import { Zod } from "./helper/zod.ts";
import {
  ReadBlocksByTagRequest,
  ReadBlocksByTagResponse,
  ReadBlocksRequest,
  ReadBlocksResponse,
  WriteBlockRequest,
  WriteBlockResponse,
} from "./model.ts";
import { Context } from "./types.ts";

export const apiHandler = async (ctx: Context, req: Request): Promise<Response> => {
  const startTime = performance.now();
  const url = new URL(req.url);
  const clientContext = transformToClientContext(ctx, req.headers);

  if (req.method === "POST" && url.pathname === "/write-block") {
    const input = Zod.parse(WriteBlockRequest, await req.json());
    const output = Zod.parse(
      WriteBlockResponse,
      await BlockStoreClient.writeBlock(clientContext, input)
    );
    return new Response(writeOutputJson(output, startTime), {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
      },
    });
  }

  if (req.method === "POST" && url.pathname === "/read-blocks") {
    const input = Zod.parse(ReadBlocksRequest, await req.json());
    const output = Zod.parse(
      ReadBlocksResponse,
      await BlockStoreClient.readBlocks(clientContext, input)
    );
    return new Response(writeOutputJson(output, startTime), {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
      },
    });
  }

  if (req.method === "POST" && url.pathname === "/read-blocks-by-tag") {
    const input = Zod.parse(ReadBlocksByTagRequest, await req.json());
    const output = Zod.parse(
      ReadBlocksByTagResponse,
      await BlockStoreClient.readBlocksByTag(clientContext, input)
    );
    return new Response(writeOutputJson(output, startTime), {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
      },
    });
  }

  return new Response(null, { status: 404 });
};

const writeOutputJson = (output: object, startTime: number) => {
  const time = Fmt.millis(performance.now() - startTime);
  const size = Fmt.bytes(Json.write(output).length);
  return Json.write({ ...output, time, size });
};

const transformToClientContext = (ctx: Context, headers: Headers) => {
  return {
    kv: ctx.kv,
    workspace: headers.get("x-workspace") ?? throwError(`x-workspace header is missing"`),
  };
};
