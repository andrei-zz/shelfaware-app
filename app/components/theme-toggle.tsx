import { Theme, useTheme } from "remix-themes";
import { Monitor, Moon, Sun } from "lucide-react";

import { cn } from "~/lib/utils";
import { CtxMenu } from "./ctx-menu";
import { Button } from "./ui/button";

export const ThemeToggle = ({
  children,
  ctxMenuProps,
  ...props
}: React.ComponentProps<typeof Button> & {
  ctxMenuProps?: React.ComponentProps<typeof CtxMenu>;
}) => {
  const [theme, setTheme, metadata] = useTheme();

  const dropdownItemClassName =
    "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground";

  return (
    <CtxMenu
      asChild
      features={[
        "right-click",
        "long-press",
        "shift-enter",
        "tooltip",
        "checkbox",
      ]}
      onPress={() => setTheme(theme === Theme.DARK ? Theme.LIGHT : Theme.DARK)}
      dropdownItems={[
        {
          key: Theme.DARK,
          label: (
            <span className="flex gap-x-2">
              <Moon /> dark
            </span>
          ),
          onSelect: () => setTheme(Theme.DARK),
          props: {
            textValue: "dark",
            className: dropdownItemClassName,
          },
        },
        {
          key: Theme.LIGHT,
          label: (
            <span className="flex gap-x-2">
              <Sun /> light
            </span>
          ),
          onSelect: () => setTheme(Theme.LIGHT),
          props: {
            textValue: "light",
            className: dropdownItemClassName,
          },
        },
        {
          key: "system",
          label: (
            <span className="flex gap-x-2">
              <Monitor /> system
            </span>
          ),
          onSelect: () => setTheme(null),
          props: {
            textValue: "system",
            className: dropdownItemClassName,
          },
        },
      ]}
      dropdownMenuValue={
        metadata.definedBy === "SYSTEM"
          ? "system"
          : theme === Theme.LIGHT
          ? "light"
          : "dark"
      }
      tooltipContentProps={{ children: "Toggle theme" }}
      {...ctxMenuProps}
      dropdownMenuContentProps={{
        collisionPadding: 8,
        ...ctxMenuProps?.dropdownMenuContentProps,
      }}
    >
      <Button
        variant="outline"
        size="icon"
        {...props}
        className={cn(
          "min-w-9 h-9 pressed:bg-accent dark:pressed:bg-accent/40",
          props.className
        )}
      >
        {children ?? (
          <>
            <Sun className="h-[1.25rem] w-[1.25rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.25rem] w-[1.25rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </>
        )}
      </Button>
    </CtxMenu>
  );
};
