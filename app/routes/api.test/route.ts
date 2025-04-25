import type { Route } from "./+types/route";

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

export const action = async ({ request }: Route.ActionArgs) => {
  let relativeUrl: string;
  try {
    const url = new URL(request.url);
    relativeUrl = url.pathname + url.search;
  } catch (err: unknown) {
    console.error("/api/test\nInvalid URL:", err, "\n");
    return Response.json(
      { error: "Internal Server Error" },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  if (request.method !== "POST") {
    console.log(
      `${relativeUrl}\nBlocked non-POST request: ${request.method}\n`
    );
    return new Response("Method Not Allowed", { status: 405 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
    console.log(`${relativeUrl}\nReceived payload:`, payload, "\n");
  } catch (err: unknown) {
    console.error(`${relativeUrl}\nJSON parse error:`, err, "\n");
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
    console.log(
      `${relativeUrl}\nValidated data:`,
      { id, title, messages },
      "\n"
    );

    const responsePayload = {
      time: Date.now(),
      received: { id, title, messages },
    };
    console.log(`${relativeUrl}\nSending response:`, responsePayload, "\n");
    return Response.json(responsePayload, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err: unknown) {
    console.error(`${relativeUrl}\n`, err, "\n");

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
