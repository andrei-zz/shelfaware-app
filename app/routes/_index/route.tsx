import type { Route } from "./+types/route";

import { Welcome } from "~/welcome/welcome";

export const meta = ({}: Route.MetaArgs) => {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
};

// export function headers(_: Route.HeadersArgs) {
//   return {
//     "Cache-Control": "s-maxage=1, stale-while-revalidate=59",
//   };
// }

export const loader = ({ context }: Route.LoaderArgs) => {
  return { message: context.VALUE_FROM_EXPRESS };
};

const Home = ({ loaderData }: Route.ComponentProps) => {
  return <Welcome message={loaderData.message} />;
};
export default Home;
