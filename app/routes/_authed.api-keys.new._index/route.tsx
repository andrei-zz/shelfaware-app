import type { Route } from "./+types/route";

import { useFetcher } from "react-router";
import { z } from "zod/v4";

import {
  authenticate,
  hashString,
  sessionStorage,
} from "~/actions/auth.server";
import {
  coerceFormData,
  coerceTimestamp,
  parseWithDummy,
} from "~/actions/zod-utils";

import { Main } from "~/components/main";
import { Form } from "~/components/form/form";
import { Field } from "~/components/form/field";
import { SubmitButton } from "~/components/form/submit-button";
import { createApiKey, createApiKeySchema } from "~/actions/insert.server";
import { generateBase64url } from "~/lib/auth/base64url";

const PATHNAME = "/api-keys/new";

export const meta = ({}: Route.MetaArgs) => {
  return [
    { title: "Create API Key - ShelfAware" },
    // { name: "description", content: "ShelfAware" },
  ];
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const authenticatedUser = await authenticate(request, request.url);

  return { userId: authenticatedUser.id };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const authenticatedUser = await authenticate(request, request.url);

  let relativeUrl: string = PATHNAME;
  try {
    const url = new URL(request.url);
    relativeUrl = url.pathname + url.search;
  } catch (err: unknown) {
    console.error(`${relativeUrl}:action\n`, err, "\n");
    return new Response("Internal Server Error", {
      status: 500,
    });
  }

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let payload: Record<string, unknown> = {};
  try {
    const { expireAt, ...formData } = Object.fromEntries(
      await request.formData()
    );

    const dummy: Record<string, unknown> = {};

    const coercedFormData = coerceFormData(createApiKeySchema, {
      ...formData,
      keyHash: "you don't know",
      userId: authenticatedUser.id,
      expireAt: coerceTimestamp(formData.expireAt)?.toString() ?? "",
    });
    payload = parseWithDummy(createApiKeySchema, coercedFormData, dummy);
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return Response.json(
        { message: "Bad Request", errors: z.flattenError(err).fieldErrors },
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.error(`${relativeUrl}:action\n`, err, "\n");
    return new Response("Internal Server Error", {
      status: 500,
    });
  }

  try {
    const parsed = createApiKeySchema.parse({
      ...payload,
      userId: authenticatedUser.id,
    });
    const { keyHash, ...newApiKey } = await createApiKey(parsed);

    const session = await sessionStorage.getSession(
      request.headers.get("Cookie")
    );

    session.flash("newApiKey", plainKey);
    return redirect("/api-keys/new", {
      headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
    });

    return Response.json(newApiKey, {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      console.log("Should have caught this zod error earilier", err);
      return Response.json(
        { message: "Bad Request", errors: z.flattenError(err).fieldErrors },
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.error(`${relativeUrl}:action\n`, err, "\n");

    return new Response("Internal Server Error", {
      status: 500,
    });
  }
};

export default ({ loaderData }: Route.ComponentProps) => {
  const fetcher = useFetcher({ key: "new-api-key" });

  return (
    <Main>
      <Form fetcher={fetcher} method="POST" encType="multipart/form-data">
        <div className="flex items-center justify-between">
          <h2 className="mt-0 mb-0">Create API Key</h2>
        </div>
        <Field
          name="name"
          label="Name"
          fieldErrors={fetcher.data?.errors?.name}
        />
        <Field
          type="date"
          name="expireAt"
          // min={DateTime.now().toISODate()}
          label="Expiration date"
          fieldErrors={fetcher.data?.errors?.expireAt}
        />
        <SubmitButton fetcher={fetcher}>Create</SubmitButton>
      </Form>
    </Main>
  );
};
