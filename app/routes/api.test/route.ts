import type { ActionFunction } from "react-router";
import { z } from "zod";

const RequestBodySchema = z.object({
  id: z.union([
    z.string(),
    z.number().refine((n) => n !== 0, { message: "id cannot be 0" }),
  ]),
  title: z.string().optional(),
  messages: z.union([
    z.string().min(1, "Must not be empty"),
    z.array(z.string()).min(1, "messages array must not be empty"),
  ]),
});

export const action: ActionFunction = async ({ request }) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  if (request.method !== "POST") {
    console.log(`/api/test\nBlocked non-POST request: ${request.method}\n`);
    return new Response("Method Not Allowed", { status: 405 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
    console.log("/api/test\nReceived payload:", payload, "\n");
  } catch (err) {
    console.error("/api/test\nJSON parse error:", err, "\n");
    return Response.json(
      { error: "Bad Request" },
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const { id, title, messages } = RequestBodySchema.parse(payload);
    console.log("/api/test\nValidated data:", { id, title, messages }, "\n");

    return Response.json(
      { status: "ok", received: { id, title, messages } },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err: unknown) {
    console.error("/api/test\n", err, "\n");

    if (err instanceof z.ZodError) {
      return Response.json(
        { error: "Bad Request", details: err.issues },
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return Response.json(
      { error: "Internal Server Error" },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
