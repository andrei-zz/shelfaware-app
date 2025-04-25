import type { Route } from "./+types/root";

import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";
import {
  ThemeProvider,
  useTheme,
  PreventFlashOnWrongTheme,
  Theme,
} from "remix-themes";

import "./app.css";
import { themeSessionResolver } from "./sessions.server";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export const loader = async ({ request }: Route.LoaderArgs) => {
  // Return the theme from the session storage using the loader
  const { getTheme } = await themeSessionResolver(request);
  return {
    theme: getTheme(),
  };
};

const AppLayout = ({
  loaderTheme,
  theme,
  children,
}: {
  loaderTheme?: Route.ComponentProps["loaderData"]["theme"];
  theme?: Theme | null;
  children: React.ReactNode;
}) => (
  <html lang="en" data-theme={theme ?? "dark"}>
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <Meta />
      {loaderTheme !== undefined && theme !== undefined ? (
        <PreventFlashOnWrongTheme ssrTheme={Boolean(loaderTheme)} />
      ) : null}
      <Links />
    </head>
    <body>
      {children}
      <ScrollRestoration />
      <Scripts />
    </body>
  </html>
);

const App = () => {
  // Use the theme in your app.
  // If the theme is missing in session storage, PreventFlashOnWrongTheme will get
  // the browser theme before hydration and will prevent a flash in browser.
  // The client code runs conditionally, it won't be rendered if we have a theme in session storage.
  const loaderData = useLoaderData<typeof loader>();
  const [theme] = useTheme();

  return (
    <AppLayout loaderTheme={loaderData.theme} theme={theme}>
      <Outlet />
    </AppLayout>
  );
};

const AppWithProviders = ({ loaderData }: Route.ComponentProps) => {
  return (
    // Wrap your app with ThemeProvider.
    // `specifiedTheme` is the stored theme in the session storage.
    // `themeAction` is the action name that's used to change the theme in the session storage.
    <ThemeProvider
      specifiedTheme={loaderData.theme}
      themeAction="/action/set-theme"
    >
      <App />
    </ThemeProvider>
  );
};
export default AppWithProviders;

export const ErrorBoundary = ({ error }: Route.ErrorBoundaryProps) => {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <AppLayout>
      <main className="pt-16 p-4 container mx-auto">
        <h1>{message}</h1>
        <p>{details}</p>
        {stack && (
          <pre className="w-full p-4 overflow-x-auto">
            <code>{stack}</code>
          </pre>
        )}
      </main>
    </AppLayout>
  );
};
