import { getCurrentItems } from "~/actions/read.server";
import type { Route } from "./+types/route";

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
  // return { items: fakeCurrentItems };
};

const Home = ({ loaderData }: Route.ComponentProps) => {
  return (
    <main>
      <h2>Your Fridge</h2>
      <div className="flex flex-col items-center space-y-2">
        {loaderData.items.map((item) => (
          <pre className="bg-accent">{JSON.stringify(item, null, 2)}</pre>
        ))}
      </div>
    </main>
  );
};
export default Home;
