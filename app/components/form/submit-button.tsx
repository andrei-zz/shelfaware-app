import type { useFetcher } from "react-router";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/spinner";

export const SubmitButton = ({
  fetcher,
  containerProps,
  children,
  ...props
}: React.ComponentProps<typeof Button> & {
  fetcher: ReturnType<typeof useFetcher>;
  containerProps?: React.ComponentProps<"div">;
}) => {
  return (
    <div
      {...containerProps}
      className={cn(
        "flex flex-col w-full space-y-2",
        containerProps?.className
      )}
    >
      <Button
        disabled={fetcher.state === "submitting"}
        {...props}
        className={cn("w-fit", props.className)}
      >
        {children}{" "}
        {fetcher.state !== "idle" ? (
          <Spinner className="[&_svg]:fill-white dark:[&_svg]:fill-black" />
        ) : null}
      </Button>
    </div>
  );
};
