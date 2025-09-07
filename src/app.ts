/* eslint-disable no-console */
import { Hono } from "hono";
import env from "@/env";
import { connect } from "@/db/index";

const app = new Hono();

app.all((ctx) =>
  ctx.json({
    message: "Welcome!",
  }),
);

(async () => {
  if (env.NODE_ENV !== "test") {
    try {
      await connect();
      const server = Bun.serve({
        fetch: app.fetch,
        hostname: "0.0.0.0",
        port: env.PORT,
      });
      console.log(`Server running on ${server.url}`);
    } catch (err) {
      console.error("Failed to start server:", err);
      process.exit(1);
    }
  }
})();
