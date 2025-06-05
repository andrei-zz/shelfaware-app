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

import "./app.css";
import { TooltipProvider } from "~/components/ui/tooltip";
import { AppSidebar } from "~/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { SidebarInsetHeader } from "~/components/sidebar/sidebar-inset-header";
import { Main } from "./components/main";
import { Pre } from "./components/pre";
import { Code } from "./components/code";
import { themeSessionResolver } from "./sessions.server";
import {
  ThemeProvider,
  PreventFlashOnWrongTheme,
  useTheme,
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

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const loaderData: Route.ComponentProps["loaderData"] = useLoaderData();
  const [theme] = useTheme();

  return (
    <html
      lang="en"
      data-theme={theme ?? ""}
      className={cn(
        "scrollbar-thumb-rounded-full scrollbar-thumb-neutral-700 scrollbar-track-neutral-200 scrollbar-hover:scrollbar-thumb-neutral-700/80 scrollbar-active:scrollbar-thumb-neutral-700/70",
        theme
      )}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(loaderData?.theme)} />
        <Links />
      </head>
      <body className="overflow-hidden antialiased bg-background text-foreground">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <SidebarInsetHeader />
            {children}
          </SidebarInset>
          <ScrollRestoration />
          <Scripts />
        </SidebarProvider>
      </body>
    </html>
  );
};

const Providers = ({ children }: { children: React.ReactNode }) => {
  const loaderData: Route.ComponentProps["loaderData"] = useLoaderData();

  return (
    <ThemeProvider
      specifiedTheme={loaderData?.theme}
      themeAction="/api/set-theme"
    >
      <TooltipProvider delayDuration={400} skipDelayDuration={300}>
        {children}
      </TooltipProvider>
    </ThemeProvider>
  );
};

const App = ({}: Route.ComponentProps) => {
  return (
    <Providers>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </Providers>
  );
};
export default App;

export const HydrateFallback = ({}: Route.HydrateFallbackProps) => {
  return (
    <Providers>
      <AppLayout>
        <Main>
          <div className="text-9xl font-black">LOADING...</div>
        </Main>
      </AppLayout>
    </Providers>
  );
};

export const ErrorBoundary = ({ error }: Route.ErrorBoundaryProps) => {
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
    <Providers>
      <AppLayout>
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
