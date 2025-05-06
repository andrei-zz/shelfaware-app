import { useSyncExternalStore } from "react";

const QUERY = "(min-width: 768px)";
const DEFAULT_MATCHES_SSR = true;

let mql: MediaQueryList | null = null;

const getMediaQueryList = (): MediaQueryList => {
  if (typeof window === "undefined") {
    return {
      matches: DEFAULT_MATCHES_SSR,
      addEventListener: () => {},
      removeEventListener: () => {},
    } as unknown as MediaQueryList;
  }

  if (!mql) {
    mql = window.matchMedia(QUERY);
  }

  return mql;
};

const subscribe = (callback: () => void): (() => void) => {
  const mql = getMediaQueryList();

  if (mql.addEventListener) {
    mql.addEventListener("change", callback);
    return () => mql.removeEventListener("change", callback);
  } else {
    mql.addListener(callback);
    return () => mql.removeListener(callback);
  }
};

const getSnapshot = (): boolean => getMediaQueryList().matches;

export const useMinW768 = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_MATCHES_SSR);
