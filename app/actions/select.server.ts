import {
  type SQLWrapper,
  and,
  asc,
  desc,
  eq,
  gte,
  inArray,
  lt,
  lte,
  SQL,
} from "drizzle-orm";

import { db } from "~/database/db.server";
import { items, itemTypes, itemEvents, tags, images } from "~/database/schema";
import type { DrizzleTx } from "./drizzle-utils";

// items

// Get (almost) full item data by item id
export const getItem = async (itemId: number) =>
  await db.query.items.findFirst({
    where: eq(items.id, itemId),
    with: {
      type: true,
      tag: true,
      image: {
        columns: {
          s3Key: false,
        },
      },
    },
  });

// Get (almost) full item data from tag id
export const getItemByTagId = async (tagId: number) => {
  const tag = await db.query.tags.findFirst({
    where: eq(tags.id, tagId),
    with: {
      item: {
        with: {
          type: true,
          tag: true,
          image: {
            columns: {
              s3Key: false,
            },
          },
        },
      },
    },
  });
  return tag?.item;
};

// Get (almost) full item data from tag UID
export const getItemByUid = async (tagUid: string) => {
  const tag = await db.query.tags.findFirst({
    where: eq(tags.uid, tagUid),
    with: {
      item: {
        with: {
          type: true,
          tag: true,
          image: {
            columns: {
              s3Key: false,
            },
          },
        },
      },
    },
  });
  return tag?.item;
};

export const getItemWithEvents = async (
  itemId: number,
  orderEventsBy: SQL = desc(itemEvents.timestamp)
) =>
  await db.query.items.findFirst({
    where: eq(items.id, itemId),
    with: {
      type: true,
      tag: true,
      image: {
        columns: {
          s3Key: false,
        },
      },
      events: { orderBy: orderEventsBy },
    },
  });

export const getItems = async (
  conditions?: SQLWrapper[],
  orderBy: SQL = desc(items.updatedAt)
) =>
  await db.query.items.findMany({
    where:
      conditions != null && conditions.length > 0
        ? and(...conditions)
        : undefined,
    with: {
      type: true,
      tag: true,
      image: {
        columns: {
          s3Key: false,
        },
      },
    },
    orderBy,
  });

export const getRawItems = async (
  conditions?: SQLWrapper[],
  orderBy: SQL = desc(items.updatedAt)
) =>
  await db.query.items.findMany({
    where:
      conditions != null && conditions.length > 0
        ? and(...conditions)
        : undefined,
    orderBy,
  });

// List of currently present items, sorted by updatedAt (ascending)
export const getPresentItems = async () =>
  await getItems([eq(items.isPresent, true)], desc(items.updatedAt));

// List of items at a specific time
// Quite expensive to run
export const getPresentItemsAtTime = async (timestamp: number) => {
  // Get all item events up to targetTime
  const events = await db
    .select()
    .from(itemEvents)
    .where(lt(itemEvents.timestamp, timestamp))
    .orderBy(asc(itemEvents.timestamp));

  // Build item presence map
  const itemPresence = new Map<
    number,
    { isPresent: boolean; weight: number | null }
  >();

  for (const event of events) {
    if (event.eventType === "in" || event.eventType === "moved") {
      itemPresence.set(event.itemId, { isPresent: true, weight: event.weight });
    }
    if (event.eventType === "out") {
      itemPresence.set(event.itemId, {
        isPresent: false,
        weight: event.weight,
      });
    }
  }

  // Return items that were present
  const presentItemIds = Array.from(itemPresence.entries())
    .filter(([, data]) => data.isPresent)
    .map(([itemId]) => itemId);

  const itemsAtTime = await getItems(
    [inArray(items.id, presentItemIds)],
    desc(items.updatedAt)
  );

  return itemsAtTime;
};

// itemTypes

export const getItemType = async (itemTypeId: number) =>
  await db
    .select()
    .from(itemTypes)
    .where(eq(itemTypes.id, itemTypeId))
    .then((value) => value[0]);

export const getItemTypeByName = async (itemTypeName: string) =>
  await db
    .select()
    .from(itemTypes)
    .where(eq(itemTypes.name, itemTypeName))
    .then((value) => value[0]);

export const getItemTypeWithItems = async (
  itemTypeId: number,
  orderItemsBy: SQL = desc(items.updatedAt)
) =>
  await db.query.itemTypes.findFirst({
    where: eq(itemTypes.id, itemTypeId),
    with: {
      items: {
        with: {
          type: true,
          tag: true,
          image: {
            columns: {
              s3Key: false,
            },
          },
        },
        orderBy: orderItemsBy,
      },
    },
  });

export const getItemTypes = async (
  conditions?: SQLWrapper[],
  orderBy: SQL = asc(itemTypes.name)
) =>
  await db.query.itemTypes.findMany({
    where:
      conditions?.length != null && conditions.length > 0
        ? and(...conditions)
        : undefined,
    orderBy,
  });

// itemEvents

export const getItemEvent = async (itemEventId: number) =>
  await db.query.itemEvents.findFirst({
    where: eq(itemEvents.id, itemEventId),
    with: {
      image: {
        columns: {
          s3Key: false,
        },
      },
      item: {
        with: {
          type: true,
          tag: true,
          image: {
            columns: {
              s3Key: false,
            },
          },
        },
      },
    },
  });

