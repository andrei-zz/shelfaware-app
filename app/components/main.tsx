import { cn } from "~/lib/utils";
import { useSidebar } from "./ui/sidebar";

export const Main = ({ className, ...props }: React.ComponentProps<"main">) => {
  const { isMobile, state } = useSidebar();

  return (
    <main
      className={cn(
        "min-w-full max-h-[calc(100dvh-3rem)] p-0 prose prose-lg dark:prose-invert",
        !isMobile && state === "expanded"
          ? "max-h-[calc(100dvh-4rem)]"
          : "max-h-[calc(100dvh-3rem)]",
        className
      )}
      {...props}
    />
  );
};
