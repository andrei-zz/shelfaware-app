import type { Route } from "./+types/route";

import { data, redirect, useFetcher } from "react-router";
import { z } from "zod/v4";

import { hashPassword, sessionStorage } from "~/actions/auth.server";
import { coerceFormData, parseWithDummy } from "~/actions/zod-utils";
import { createUser, createUserSchema } from "~/actions/insert.server";
import { uploadImage } from "~/actions/image.server";

import { Main } from "~/components/main";
import { AuthForm } from "~/components/auth-form";
import { FieldError } from "~/components/form/field-error";

const PATHNAME = "/register";

// Finally, we need to export a loader function to check if the user is already
// authenticated and redirect them to the dashboard
export const loader = async ({ request }: Route.LoaderArgs) => {
  const session = await sessionStorage.getSession(
    request.headers.get("cookie")
  );
  const user = session.get("user");

  // If the user is already authenticated redirect to the dashboard
  if (user) {
    return redirect("/");
  }

  // Otherwise return null to render the login page
  return data(null);
};

// Second, we need to export an action function, here we will use the
// `authenticator.authenticate` method
export const action = async ({ request }: Route.ActionArgs) => {
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
  let password: string | null = null;
  let avatarImageFile: File | null = null;
  try {
    const reqFormData = await request.formData();
    const {
      password: formPassword,
      avatarImage,
      ...formData
    } = Object.fromEntries(reqFormData);

    const dummy: Record<string, unknown> = {};

    if (typeof formPassword === "string") {
      password = formPassword;
      dummy.passwordHash = crypto.randomUUID();
    }
    if (avatarImage instanceof File) {
      avatarImageFile = avatarImage;
      dummy.avatarImageId = 0;
    }

    const coercedFormData = coerceFormData(createUserSchema, formData);
    payload = parseWithDummy(createUserSchema, coercedFormData, dummy);
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

  if (!password) {
    return new Response("Password is required", { status: 400 });
  }

  const avatarImage = await uploadImage(avatarImageFile, { type: "avatar" });
  payload.avatarImageId = avatarImage?.id;
  if (avatarImageFile != null && !payload.avatarImageId) {
    return new Response("Invalid image file", { status: 400 });
  }

  try {
    const passwordHash = await hashPassword(password);

    const parsed = createUserSchema.parse({
      ...payload,
      passwordHash,
    });
    const newUser = await createUser(parsed);

    const session = await sessionStorage.getSession(
      request.headers.get("cookie")
    );

    session.set("user", newUser);
    const returnTo = session.get("returnTo") ?? "/";
    session.unset("returnTo");

    return redirect(returnTo, {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session),
      },
    });

    // return Response.json(newUser, {
    //   status: 201,
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // });
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

// First we create our UI with the form doing a POST and the inputs with
// the names we are going to use in the strategy
export default ({ actionData }: Route.ComponentProps) => {
  const fetcher = useFetcher({ key: "register" });

  return (
    <Main className="h-dvh max-h-dvh flex flex-col items-center justify-center">
      <div className="flex h-full w-full max-w-sm flex-col gap-6 justify-center">
        <a
          href="#"
          className="flex items-center gap-2 self-center font-medium no-underline"
        >
          <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
            SA
          </div>
          <span className="underline">ShelfAware</span>
        </a>
        {actionData ? <FieldError>{actionData}</FieldError> : null}
        <AuthForm type="register" fetcher={fetcher} />
      </div>
    </Main>
  );
};
