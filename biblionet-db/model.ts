import { nanoid } from "./deps.ts";
import { z, Zod } from "./helper/zod.ts";

// ENDPOINT MESSAGES.

export const WriteBlockRequest = Zod.schema(
  "WriteBlockRequest",
  z.lazy(() => Block)
);

export const WriteBlockResponse = Zod.schema(
  "WriteBlockResponse",
  z.object({
    ok: z.boolean(),
    id: z.string(),
  })
);

export const ReadBlocksRequest = Zod.schema(
  "ReadBlocksRequest",
  z.object({
    tag: z.string().optional(),
  })
);

export const ReadBlocksResponse = Zod.schema(
  "ReadBlocksResponse",
  z.object({
    ok: z.boolean(),
    result: z.object({
      blocks: z.array(z.lazy(() => Block)),
    }),
    count: z.object({
      blocks: z.number(),
    }),
  })
);

export const ReadBlocksByTagRequest = Zod.schema(
  "ReadBlocksByTagRequest",
  z.object({
    tag: z.string().optional(),
  })
);

export const ReadBlocksByTagResponse = Zod.schema(
  "ReadBlocksByTagResponse",
  z.object({
    ok: z.boolean(),
    result: z.object({
      blocks: z.array(z.lazy(() => Block)),
    }),
    count: z.object({
      blocks: z.number(),
    }),
  })
);

// MESSAGES.

export type Tag = z.infer<typeof Block>;
export const Tag = z.object({
  text: z.string().optional(),
});

export type Block = z.infer<typeof Block>;
export const Block = z.object({
  id: z.string().default(() => nanoid(5)),
  dateCreated: z.string().default(() => new Date().toISOString()),
  dateLastModified: z.string().default(() => new Date().toISOString()),
  text: z.string().optional(),
  subtext: z.string().optional(),
  tags: z.array(Tag).default(() => []),
});
