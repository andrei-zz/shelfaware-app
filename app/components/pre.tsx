import type { JSX } from "react";

import { cn } from "~/lib/utils";

export const Pre: React.FC<React.HTMLProps<HTMLPreElement>> = ({
  className,
  children,
  ...props
}: React.HTMLProps<HTMLPreElement>): JSX.Element => (
  <pre
    className={cn("!bg-transparent rounded-lg border border-border", className)}
    {...props}
  >
    {children}
  </pre>
);
