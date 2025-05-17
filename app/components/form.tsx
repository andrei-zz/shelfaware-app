import { Form as ReactRouterForm } from "react-router";
import { cn } from "~/lib/utils";

export const Form = ({
  ...props
}: React.ComponentProps<typeof ReactRouterForm>) => {
  return (
    <ReactRouterForm
      {...props}
      className={cn(
        "h-full w-full p-4 pb-16 relative flex flex-col gap-y-4 overflow-y-scroll scrollbar",
        props.className
      )}
    />
  );
};
