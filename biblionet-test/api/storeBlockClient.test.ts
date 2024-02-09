import { nanoid } from "../../biblionet-db/deps.ts";
import { assert, fake } from "../deps.ts";
import { consumeJson, fetchPost, range } from "../helper.ts";

const biblionetDbAddr = "localhost:5060";
const newWorkspace = () => `test-${Date.now()}-${nanoid(5)}`;

Deno.test("write random blocks", async () => {
  const randomTag = () => {
    return fake.rand(["alpha", "bravo", "charlie", "delta", "echo", "foxtrot", "golf", "hotel"]);
  };

  const itemCount = 5;
  for (const index of range(0, itemCount)) {
    const tag = randomTag();
    await consumeJson(
      fetchPost({
        url: `http://${biblionetDbAddr}/write-block`,
        headers: {
          "x-workspace": "demo",
        },
        bodyParams: {
          id: `id-block-${index + 1}`,
          text: `block #${tag}`,
          tags: [{ text: tag }],
        },
      })
    );
  }
});

Deno.test("write blocks, read blocks", async () => {
  const workspaceName = newWorkspace();

  // given:
  await consumeJson(
    fetchPost({
      url: `http://${biblionetDbAddr}/write-block`,
      headers: {
        "x-workspace": workspaceName,
      },
      bodyParams: {
        id: "id-block-1",
        text: "text",
        tags: [{ text: "tag-1" }],
      },
    })
  );
  await consumeJson(
    fetchPost({
      url: `http://${biblionetDbAddr}/write-block`,
      headers: {
        "x-workspace": workspaceName,
      },
      bodyParams: {
        id: "id-block-2",
        text: "text",
      },
    })
  );

  // when:
  const res = await fetchPost({
    url: `http://${biblionetDbAddr}/read-blocks`,
    headers: {
      "x-workspace": workspaceName,
    },
    bodyParams: {},
  });

  // then:
  assert.assertObjectMatch(await consumeJson(res), {
    ok: true,
    result: {
      blocks: [
        {
          id: "id-block-1",
          text: "text",
          tags: [{ text: "tag-1" }],
        },
        {
          id: "id-block-2",
          text: "text",
        },
      ],
    },
    count: { blocks: 2 },
  });
});

Deno.test("write blocks, read blocks by tag", async () => {
  const workspaceName = newWorkspace();

  // given:
  await consumeJson(
    fetchPost({
      url: `http://${biblionetDbAddr}/write-block`,
      headers: {
        "x-workspace": workspaceName,
      },
      bodyParams: {
        id: "id-block-1",
        text: "text",
        tags: [{ text: "tag-1" }, { text: "tag-2" }],
      },
    })
  );
  await consumeJson(
    fetchPost({
      url: `http://${biblionetDbAddr}/write-block`,
      headers: {
        "x-workspace": workspaceName,
      },
      bodyParams: {
        id: "id-block-2",
        text: "text",
      },
    })
  );

  // when:
  const res = await fetchPost({
    url: `http://${biblionetDbAddr}/read-blocks-by-tag`,
    headers: {
      "x-workspace": workspaceName,
    },
    bodyParams: { tag: "tag-1" },
  });

  // then:
  assert.assertObjectMatch(await consumeJson(res), {
    ok: true,
    result: {
      blocks: [
        {
          id: "id-block-1",
          text: "text",
          tags: [{ text: "tag-1" }, { text: "tag-2" }],
        },
      ],
    },
    count: { blocks: 1 },
  });
});
