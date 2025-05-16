import { useMatches } from "react-router";
import { Fragment } from "react/jsx-runtime";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";

export const RouteBreadcrumb = () => {
  const matches = useMatches();

  const crumbs = matches.flatMap((match, matchIdx, matchArr) => {
    const segments = match.pathname.split("/").filter(Boolean);
    return segments.map((segment, segIdx) => {
      const path = "/" + segments.slice(0, segIdx + 1).join("/");
      const isLast =
        matchIdx === matchArr.length - 1 && segIdx === segments.length - 1;

      return {
        label: segment,
        path,
        isLast,
      };
    });
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, idx) => (
          <Fragment key={idx}>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <BreadcrumbItem>
              {crumb.isLast ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={crumb.path}>{crumb.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
