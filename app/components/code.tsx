import type { JSX } from "react";

import { cn } from "~/lib/utils";

export const Code: React.FC<React.HTMLProps<HTMLElement>> = ({
  className,
  children,
  ...props
}: React.HTMLProps<HTMLElement>): JSX.Element => (
  <code
    className={cn(
      "font-mono whitespace-pre-wrap break-normal tracking-normal hyphens-none before:content-none after:content-none",
      "group-hover/anchor:text-foreground group-hover/anchor:decoration-anchor group-active/anchor:decoration-anchor/80",

      "[pre>&]:inline-block [pre>&]:bg-transparent [pre>&]:border-none [pre>&]:text-sm [pre>&]:font-medium [pre>&]:text-foreground [pre>&]:dark:text-foreground [pre>&]:leading-5",
      "[:not(pre)>&]:box-border [:not(pre)>&]:inline [:not(pre)>&]:rounded [:not(pre)>&]:bg-accent/50 [:not(pre)>&]:p-0.5 [:not(pre)>&]:border [:not(pre)>&]:border-border",
      "[p_&]:text-sm [p_&]:font-normal [p_&]:leading-4",
      "[em>&]:pl-[0.05rem] [em>&]:pr-[0.2rem]",
      "[em>strong>&]:pl-[0.05rem] [em>strong>&]:pr-[0.2rem]",
      "[em>span>&]:pl-[0.05rem] [em>span>&]:pr-[0.2rem]",
      "[strong_&]:font-black",
      "[blockquote_&]:pl-[0.0625rem] [blockquote_&]:pr-[0.1875rem]",
      "[h1_&]:text-2xl [h1_&]:lg:text-3xl [h1_&]:pt-0 [h1_&]:pb-[0.0625rem]",
      "[h2_&]:pt-[0.025rem] [h2_&]:pb-[0.1rem]",
      "[a>&]:underline [a>&]:decoration-foreground",
      "[a>&]:[&>span]:underline [a>&]:[&>span]:decoration-foreground",

      "dark:[&_span]:!text-[var(--shiki-dark)]",

      className
    )}
    {...props}
  >
    {children}
  </code>
);
