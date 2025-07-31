export type Resolved<T> = {
  [K in keyof T]: T[K];
} & {};
