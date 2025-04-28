// import { PassThrough } from "node:stream";

import type { AppLoadContext, EntryContext } from "react-router";
// import { createReadableStreamFromReadable } from "@react-router/node";
// import { ServerRouter } from "react-router";
// import { isbot } from "isbot";
// import type { RenderToPipeableStreamOptions } from "react-dom/server";
// import { renderToPipeableStream } from "react-dom/server";

import { handleRequest } from "@vercel/react-router/entry.server";

export const streamTimeout = 5_000;

export default async function (
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  loadContext: AppLoadContext
  // If you have middleware enabled:
  // loadContext: unstable_RouterContextProvider
) {
  return await handleRequest(
    request,
    responseStatusCode,
    responseHeaders,
    routerContext,
    loadContext
  );
}
