import { Link, useLocation, useMatches, useNavigate } from "react-router";
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

export const RouteBreadcrumb = () => {
  const location = useLocation();

  const pathnames = location.pathname.split("/").filter(Boolean);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbSeparator>
          <Button asChild variant="link" className="px-0">
            <Link to="/">/</Link>
          </Button>
        </BreadcrumbSeparator>
        {pathnames.map((segment, idx) => {
          const path = "/" + pathnames.slice(0, idx + 1).join("/");
          const isLast = idx === pathnames.length - 1;

          return (
            <Fragment key={idx}>
              {idx === 0 ? null : <BreadcrumbSeparator>/</BreadcrumbSeparator>}
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
