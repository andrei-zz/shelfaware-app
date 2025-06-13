import "react-router";
import { createRequestHandler } from "@react-router/express";
import express from "express";
import type { Server } from "socket.io";

declare module "react-router" {
  interface AppLoadContext {
    VALUE_FROM_EXPRESS: string;
    io?: Server;
  }
}

export const app = createRequestHandler({
  build: () => import("virtual:react-router/server-build"),
  getLoadContext(req, res) {
    return {
      VALUE_FROM_EXPRESS: "Hello from Express",
      io: req.app.locals.io,
    };
  },
});
