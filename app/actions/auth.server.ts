import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { createCookieSessionStorage, redirect } from "react-router";
import argon2 from "argon2";

import type { Resolved } from "~/lib/types";
import type { users } from "~/database/schema";
import { getRawUserByEmail } from "./select.server";

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is required");
}
if (process.env.ARGON2_PEPPER == null) {
  throw new Error("ARGON2_PEPPER is required");
}

// Define your user type
type User = Resolved<Omit<typeof users.$inferSelect, "passwordHash">>;

export const hashPassword = async (
  password: Parameters<typeof argon2.hash>[0],
  options?: Parameters<typeof argon2.hash>[1]
): Promise<string> =>
  await argon2.hash(password, {
    type: argon2.argon2id,
    secret: Buffer.from(process.env.ARGON2_PEPPER!),
    ...options,
  });

// Create a session storage
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

// Create an instance of the authenticator, pass a generic with what
// strategies will return
export const authenticator = new Authenticator<User>();

// Your authentication logic (replace with your actual DB/API calls)
const login = async (email: string, password: string): Promise<User> => {
  // Verify credentials
  const rawUser = await getRawUserByEmail(email);
  const pass = await argon2.verify(rawUser.passwordHash, password, {
    secret: Buffer.from(process.env.ARGON2_PEPPER!),
  });

  // Return user data or throw an error
  if (!pass) {
    throw new Error("password failed");
  }

  const { passwordHash, ...user } = rawUser;
  return user;
};

export const authenticate = async (
  request: Request,
  returnTo?: string,
  redirectTo?: string
) => {
  let session = await sessionStorage.getSession(request.headers.get("cookie"));
  let user = session.get("user");
  if (user) return user;
  if (returnTo) session.set("returnTo", returnTo);
  throw redirect(redirectTo ?? "/login", {
    headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
  });
};

// Tell the Authenticator to use the form strategy
authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    // the type of this user must match the type you pass to the
    // Authenticator the strategy will automatically inherit the type if
    // you instantiate directly inside the `use` method
    return await login(email, password);
  }),
  // each strategy has a name and can be changed to use the same strategy
  // multiple times, especially useful for the OAuth2 strategy.
  "user-pass"
);
