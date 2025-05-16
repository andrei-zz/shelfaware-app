import { NavLink, useLocation } from "react-router";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";

export const SidebarLink = ({
  children,
  navLinkProps,
  ...props
}: React.ComponentProps<typeof Button> & {
  navLinkProps: React.ComponentProps<typeof NavLink>;
}) => {
  const location = useLocation();

  return (
    <Button
      asChild
      variant="ghost"
      {...props}
      className={cn("justify-start font-normal", props.className)}
    >
      <NavLink {...navLinkProps}>{children}</NavLink>
    </Button>
  );
};
