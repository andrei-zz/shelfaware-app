import path from "path";
import express from "express";
import { createServer } from "http";
import compression from "compression";
import morgan from "morgan";
import { globSync } from "glob";
import { Server } from "socket.io";

// Short-circuit the type-checking of the built output.
const matches = globSync("./build/server/nodejs_*/index.js");
if (matches.length !== 0 && matches.length !== 1) {
  throw new Error(`Expected at most one server build, found ${matches.length}`);
}
const BUILD_PATH =
  matches.length === 0 ? "./build/server/index.js" : path.resolve(matches[0]);

const DEVELOPMENT = process.env.NODE_ENV === "development";
const PORT = Number.parseInt(process.env.PORT || "3000");

const app = express();
// You need to create the HTTP server from the Express app
const httpServer = createServer(app);
// And then attach the socket.io server to the HTTP server
const io = new Server(httpServer);

// Then you can use `io` to listen the `connection` event and get a socket
// from a client
io.on("connection", (socket) => {
  // from this point you are on the WS connection with a specific client
  console.log("socket.io ID:", socket.id, "connected");

  socket.emit("confirmation", "connected!");

  socket.on("confirmation", (lastItemEventId) => {
    console.log("socket.io ID:", socket.id, "confirmation")
    /* TODO: send the events that happen after client initial load */
  });

  socket.on("disconnect", (reason) => {
    console.log("socket.io ID:", socket.id, "disconnected", `reason: ${reason}`);
  });
});

app.locals.io = io;

app.use(compression());
app.disable("x-powered-by");

if (DEVELOPMENT) {
  console.log("Starting development server");
  const viteDevServer = await import("vite").then((vite) =>
    vite.createServer({
      server: { middlewareMode: true },
    })
  );
  app.use(viteDevServer.middlewares);
  app.use(async (req, res, next) => {
    try {
      const source = await viteDevServer.ssrLoadModule("./server/app.ts");
      return source.app(req, res, next);
    } catch (error) {
      if (typeof error === "object" && error instanceof Error) {
        viteDevServer.ssrFixStacktrace(error);
      }
      next(error);
    }
  });
} else {
  console.log("Starting production server");
  app.use(
    "/assets",
    express.static("build/client/assets", { immutable: true, maxAge: "1y" })
  );
  app.use(express.static("build/client", { maxAge: "1h" }));
  app.use(morgan("tiny"));
  app.use(await import(BUILD_PATH).then((mod) => mod.app));
}

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
