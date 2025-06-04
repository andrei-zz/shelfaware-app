import {
  z,
  ZodBoolean,
  ZodDate,
  ZodDefault,
  ZodNullable,
  ZodNumber,
  ZodOptional,
  ZodString,
} from "zod/v4";
import type { $ZodObject, $ZodType } from "zod/v4/core";

export const coerceString = (val: unknown): string | null | undefined => {
  if (val === "" || val === null) {
    return null;
  } else if (val === undefined) {
    return undefined;
  } else if (typeof val === "string") {
    return val;
  }
  throw new Error(`Invalid type for string: ${typeof val}`);
};

export const coerceNumber = (val: unknown): number | null | undefined => {
  if (val === "" || val === null) {
    return null;
  } else if (val === undefined) {
    return undefined;
  } else if (typeof val === "string") {
    const n = Number(val);
    if (Number.isNaN(n)) throw new Error(`Invalid number: ${val}`);
    return n;
  } else if (typeof val === "number") {
    return val;
  }
  throw new Error(`Invalid type for number: ${typeof val}`);
};

export const coerceBoolean = (val: unknown): boolean | null | undefined => {
  if (val === "" || val === null) {
    return null;
  } else if (val === undefined) {
    return undefined;
  } else if (typeof val === "string") {
    if (val.toLowerCase() === "true" || val.toLowerCase() === "on") {
      return true;
    }
    if (val.toLowerCase() === "false" || val.toLowerCase() === "off") {
      return false;
    }
  } else if (typeof val === "boolean") {
    return val;
  }
  throw new Error(`Invalid type for boolean: ${typeof val}`);
};

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

/**
 * Given a ZodObject schema, returns a `z.object(...)` where every key is
 * `z.unknown().optional()` and the whole thing is strict.
 */
const makeRawSchema = <T extends $ZodObject>(schema: T) => {
  const shape = schema._zod.def.shape;
  const rawShape: Record<string, $ZodType> = {};

  for (const key of Object.keys(shape)) {
    rawShape[key] = z.unknown().optional();
  }

  return z.object(rawShape).strict();
};

const makeTransformFn = <T extends $ZodObject>(schema: T) => {
  const shape = schema._zod.def.shape;

  return (raw: unknown) => {
    const obj = raw as Record<string, unknown>;
    const out: Record<string, unknown> = {};

    for (const key of Object.keys(shape)) {
      let fieldSchema = shape[key];
      let val = obj[key];

      while (
        fieldSchema instanceof ZodOptional ||
        fieldSchema instanceof ZodNullable ||
        fieldSchema instanceof ZodDefault
      ) {
        fieldSchema = fieldSchema.unwrap();
      }

      if (fieldSchema instanceof ZodNumber) {
        out[key] = coerceNumber(val);
      } else if (fieldSchema instanceof ZodBoolean) {
        out[key] = coerceBoolean(val);
      } else if (fieldSchema instanceof ZodString) {
        out[key] = coerceString(val);
      } else if (fieldSchema instanceof ZodDate) {
        out[key] = coerceTimestamp(val);
      } else {
        out[key] = val; // enums, objects, etc.
      }
    }

    return out;
  };
};

// The returned type is a ZodEffects that ultimately yields the same shape as `schema`
export const makeApiSchema = <T extends $ZodObject>(schema: T) => {
  const rawStrict = makeRawSchema(schema);
  const coerced = rawStrict.transform(makeTransformFn(schema));
  return coerced.pipe(schema as any);
};

const isRecord = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null;

/**
 * Core payload parser: given an unknown raw object and a list of
 * { schema, dummy } candidates, try each one in turn.
 */
const parsePayload = <T extends $ZodObject>(
  raw: unknown,
  schema: T,
  dummy?: Partial<z.input<T>>
): z.output<T> => {
  if (!isRecord(raw)) {
    throw new Error("Payload must be an object");
  }
  const input = { ...raw };

  // merge in only those dummy fields that are truly missing or undefined
  const merged: Record<string, unknown> = { ...input };
  if (dummy) {
    for (const key of Object.keys(dummy)) {
      if (!(key in merged) || merged[key] === undefined) {
        merged[key] = dummy[key as keyof typeof dummy];
      }
    }
  }

  // just parse
  const parsed = z.parse(schema, merged);

  // strip back out any dummy fields we injected
  if (dummy) {
    for (const key of Object.keys(dummy) as (keyof T)[]) {
      if (!(key in raw) || (raw as any)[key] === undefined) {
        delete (parsed as any)[key];
      }
    }
  }

  return parsed;
};

/**
 * For multipart/form-data requests: pull out the File entries,
 * build a plain object of the other fields, then parse.
 */
export const parseFormPayload = <T extends $ZodObject>(
  form: Record<string, unknown>,
  schema: T,
  dummy?: Partial<z.input<T>>
): z.output<T> => {
  const rawObj: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(form)) {
    if (val instanceof File) continue;
    rawObj[key] = val;
  }
  return parsePayload(rawObj, schema, dummy);
};

/**
 * For JSON requests: just pass through to parsePayload.
 */
export const parseJsonPayload = <T extends $ZodObject>(
  jsonData: unknown,
  schema: T,
  dummy?: Partial<z.input<T>>
): z.output<T> => parsePayload(jsonData, schema, dummy);
