import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const getInitials = (name: string | null | undefined): string => {
  if (name == null) {
    return "  "
  }

  const trimmed = name.trim();

  if (trimmed.length === 0) return "";

  if (trimmed.length <= 2) return trimmed.toUpperCase();

  const words = trimmed.split(/\s+/).filter((w) => w.length > 0);

  if (words.length >= 2) {
    const first = words[0][0].toUpperCase();
    const last = words[words.length - 1][0].toUpperCase();
    return first + last;
  }

  // Only one word, try to extract two uppercase letters
  const caps = [...trimmed].filter((c) => c >= "A" && c <= "Z");
  if (caps.length >= 2) return caps[0] + caps[1];

  // Fallback: use first two letters of the word
  return trimmed.slice(0, 2).toUpperCase();
};
