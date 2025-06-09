// import type { Route } from "./+types/route";

import { redirect } from "react-router";

// import { eq } from "drizzle-orm";

// import { items as itemsTable } from "~/database/schema";
// import { getItems } from "~/actions/select.server";

// import { Main } from "~/components/main";

// export const loader = async ({}: Route.LoaderArgs) => {
//   const items = await getItems([eq(itemsTable.isPresent, true)]);
//   return { items };
// };

// export default ({ loaderData }: Route.ComponentProps) => {
//   return (
//     <Main className="h-full w-full p-4 pb-16 relative flex flex-col gap-y-4 overflow-y-scroll scrollbar">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center space-x-4">
//           <h2 className="mt-0 mb-0">Your Fridge</h2>
//         </div>
//       </div>
//       <div className="h-full flex justify-between">
//         <div className="bg-white w-24">Yes</div>
//         <div className="w-full h-full grid grid-cols-2 grow"></div>
//         <div className="bg-white w-24">No</div>
//       </div>
//     </Main>
//   );
// };

export const loader = async () => redirect("/item");
