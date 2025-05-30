export type Plain<T> = T extends undefined
  ? boolean
  : T extends number
    ? number
    : T extends bigint
      ? bigint
      : T extends string
        ? string
        : T extends symbol
          ? symbol
          : T extends object
            ? { [K in Exclude<keyof T, symbol>]: Plain<T[K]> }
            : T;
