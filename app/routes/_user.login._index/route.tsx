import type { Route } from "./+types/route";

import { data, redirect, useFetcher } from "react-router";
import { authenticator, sessionStorage } from "~/actions/auth.server";
import { Main } from "~/components/main";
import { AuthForm } from "~/components/auth-form";
import { FieldError } from "~/components/form/field-error";

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
  try {
    // we call the method with the name of the strategy we want to use and the
    // request object
    const user = await authenticator.authenticate("user-pass", request);

    const session = await sessionStorage.getSession(
      request.headers.get("cookie")
    );

    session.set("user", user);
    const returnTo = session.get("returnTo") ?? "/";
    session.unset("returnTo");

    // Redirect to the home page after successful login
    return redirect(returnTo, {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session),
      },
    });
  } catch (error) {
    // Return validation errors or authentication errors
    if (error instanceof Error) {
      return data({ error: error.message });
    }

    // Re-throw any other errors (including redirects)
    throw error;
  }
};

// First we create our UI with the form doing a POST and the inputs with
// the names we are going to use in the strategy
export default ({ actionData }: Route.ComponentProps) => {
  const fetcher = useFetcher({ key: "login" });

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
        {actionData?.error ? <FieldError>{actionData.error}</FieldError> : null}
        <AuthForm type="login" fetcher={fetcher} />
      </div>
    </Main>
  );
};
