import { Form as ReactRouterForm, useFetcher } from "react-router";

import { cn } from "~/lib/utils";

export const Form = ({
  fetcher,
  ...props
}: React.ComponentProps<typeof ReactRouterForm> & {
  fetcher?: ReturnType<typeof useFetcher>;
}) => {
  const Form = fetcher?.Form ?? ReactRouterForm;
  return (
    <Form
      {...props}
      className={cn(
        "h-full w-full p-4 pb-16 relative flex flex-col gap-y-4 overflow-y-scroll scrollbar",
        props.className
      )}
    />
  );
};
