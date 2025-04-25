import { createThemeSessionResolver } from "remix-themes";
import { createCookieSessionStorage } from "react-router";

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__remix-themes",
    domain: process.env.NODE_ENV === "production" ? process.env.DOMAIN : undefined,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET ?? ""],
    secure: process.env.NODE_ENV === "production",
  },
});

export const themeSessionResolver = createThemeSessionResolver(sessionStorage);
