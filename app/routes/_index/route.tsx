import type { Route } from "./+types/route";
import { Link } from "react-router";
import { DateTime } from "luxon";
import { Plus } from "lucide-react";
import { getCurrentItems } from "~/actions/select.server";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils.client";

export const meta = ({}: Route.MetaArgs) => {
  return [
    { title: "ShelfAware" },
    { name: "description", content: "ShelfAware" },
  ];
};

// export function headers(_: Route.HeadersArgs) {
//   return {
//     "Cache-Control": "s-maxage=1, stale-while-revalidate=59",
//   };
// }

export const loader = async ({}: Route.LoaderArgs) => {
  const items = await getCurrentItems();
  return { items };

  // const fakeCurrentItems = [
  //   {
  //     id: 1,
  //     name: "Milk",
  //     description: "2% Reduced Fat Milk",
  //     imageBase64: null,
  //     expirationDate: new Date("2025-05-01T00:00:00Z"),
  //     originalWeight: 1000,
  //     currentWeight: 850,
  //     itemTypeId: 3, // Let's say 3 = Dairy > Milk
  //     isPresent: true,
  //     createdAt: new Date("2025-04-26T12:00:00Z"),
  //     updatedAt: new Date("2025-04-27T09:00:00Z"),
  //     deletedAt: null,
  //   },
  //   {
  //     id: 2,
  //     name: "Orange Juice",
  //     description: "Freshly squeezed",
  //     imageBase64: null,
  //     expirationDate: new Date("2025-04-30T00:00:00Z"),
  //     originalWeight: 1200,
  //     currentWeight: 1100,
  //     itemTypeId: 4, // 4 = Drinks > Juice
  //     isPresent: true,
  //     createdAt: new Date("2025-04-26T14:00:00Z"),
  //     updatedAt: new Date("2025-04-27T08:00:00Z"),
  //     deletedAt: null,
  //   },
  //   {
  //     id: 3,
  //     name: "Eggs",
  //     description: "12 Large Cage-Free Eggs",
  //     imageBase64: null,
  //     expirationDate: new Date("2025-05-10T00:00:00Z"),
  //     originalWeight: 700,
  //     currentWeight: 700,
  //     itemTypeId: 3, // Same Dairy > Eggs
  //     isPresent: true,
  //     createdAt: new Date("2025-04-26T13:00:00Z"),
  //     updatedAt: new Date("2025-04-26T13:00:00Z"),
  //     deletedAt: null,
  //   },
  // ];
  // return {
  //   items: [
  //     ...fakeCurrentItems,
  //     ...fakeCurrentItems,
  //     ...fakeCurrentItems,
  //     ...fakeCurrentItems,
  //   ],
  // };
};

const Home = ({ loaderData }: Route.ComponentProps) => {
  const { items } = loaderData;
  return (
    <main className="p-4 flex flex-col space-y-4 prose prose-lg">
      <div className="flex items-center justify-between">
        <h2 className="mt-0 mb-0">Your Fridge</h2>
        <Link
          to="/create-item"
          className={cn(
            buttonVariants({
              variant: "default",
              size: "default",
            }),
            "no-underline"
          )}
        >
          <Plus /> Create item
        </Link>
      </div>
      <div className="flex flex-col space-y-2">
        {items.map((item) => (
          <div className="bg-accent text-foreground p-2 flex items-center space-x-2">
            <div className="w-20 h-20">
              {item.imageBase64 ? (
                <img
                  className="max-w-full contain-layout"
                  src={item.imageBase64}
                />
              ) : (
                <div className="h-full w-full bg-blue-500" />
              )}
            </div>
            <div className="flex flex-col shrink-0">
              <span>{item.name}</span>
              <span className="text-sm font-light">{item.description}</span>
              {!item.itemTypeId ? null : (
                <span className="text-sm font-light">
                  Type: {item.itemTypeId}
                </span>
              )}
              <span className="text-sm font-light">
                Expiration date:{" "}
                {item.expireAt != null
                  ? DateTime.fromMillis(item.expireAt).toLocaleString()
                  : null}
              </span>
              <span className="text-sm font-light">
                Weight: {item.currentWeight} g
              </span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};
export default Home;
