import { Block } from "./model.ts";
import { ClientContext } from "./types.ts";

export const BlockStoreClient = {
  async writeBlock(ctx: ClientContext, params: Record<string, unknown>) {
    const workspaceKey = toWorkspaceKey(ctx);
    const block = transformToBlock(params);
    await ctx.kv.set({
      key: [...workspaceKey, "blocks", block.id],
      val: block,
    });
    for (const entry of await ctx.kv.listRef({
      prefixRef: [...workspaceKey, "blocks$", block.id, "tag-ref"],
    })) {
      ctx.kv.delete({ key: entry.key });
    }
    block.tags.forEach((tag, tagIndex) => {
      if (tag.text) {
        ctx.kv.set({
          key: [...workspaceKey, "blocks$", block.id, "tag-ref", tagIndex],
          ref: [...workspaceKey, "blocks$", "by-tag", tag.text, block.id, tagIndex],
          val: block,
        });
      }
    });
    return { ok: true, id: block.id };
  },

  async readBlocks(ctx: ClientContext, _params: Record<string, unknown>) {
    const workspaceKey = toWorkspaceKey(ctx);
    const kvEntries = await ctx.kv.list<Block>({
      prefixKey: [...workspaceKey, "blocks"],
      limitBy: 100,
    });
    const blocks = [];
    for (const kvEntry of kvEntries) {
      blocks.push(Block.parse(kvEntry.val));
    }
    return {
      ok: true,
      result: { blocks },
      count: { blocks: blocks.length },
    };
  },

  async readBlocksByTag(ctx: ClientContext, params: Record<string, unknown>) {
    const workspaceKey = toWorkspaceKey(ctx);
    const kvEntries = await ctx.kv.listRef<Block>({
      prefixRef: [...workspaceKey, "blocks$", "by-tag", params.tag as string],
      limitBy: 100,
    });
    const blocks = [];
    for (const kvEntry of kvEntries) {
      blocks.push(Block.parse(kvEntry.val));
    }
    return {
      ok: true,
      result: { blocks },
      count: { blocks: blocks.length },
    };
  },
};

const toWorkspaceKey = (ctx: ClientContext): string[] => {
  return [`workspace-${ctx.workspace}`];
};

const transformToBlock = (record: Record<string, unknown>): Block => {
  return Block.parse({
    ...record,
    lastModifiedDate: new Date().toISOString(),
  });
};
