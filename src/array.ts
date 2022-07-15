import { _ } from "./misc";

export function uniq<T>(a: readonly T[]): T[] {
  return Array.from(new Set(a));
}

/** This function mutates input! */
export function shuffle<T>(a: T[]): T[] {
  for (let i = a.length - 1; i > 0; --i) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function last<T>(a: T[]): T | _ {
  return at(a, -1);
}

export function at<T>(a: T[], i: number): T | _ {
  const l = a.length;
  if (!l) {
    return _;
  }
  if (i < 0) {
    i += l;
  }
  return a[i];
}
