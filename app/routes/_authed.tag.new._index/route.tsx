import type { Route } from "./+types/route";

import { redirect, useFetcher } from "react-router";

import { getItems } from "~/actions/select.server";

import { Main } from "~/components/main";
import { Form } from "~/components/form/form";
import { Field } from "~/components/form/field";
import { ItemField } from "~/components/form/item-field";
import { SubmitButton } from "~/components/form/submit-button";
import { authenticate } from "~/actions/auth.server";

export const meta = ({}: Route.MetaArgs) => {
  return [
    { title: "Create Tag - ShelfAware" },
    // { name: "description", content: "ShelfAware" },
  ];
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  await authenticate(request, request.url);

  const items = await getItems();
  return { items };
};

export const action = async ({ request }: Route.ActionArgs) => {
  await authenticate(request, request.url);

  const tagEndpoint = "/api/tag";
  const tagApiUrl = new URL(tagEndpoint, request.url).toString();

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const formData = await request.formData();

  const res = await fetch(tagApiUrl, {
    method: request.method,
    body: formData,
  });

  if (!res.ok) {
    if (
      (
        res.headers.get("Content-Type") ?? res.headers.get("content-type")
      )?.startsWith("application/json")
    ) {
      const resError = await res.json();
      return Response.json(resError, { status: res.status });
    } else {
      return new Response(res.body, { status: res.status });
    }
  }

  const newTag = await res.json();

  if (!newTag || !newTag.id) {
    return new Response(`${tagEndpoint} returns corrupted data`, {
      status: 500,
    });
  }

  return redirect(`/tag/${newTag.id}`);
};

export default ({ loaderData }: Route.ComponentProps) => {
  const fetcher = useFetcher({ key: "new-tag" });

  return (
    <Main>
      <Form fetcher={fetcher} method="POST" encType="multipart/form-data">
        <div className="flex items-center justify-between">
          <h2 className="mt-0 mb-0">Create Tag</h2>
        </div>
        <Field
          name="name"
          required
          label="Name"
          fieldErrors={fetcher.data?.errors?.name}
        />
        <Field
          name="uid"
          required
          label="UID (in hex)"
          fieldErrors={fetcher.data?.errors?.uid}
        />
        <ItemField
          items={loaderData.items}
          labelProps={{ children: "Attached item" }}
          selectValueProps={{ placeholder: "Unattached" }}
        />
        <SubmitButton fetcher={fetcher}>Create</SubmitButton>
      </Form>
    </Main>
  );
};
