import type { Route } from "./+types/route";

import { redirect, useFetcher } from "react-router";

import { Main } from "~/components/main";
import { Form } from "~/components/form/form";
import { Field } from "~/components/form/field";
import { ImageField } from "~/components/form/image-field";
import { SubmitButton } from "~/components/form/submit-button";
import { authenticate } from "~/actions/auth.server";

export const meta = ({}: Route.MetaArgs) => {
  return [
    { title: "Create Image - ShelfAware" },
    // { name: "description", content: "ShelfAware" },
  ];
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  await authenticate(request, request.url);
};

export const action = async ({ request }: Route.ActionArgs) => {
  await authenticate(request, request.url);

  const imageEndpoint = "/api/image";
  const imageApiUrl = new URL(imageEndpoint, request.url).toString();

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const formData = await request.formData();

  const res = await fetch(imageApiUrl, {
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

  const newImage = await res.json();

  if (!newImage || !newImage.id) {
    return new Response(`${imageEndpoint} returns corrupted data`, {
      status: 500,
    });
  }

  return redirect(`/image/${newImage.id}`);
};

export default ({}: Route.ComponentProps) => {
  const fetcher = useFetcher({ key: "new-image" });

  return (
    <Main>
      <Form fetcher={fetcher} method="POST" encType="multipart/form-data">
        <div className="flex items-center justify-between">
          <h2 className="mt-0 mb-0">Create Image</h2>
        </div>
        <Field
          type="number"
          name="title"
          label="Title"
          fieldErrors={fetcher.data?.errors?.title}
        />
        <Field
          name="description"
          label="Description"
          fieldErrors={fetcher.data?.errors?.description}
        />
        <ImageField
          imageFileFieldName="image"
          label="Image"
          imageFileFieldErrors={fetcher.data?.errors?.image}
        />
        <SubmitButton fetcher={fetcher}>Create</SubmitButton>
      </Form>
    </Main>
  );
};
