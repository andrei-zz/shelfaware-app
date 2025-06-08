import type { Route } from "./+types/root";

import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import "./app.css";
import { TooltipProvider } from "~/components/ui/tooltip";
import {
  SidebarProvider,
} from "~/components/ui/sidebar";
import { Main } from "./components/main";
import { Pre } from "./components/pre";
import { Code } from "./components/code";
import { themeSessionResolver } from "./sessions.server";
import {
  ThemeProvider,
  PreventFlashOnWrongTheme,
  useTheme,
  Theme,
} from "remix-themes";
import { cn } from "./lib/utils";

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
  const { getTheme } = await themeSessionResolver(request);
  return {
    theme: getTheme(),
  };
};

const AppLayout = ({
  ssrTheme,
  children,
}: {
  ssrTheme: Theme | null | undefined;
  children: React.ReactNode;
}) => {
  const [theme] = useTheme();

  return (
    <html
      lang="en"
      data-theme={theme ?? Theme.DARK}
      className={cn(
        "scrollbar-thumb-rounded-full scrollbar-thumb-neutral-700 scrollbar-track-neutral-200 scrollbar-hover:scrollbar-thumb-neutral-700/80 scrollbar-active:scrollbar-thumb-neutral-700/70",
        theme
      )}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(ssrTheme)} />
        <Links />
      </head>
      <body className="overflow-hidden antialiased bg-background dark:bg-background text-foreground min-h-dvh">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
};

const Providers = ({
  theme,
  children,
}: {
  theme: Theme | null | undefined;
  children: React.ReactNode;
}) => {
  return (
    <ThemeProvider
      specifiedTheme={theme ?? Theme.DARK}
      themeAction="/api/set-theme"
    >
      <TooltipProvider delayDuration={400} skipDelayDuration={300}>
        <SidebarProvider>{children}</SidebarProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
};

export default ({ loaderData }: Route.ComponentProps) => {
  return (
    <Providers theme={loaderData.theme}>
      <AppLayout ssrTheme={loaderData.theme}>
        <Outlet />
      </AppLayout>
    </Providers>
  );
};

export const HydrateFallback = ({}: Route.HydrateFallbackProps) => {
  return (
    <Providers theme={Theme.DARK}>
      <AppLayout ssrTheme={Theme.DARK}>
        <Main>
          <div className="text-9xl font-black">LOADING...</div>
        </Main>
      </AppLayout>
    </Providers>
  );
};

export const ErrorBoundary = ({
  loaderData,
  error,
}: Route.ErrorBoundaryProps) => {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404: Not Found" : "Error";
    details =
      error.status === 404
        ? "The server cannot find the requested resource."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <Providers theme={loaderData?.theme}>
      <AppLayout ssrTheme={loaderData?.theme}>
        <Main className="p-4 pb-16 flex flex-col gap-y-4">
          {message && <h4 className="mb-0">{message}</h4>}
          {details && <p className="mb-0">{details}</p>}
          {stack && (
            <Pre className="mt-0">
              <Code className="mb-2">{stack}</Code>
            </Pre>
          )}
        </Main>
      </AppLayout>
    </Providers>
  );
};
