import { handleLayout } from "./api/siteLayout.tsx";

const siteRefreshMillis = 250;
const serverTimestamp = Date.now().toString();
const indexHtml = Deno.readTextFileSync("public/index.html");
const indexJs = Deno.readTextFileSync("public/index.js");

export const apiHandler = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);

  if (req.method === "GET" && url.pathname === "/") {
    return new Response(indexHtml, {
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    });
  }

  if (req.method === "GET" && url.pathname === "/index.js") {
    return new Response(indexJs, {
      headers: {
        "content-type": "text/javascript; charset=utf-8",
      },
    });
  }

  if (req.method === "GET" && url.pathname === "/site") {
    const html = `
      <div><div
        hx-get="/site-refresh?timestamp=${serverTimestamp}"
        hx-trigger="every ${siteRefreshMillis}ms"
        hx-swap="none swap:0s settle:0s"
      ></div></div>
      <div
        id="site-layout"
        hx-get="/site-layout"
        hx-trigger="load"
      ></div>
    `;
    return new Response(html, {
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    });
  }

  if (req.method === "GET" && url.pathname === "/site-refresh") {
    const clientTimestamp = url.searchParams.get("timestamp");
    return new Response("", {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "hx-refresh": clientTimestamp !== serverTimestamp ? "true" : "false",
      },
    });
  }

  const ctx = {};

  if (req.method === "GET" && url.pathname === "/site-layout") {
    return await handleLayout(ctx, req);
  }

  return new Response(null, { status: 404 });
};
