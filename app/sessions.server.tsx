import { createThemeSessionResolver } from "remix-themes";
import { createCookieSessionStorage } from "react-router";

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__remix-themes",
    domain:
      process.env.NODE_ENV === "production" ? process.env.DOMAIN : "localhost",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET ?? "s3cr3t"],
    secure: process.env.NODE_ENV === "production",
  },
});

export const themeSessionResolver = createThemeSessionResolver(sessionStorage);
