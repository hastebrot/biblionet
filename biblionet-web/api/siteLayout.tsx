/** @jsx createElement */
import { icons } from "../deps.ts";
import { Json } from "../helper/json.ts";
import { Fragment, classNames, createElement, renderToString } from "../helper/jsx.ts";
import { Zod } from "../helper/zod.ts";
import { Block, ReadBlocksByTagResponse, ReadBlocksResponse } from "../model.ts";
import { Context } from "../types.ts";

export const handleLayout = async (ctx: Context, req: Request): Promise<Response> => {
  const blocksRes = await fetch("http://localhost:5060/read-blocks", {
    method: "post",
    headers: {
      "x-workspace": "demo",
    },
    body: Json.write({}),
  });
  const blocks = Zod.parse(ReadBlocksResponse, await blocksRes.json()).result.blocks;

  const blocksTagsRes = await fetch("http://localhost:5060/read-blocks-by-tag", {
    method: "post",
    headers: {
      "x-workspace": "demo",
    },
    body: Json.write({ tag: "hotel" }),
  });
  const blocksTags = Zod.parse(ReadBlocksByTagResponse, await blocksTagsRes.json()).result.blocks;

  const url = new URL(req.url);
  const pageIndex = url.searchParams.get("pageIndex");
  const html = renderToString(
    <Layout
      pageIndex={pageIndex !== null ? parseInt(pageIndex, 10) : undefined}
      blocks={blocks}
      blocksTags={blocksTags}
    />
  );

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
};

export type LayoutProps = {
  pageIndex?: number;
  blocks: Block[];
  blocksTags: Block[];
};

export const Layout = ({ pageIndex, blocks, blocksTags }: LayoutProps) => {
  return (
    <div
      class={classNames(
        "grid font-sans font-[400] text-[16px] leading-[20px]",
        "[text-rendering:optimizelegibility] [-webkit-font-smoothing:antialiased] [-moz-osx-font-smoothing:grayscale]",
        "min-h-[100vh] supports-[-webkit-touch-callout:none]:min-h-[-webkit-fill-available]"
      )}
    >
      <main class="w-full h-full text-black p-4">
        <div class="hidden">
          {blocksTags.map((block) => {
            return (
              <div class="flex gap-2">
                <div>{block.id}</div>
                <div>{block.text}</div>
                <div>
                  {block.tags.map((tag) => (
                    <span>{tag.text}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div class="flex flex-col gap-2 tabular-nums max-w-[350px]">
          {blocks.map((block) => {
            return (
              <Fragment>
                <div class="flex items-start gap-2">
                  <input name="id" class="hidden" type="hidden" value={block.id} />
                  <div class="flex flex-1 items-start">
                    <ButtonDot />
                    <TextInput value={block.text} />
                  </div>
                  {/* <input
                  name="text"
                  class="p-1.5 px-2 rounded-md bg-stone-200 hover:bg-stone-300 outline-2 -outline-offset-2 outline-stone-500 focus:outline"
                  type="text"
                  defaultValue={block.text}
                /> */}
                  <ButtonDotDot />
                </div>
                <div>
                  {block.tags.map((tag) => (
                    <span>{tag.text}</span>
                  ))}
                </div>
              </Fragment>
            );
          })}
          <div class="hidden _flex items-start gap-2">
            <div class="p-1.5 flex-1">&nbsp;</div>
            <ButtonDotDot />
          </div>
        </div>
      </main>
    </div>
  );
};

type TextInputProps = {
  value?: string;
};

const TextInput = (props: TextInputProps) => {
  // outline-2 -outline-offset-2 outline-stone-500 focus:outline
  return (
    <div class="w-full grid rounded-md rounded-l-none bg-stone-200 hover:bg-stone-300 cursor-text overflow-hidden">
      <div class="invisible col-[1] row-[1] p-1.5 px-2 after:content-[attr(data-content)_'_'] after:whitespace-pre-wrap"></div>
      <textarea
        class="col-[1] row-[1] p-1.5 px-2 bg-inherit text-inherit outline-none resize-none overflow-hidden"
        hx-on-input="this.parentNode.firstChild.setAttribute('data-content', this.value)"
        rows={1}
        spellcheck={"false" as unknown as boolean}
        autocapitalize="off"
        autocomplete="off"
        autocorrect="off"
      >
        {props.value}
      </textarea>
    </div>
  );
};

const ButtonDot = () => {
  return (
    <button class="p-1.5 px-2 rounded-md rounded-r-none bg-stone-200 hover:bg-stone-300 active:bg-stone-400">
      <div class="flex h-[20px] items-center">
        <icons.CircleDot size={15} />
      </div>
    </button>
  );
};

const ButtonDotDot = () => {
  return (
    <button class="p-1.5 px-2 rounded-md bg-stone-200 hover:bg-stone-300 active:bg-stone-400">
      <div class="flex h-[20px] items-center">
        <icons.MoreVertical size={15} />
      </div>
    </button>
  );
};
const ButtonAdd = () => {
  return (
    <button class="p-1.5 px-2 rounded-md bg-stone-200 hover:bg-stone-300 active:bg-stone-400">
      <div class="flex h-[20px] items-center">
        <icons.Plus size={15} />
      </div>
    </button>
  );
};

const ButtonRemove = () => {
  return (
    <button class="p-1.5 px-2 rounded-md bg-stone-200 hover:bg-stone-300 active:bg-stone-400">
      <div class="flex h-[20px] items-center">
        <icons.Minus size={15} />
      </div>
    </button>
  );
};
