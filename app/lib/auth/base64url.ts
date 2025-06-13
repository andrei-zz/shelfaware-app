import { z } from "zod/v4";

export const base64urlSchema = z
  .string()
  .min(2, { message: "Must be at least 2 characters" })
  .regex(/^(?:[A-Za-z0-9\-_]{4})*(?:[A-Za-z0-9\-_]{2}|[A-Za-z0-9\-_]{3})?$/, {
    message:
      "Invalid base64url string",
  });

export const generateBase64url = (byteLength = 16): string => {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);

  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

export const base64urlEncode = (buffer: Buffer): string => {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

export const base64urlDecode = (base64url: string): Buffer => {
  // Convert to standard base64
  const base64 = base64url
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(base64url.length + ((4 - (base64url.length % 4)) % 4), "=");

  return Buffer.from(base64, "base64");
};

// const N = 100;
// const generated = [];
// for (let i = 0; i < N; i++) {
//   const key = generateBase64url();
//   // console.log(key);
//   generated.push(key);
// }

// let pass = true;
// for (let i = 0; i < N; i++) {
//   const decoded = base64urlDecode(generated[i]);
//   const encoded = base64urlEncode(decoded);
//   if (encoded !== generated[i]) {
//     pass = false;
//   }
// }
// if (pass) {
//   console.log("base64url passes");
// } else {
//   console.log("base64url not equal");
// }
