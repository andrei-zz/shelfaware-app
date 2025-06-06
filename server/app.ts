import "react-router";

import { createRequestHandler } from "@react-router/express";
import express from "express";

// @ts-expect-error - virtual module provided by React Router at build time
import * as build from "virtual:react-router/server-build";

declare module "react-router" {
  interface AppLoadContext {
    VALUE_FROM_EXPRESS: string;
  }
}

export const app = express();

app.use(
  createRequestHandler({
    build,
    getLoadContext() {
      return {
        VALUE_FROM_EXPRESS: "Hello from Express",
      };
    },
  })
);
