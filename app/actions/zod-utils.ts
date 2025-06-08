import { z } from "zod/v4";

const isRecord = (x: unknown): x is Record<string, unknown> =>
  x !== null && typeof x === "object" && !Array.isArray(x);

const isPlainRecord = (x: unknown): x is Record<string, unknown> => {
  if (x === null || typeof x !== "object" || Array.isArray(x)) return false;
  const proto = Object.getPrototypeOf(x);
  return proto === Object.prototype || proto === null;
};

export const uidSchema = z.string().regex(/^[0-9a-f]+$/, {
  message: "UID must be lowercase hex (0-9, a-f only)",
});

export const coerceTimestamp = (val: unknown): number | null | undefined => {
  if (val === "" || val === null) {
    return null;
  } else if (val === undefined) {
    return undefined;
  }

  const d =
    typeof val === "string" || typeof val === "number" ? new Date(val) : null;
  if (!(d instanceof Date) || Number.isNaN(d.valueOf())) {
    throw new Error(`Invalid timestamp: ${val}`);
  }
  return d.valueOf();
};

// Recursively unwrap default, optional, nullable
const unwrapSchema = (schema: z.core.$ZodType): z.core.$ZodType => {
  if (
    schema instanceof z.ZodOptional ||
    schema instanceof z.ZodNonOptional ||
    schema instanceof z.ZodDefault ||
    schema instanceof z.ZodNullable
  ) {
    return unwrapSchema(schema._zod.def.innerType);
  }
  return schema;
};

/**
 * Converts FormData to a partial record suitable for parsing by a Zod schema.
 * - All schema fields are treated as optional.
 * - Empty strings for string or number fields become null.
 * - Undefined stays undefined; null stays null.
 * - Date/timestamp fields should be handled manually.
 * - Boolean coercion can be handled via z.coerce.boolean() in the schema.
 */
export const coerceFormData = <T extends z.ZodObject>(
  schema: T,
  formData: Record<string, unknown>
): Partial<z.input<T>> => {
  const result: Partial<z.input<T>> = {};

  // Extract the shape of the object schema
  const shape = schema.shape;

  for (const key in shape) {
    const fieldSchema = unwrapSchema(shape[key]);
    const raw = formData[key];
    // Missing field -> skip (leave undefined)
    if (raw === null) {
      continue;
    }
    // Handle string values
    if (typeof raw === "string") {
      // Empty string -> null for string or number types
      if (
        raw === "" &&
        (fieldSchema instanceof z.ZodString ||
          fieldSchema instanceof z.ZodNumber)
      ) {
        result[key as keyof z.input<T>] = null as z.input<T>[keyof z.input<T>];
        continue;
      } else if (fieldSchema instanceof z.ZodNumber) {
        // Number coercion
        const parsed = Number(raw);
        result[key as keyof z.input<T>] = (
          Number.isNaN(parsed) ? raw : parsed
        ) as z.input<T>[keyof z.input<T>];
      } else if (fieldSchema instanceof z.ZodBoolean) {
        // Boolean coercion
        if (raw === "") {
          result[key as keyof z.input<T>] =
            null as z.input<T>[keyof z.input<T>];
        } else {
          const parsed = z.stringbool().safeParse(raw);
          if (parsed.success) {
            result[key as keyof z.input<T>] =
              parsed.data as z.input<T>[keyof z.input<T>];
          } else {
            result[key as keyof z.input<T>] =
              raw as z.input<T>[keyof z.input<T>];
          }
        }
      } else {
        // String or other types
        result[key as keyof z.input<T>] = raw as z.input<T>[keyof z.input<T>];
      }
    } else {
      // File (Blob)
      result[key as keyof z.input<T>] = raw as z.input<T>[keyof z.input<T>];
    }
  }

  return result;
};

/**
 * Parses data with dummy defaults to satisfy required schema fields, then strips out dummy fields
 * that weren't present in the original data.
 *
 * @param schema - The Zod schema to parse against.
 * @param data - The partial data to validate.
 * @param dummy - A record of dummy values to temporarily satisfy the schema.
 * @returns The parsed data with dummy-only fields removed.
 */
export function parseWithDummy<T extends z.ZodObject>(
  schema: T,
  data: Partial<z.input<T>>,
  dummy?: Partial<z.input<T>>
): Partial<z.output<T>> {
  // Merge dummy and data (data overrides dummy)
  const merged = {
    ...dummy,
    ...Object.fromEntries(Object.entries(data).filter(([, v]) => v != null)),
  };
  // Validate merged data
  const parsed = schema.parse(merged) as Record<string, unknown>;
  // Remove dummy fields not present in original data
  if (dummy != null) {
    for (const key of Object.keys(dummy)) {
      if (!data.hasOwnProperty(key)) {
        delete parsed[key];
      } else if (data[key as keyof typeof dummy] === null) {
        parsed[key] = null;
      } else if (data[key as keyof typeof dummy] === undefined) {
        parsed[key] = undefined;
      }
    }
  }
  return parsed as Partial<z.output<T>>;
}
