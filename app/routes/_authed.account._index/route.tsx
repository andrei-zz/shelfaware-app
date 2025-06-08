import type { Route } from "./+types/route";

import { useFetcher } from "react-router";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";
import { DateTime } from "luxon";

import { images as imagesTable } from "~/database/schema";
import { authenticate, hashPassword } from "~/actions/auth.server";
import { getImages, getUser } from "~/actions/select.server";
import { updateUser, updateUserSchema } from "~/actions/update.server";
import { MAX_IMAGE_FILE_SIZE, uploadImage } from "~/actions/image.server";
import { coerceFormData, parseWithDummy } from "~/actions/zod-utils";

import { Main } from "~/components/main";
import { Form } from "~/components/form/form";
import { Field } from "~/components/form/field";
import { ImageField } from "~/components/form/image-field";
import { SubmitButton } from "~/components/form/submit-button";

const PATHNAME = "/account";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const authenticatedUser = await authenticate(request, request.url);

  const user = await getUser(authenticatedUser.id);
  const images = await getImages([eq(imagesTable.type, "avatar")]);

  return { user, images };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const user = await authenticate(request, request.url);

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

  if (request.method !== "PATCH") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let payload: Record<string, unknown> = {};
  let password: string | null = null;
  let avatarImageFile: File | null = null;
  try {
    const {
      password: formPassword,
      avatarImage: formAvatarImage,
      ...formData
    } = Object.fromEntries(await request.formData());

    const dummy: Record<string, unknown> = {};
    if (user.id) {
      formData.id = user.id;
    }
    if (typeof formPassword === "string") {
      password = formPassword;
      dummy.passwordHash = crypto.randomUUID();
    }
    if (
      formAvatarImage instanceof File &&
      formAvatarImage.size != null &&
      formAvatarImage.size > 0 &&
      formAvatarImage.size <= MAX_IMAGE_FILE_SIZE
    ) {
      avatarImageFile = formAvatarImage;
      dummy.avatarImageId = 0;
    }

    const coercedFormData = coerceFormData(updateUserSchema, formData);
    payload = parseWithDummy(updateUserSchema, coercedFormData, dummy);
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

  const image = await uploadImage(avatarImageFile, { type: "avatar" });
  payload.avatarImageId = image?.id ?? payload.avatarImageId;
  if (avatarImageFile != null && !payload.avatarImageId) {
    return new Response("Invalid image file", { status: 400 });
  }

  try {
    const passwordHash = password ? await hashPassword(password) : undefined;

    const parsed = updateUserSchema.parse({
      ...payload,
      passwordHash,
    });
    const updatedUser = await updateUser(parsed);

    return Response.json(updatedUser, {
      status: 200,
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
  const fetcher = useFetcher({ key: "account" });

  return (
    <Main>
      <Form
        fetcher={fetcher}
        method="PATCH"
        encType="multipart/form-data"
        navigate={false}
      >
        <div className="flex items-center justify-between">
          <h2 className="mt-0 mb-0">Account</h2>
        </div>
        <Field
          id="id"
          readOnly
          disabled
          label="User ID"
          value={loaderData.user?.id}
          fieldErrors={fetcher.data?.errors?.id}
        />
        <Field
          type="email"
          name="email"
          required
          defaultValue={loaderData.user?.email}
          label="Email"
          fieldErrors={fetcher.data?.errors?.email}
        />
        <Field
          type="password"
          name="password"
          required={false}
          label="Password"
          placeholder="Unchanged"
          fieldErrors={fetcher.data?.errors?.password}
        />
        <Field
          name="name"
          required
          defaultValue={loaderData.user?.name}
          label="Display name"
          fieldErrors={fetcher.data?.errors?.name}
        />
        <ImageField
          imageFileFieldName="avatarImage"
          imageIdFieldName="avatarImageId"
          label="Avatar"
          image={loaderData.user?.avatar ?? undefined}
          images={loaderData.images}
          imageFileFieldErrors={fetcher.data?.errors?.avatarImage}
          imageIdFieldErrors={fetcher.data?.errors?.avatarImageId}
        />
        <Field
          type="datetime-local"
          id="createdAt"
          readOnly
          disabled
          defaultValue={
            loaderData.user?.createdAt != null
              ? DateTime.fromMillis(
                  Math.round(loaderData.user.createdAt / 1000) * 1000
                ).toISO({
                  includeOffset: false,
                  suppressMilliseconds: true,
                }) ?? undefined
              : undefined
          }
          label="User creation date"
          fieldErrors={fetcher.data?.errors?.createdAt}
        />
        <Field
          type="datetime-local"
          id="updatedAt"
          readOnly
          disabled
          defaultValue={
            loaderData.user?.updatedAt != null
              ? DateTime.fromMillis(
                  Math.round(loaderData.user.updatedAt / 1000) * 1000
                ).toISO({
                  includeOffset: false,
                  suppressMilliseconds: true,
                }) ?? undefined
              : undefined
          }
          label="Last updated date"
          fieldErrors={fetcher.data?.errors?.updatedAt}
        />
        <Field
          type="datetime-local"
          id="deletedAt"
          readOnly
          disabled
          defaultValue={
            loaderData.user?.deletedAt != null
              ? DateTime.fromMillis(
                  Math.round(loaderData.user.deletedAt / 1000) * 1000
                ).toISO({
                  includeOffset: false,
                  suppressMilliseconds: true,
                }) ?? undefined
              : undefined
          }
          label="Deletion date"
          fieldErrors={fetcher.data?.errors?.deletedAt}
        />
        <SubmitButton fetcher={fetcher}>Edit</SubmitButton>
      </Form>
    </Main>
  );
};
