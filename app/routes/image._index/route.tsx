import type {Route} from "./+types/route"

export const meta = ({}: Route.MetaArgs) => {
  return [
    { title: "Create Image - ShelfAware" },
    // { name: "description", content: "ShelfAware" },
  ];
};

const CreateImage = ({loaderData}: Route.ComponentProps) => {

}