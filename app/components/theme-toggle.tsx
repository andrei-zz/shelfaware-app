import { Monitor, Moon, Sun } from "lucide-react";
import { Theme, useTheme } from "remix-themes";
import { CtxMenu } from "./ctx-menu";
import { Button } from "./ui/button";

export function ThemeToggle() {
  const [theme, setTheme, metadata] = useTheme();

  const dropdownItemClassName =
    "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground";

  return (
    <CtxMenu
      asChild
      features={["right-click", "long-press", "shift-enter", "tooltip"]}
      onPress={() => setTheme(theme === Theme.DARK ? Theme.LIGHT : Theme.DARK)}
      tooltipContentProps={{ children: "Toggle theme" }}
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
      dropdownMenuContentProps={{
        collisionPadding: 8,
      }}
      dropdownMenuValue={
        metadata.definedBy === "SYSTEM"
          ? "system"
          : theme === Theme.LIGHT
          ? "light"
          : "dark"
      }
    >
      <Button
        variant="outline"
        size="icon"
        className="min-w-9 h-9 pressed:bg-accent dark:pressed:bg-accent/40"
      >
        <Sun className="h-[1.25rem] w-[1.25rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.25rem] w-[1.25rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>
    </CtxMenu>
  );
}
