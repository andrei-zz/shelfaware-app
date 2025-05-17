import type { Route } from "./+types/route";

import { redirect } from "react-router";
import {
  createItemEvent,
  createItemEventSchema,
} from "~/actions/insert.server";
import { getRawItems } from "~/actions/select.server";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ItemEventType } from "~/components/item-event-type";
import { Button } from "~/components/ui/button";
import { Main } from "~/components/main";
import { Form } from "~/components/form";

export const meta = ({}: Route.MetaArgs) => {
  return [
    { title: "Create Item Event - ShelfAware" },
    // { name: "description", content: "ShelfAware" },
  ];
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const items = await getRawItems();
  return { items };
};

export const action = async ({ request }: Route.ActionArgs) => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const formData = await request.formData();

  const itemEventFormData: Record<string, FormDataEntryValue | null> = {};
  itemEventFormData.itemId = formData.get("itemId");
  itemEventFormData.eventType = formData.get("eventType");
  itemEventFormData.weight = formData.get("weight");

  const itemEventData: Record<string, unknown> = {
    ...itemEventFormData,
    itemId:
      itemEventFormData.itemId != null && itemEventFormData.itemId !== ""
        ? Number(itemEventFormData.itemId)
        : null,
    weight:
      itemEventFormData.weight != null && itemEventFormData.weight !== ""
        ? Number(itemEventFormData.weight)
        : null,
  };

  // console.log("itemData", itemData);

  const parsed = createItemEventSchema.parse(itemEventData);
  const newItem = await createItemEvent(parsed);

  return redirect("/");
};

const ItemEvent = ({ loaderData }: Route.ComponentProps) => {
  return (
    <Main>
      <Form
        fetcherKey="create-item-event"
        method="POST"
        encType="multipart/form-data"
      >
        <div className="flex items-center justify-between">
          <h2 className="mt-0 mb-0">Create Item Event</h2>
        </div>
        <div className="flex flex-col w-full space-y-2">
          <Label id="itemId-label">Item</Label>
          <Select name="itemId" required>
            <SelectTrigger aria-labelledby="itemId-label" className="w-full">
              <SelectValue placeholder="Select item" />
            </SelectTrigger>
            <SelectContent>
              {loaderData.items.map((item) => (
                <SelectItem key={item.id} value={item.id.toString()}>
                  {item.id}: {item.name} (
                  {item.currentWeight == null
                    ? "no weight"
                    : `${item.currentWeight} g`}
                  )
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col w-full space-y-2">
          <Label>Event type</Label>
          <RadioGroup
            name="eventType"
            required
            className="flex flex-col w-full items-center gap-2"
          >
            {(["in", "out", "moved"] as const).map((type) => (
              <div
                key={`eventType-${type}`}
                className="flex w-full items-center space-x-2"
              >
                <RadioGroupItem id={`eventType-${type}`} value={type} />
                <Label htmlFor={`eventType-${type}`}>
                  <ItemEventType type={type} />
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <div className="flex flex-col w-full space-y-2">
          <Label htmlFor="weight">Current item weight (in grams)</Label>
          <Input type="number" id="weight" name="weight" className="w-full" />
        </div>
        <div className="flex flex-col w-full space-y-2">
          <Button className="w-fit">Create</Button>
        </div>
      </Form>
    </Main>
  );
};
export default ItemEvent;