// Get all item events, optionally between start and end
export const getItemEvents = async (
  start?: number,
  end?: number,
  conditions?: SQLWrapper[],
  orderBy: SQL = desc(itemEvents.timestamp)
) => {
  const allConditions: SQLWrapper[] = [];
  if (conditions != null) {
    allConditions.push(...conditions);
  }
  if (start != null) {
    allConditions.push(gte(itemEvents.timestamp, start));
  }
  if (end != null) {
    allConditions.push(lte(itemEvents.timestamp, end));
  }

  return await db.query.itemEvents.findMany({
    where: allConditions.length > 0 ? and(...allConditions) : undefined,
    with: {
      image: {
        columns: {
          s3Key: false,
        },
      },
      item: {
        with: {
          type: true,
          tag: true,
          image: {
            columns: {
              s3Key: false,
            },
          },
        },
      },
    },
    orderBy,
  });
};

// Get all events for a specific item
export const getItemEventsOf = async (itemId: number) =>
  await db.query.itemEvents.findMany({
    where: eq(itemEvents.itemId, itemId),
    with: {
      image: {
        columns: {
          s3Key: false,
        },
      },
      item: {
        with: {
          type: true,
          tag: true,
          image: {
            columns: {
              s3Key: false,
            },
          },
        },
      },
    },
    orderBy: desc(itemEvents.timestamp),
  });

// tags

export const getTag = async (tagId: number) =>
  await db.query.tags.findFirst({
    where: eq(tags.id, tagId),
    with: {
      item: {
        with: {
          type: true,
          tag: true,
          image: {
            columns: {
              s3Key: false,
            },
          },
        },
      },
    },
  });

export const getTagByItemId = async (itemId: number) =>
  await db.query.tags.findFirst({
    where: eq(tags.itemId, itemId),
    with: {
      item: {
        with: {
          type: true,
          image: {
            columns: {
              s3Key: false,
            },
          },
        },
      },
    },
  });

export const getTagByUid = async (uid: string) =>
  await db.query.tags.findFirst({
    where: eq(tags.uid, uid),
    with: {
      item: {
        with: {
          type: true,
          image: {
            columns: {
              s3Key: false,
            },
          },
        },
      },
    },
  });

export const getTags = async (
  conditions?: SQLWrapper[],
  orderBy: SQL = desc(tags.attachedAt),
  columns?: { [K in keyof typeof tags.$inferSelect]?: boolean },
  tx?: typeof db | DrizzleTx
) =>
  await (tx ?? db).query.tags.findMany({
    columns: columns ?? undefined,
    where:
      conditions != null && conditions.length > 0
        ? and(...conditions)
        : undefined,
    with: {
      item: {
        with: {
          type: true,
          image: {
            columns: {
              s3Key: false,
            },
          },
        },
      },
    },
    orderBy,
  });

// export const getRawTags = async (
//   conditions?: SQLWrapper[],
//   orderBy: SQL = desc(tags.attachedAt)
// ) =>
//   await db.query.tags.findMany({
//     where:
//       conditions != null && conditions.length > 0
//         ? and(...conditions)
//         : undefined,
//     orderBy,
//   });

export const getTagsWithRawItems = async (
  conditions?: SQLWrapper[],
  orderBy: SQL = desc(tags.attachedAt)
) =>
  await db.query.tags.findMany({
    where:
      conditions != null && conditions.length > 0
        ? and(...conditions)
        : undefined,
    with: {
      item: true,
    },
    orderBy,
  });

// images

export const getImage = async (imageId: number) =>
  await db.query.images.findFirst({
    where: eq(images.id, imageId),
    columns: {
      s3Key: false,
    },
  });

// export const getImageByItemId = async (itemId: number) => {
//   const itemWithImage = await db.query.items.findFirst({
//     where: eq(items.id, itemId),
//     with: {
//       image: {
//         columns: {
//           s3Key: false,
//         },
//       },
//     },
//   });
//   return itemWithImage?.image ?? null;
// };

// export const getImageByTagId = async (tagId: number) => {
//   const tagWithItem = await db.query.tags.findFirst({
//     where: eq(tags.id, tagId),
//     with: {
//       item: {
//         with: {
//           image: {
//             columns: {
//               s3Key: false,
//             },
//           },
//         },
//       },
//     },
//   });
//   return tagWithItem?.item?.image ?? null;
// };

// export const getImageByUid = async (tagUid: string) => {
//   const tagWithItem = await db.query.tags.findFirst({
//     where: eq(tags.uid, tagUid),
//     with: {
//       item: {
//         with: {
//           image: {
//             columns: {
//               s3Key: false,
//             },
//           },
//         },
//       },
//     },
//   });
//   return tagWithItem?.item?.image ?? null;
// };

export const getImages = async (
  conditions?: SQLWrapper[],
  orderBy: SQL = desc(images.createdAt)
) =>
  await db.query.images.findMany({
    columns: {
      s3Key: false,
    },
    where:
      conditions != null && conditions.length > 0
        ? and(...conditions)
        : undefined,
    orderBy,
  });

export const getImageWithS3Key = async (imageId: number) => {
  const imagesData = await db
    .select()
    .from(images)
    .where(eq(images.id, imageId));

  if (
    typeof imagesData === "object" &&
    Array.isArray(imagesData) &&
    imagesData.length === 1
  ) {
    return imagesData[0];
  }

  return null;
};
