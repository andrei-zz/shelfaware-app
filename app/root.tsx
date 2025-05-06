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
import { TooltipProvider } from "./components/ui/tooltip";

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

// export const loader = async ({ request }: Route.LoaderArgs) => {
//   return {};
// };

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en" className="scrollbar-thumb-rounded-full scrollbar-thumb-neutral-700 scrollbar-track-neutral-200 scrollbar-hover:scrollbar-thumb-neutral-700/80 scrollbar-active:scrollbar-thumb-neutral-700/70">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <Meta />
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
  // const loaderData = useLoaderData<typeof loader>();

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
};

const AppWithProviders = ({}: Route.ComponentProps) => {
  return (
    <TooltipProvider delayDuration={400} skipDelayDuration={300}>
      <App />
    </TooltipProvider>
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
