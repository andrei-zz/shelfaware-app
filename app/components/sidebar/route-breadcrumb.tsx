import { House, Slash } from "lucide-react";
import { Link, useLocation } from "react-router";
import { Fragment } from "react/jsx-runtime";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export const RouteBreadcrumb = () => {
  const location = useLocation();

  const pathnames = location.pathname.split("/").filter(Boolean);

  return (
    <Breadcrumb>
      <BreadcrumbList className="gap-2.5 sm:gap-2.5">
        <BreadcrumbLink asChild>
          <Button asChild variant="link" className="px-0! py-0 hover:[&_svg]:opacity-100">
            <Link to="/">
              <House
                className={cn(
                  location.pathname === "/"
                    ? "opacity-90"
                    : "opacity-60"
                )}
              />
            </Link>
          </Button>
        </BreadcrumbLink>
        <BreadcrumbSeparator>
          <Slash />
        </BreadcrumbSeparator>
        {pathnames.map((segment, idx) => {
          const path = "/" + pathnames.slice(0, idx + 1).join("/");
          const isLast = idx === pathnames.length - 1;

          return (
            <Fragment key={idx}>
              {idx === 0 ? null : (
                <BreadcrumbSeparator>
                  <Slash />
                </BreadcrumbSeparator>
              )}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{segment}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={path}>{segment}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
