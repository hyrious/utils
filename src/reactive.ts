import { pow } from "./math";
import { safeNotEqual, _ } from "./misc";

export interface Readable<T = any> {
  readonly value: T;
  readonly subs: Set<(v: T) => void>;
  subscribe(sub: (v: T) => void): () => void;
}

export interface Writable<T = any> extends Readable<T> {
  set(value: T): void;
}

export class Val<T = any> implements Writable<T> {
  declare value: T;
  declare readonly subs: Set<(v: T) => void>;
  constructor(value?: T) {
    this.value = value as T;
    this.subs = new Set();
  }
  set(value: T) {
    if (safeNotEqual(this.value, value)) {
      this.value = value;
      this.subs.forEach((sub) => sub(value));
    }
  }
  subscribe(sub: (v: T) => void): () => void {
    this.subs.add(sub);
    this.value !== _ && sub(this.value);
    return () => this.subs.delete(sub);
  }
}

/**
 * For more complex usage, see https://github.com/crimx/value-enhancer
 * ```js
 * let count$ = writable(0)
 * count$.subscribe(console.log) // logs: 0
 * count$.set(1)                 // logs: 1
 * count$.value                  // 1
 * ```
 */
export function writable<T = any>(value?: T): Writable<T> {
  return new Val(value);
}

/**
 * ```js
 * let count$ = writable(0)
 * update(count$, c => c + 1)
 * ```
 */
export function update<T = any>(v: Writable<T>, fn: (v: T) => T) {
  v.set(fn(v.value));
}

/**
 * Add subscriber to the subscription list but do not invoke it immediately.
 */
export function reaction<T = any>(v: Readable<T>, fn: (v: T) => void) {
  v.subs.add(fn);
  return () => v.subs.delete(fn);
}

/**
 * Clear all subscriptions.
 */
export function reset(v: Readable) {
  v.subs.clear();
}

/**
 * Clear all subscriptions.
 */
export function resetAll(vs: Readable[]) {
  vs.forEach(reset);
}

/**
 * Tell if a reactive value is not ready (no first value).
 */
export function notReady(v: Readable) {
  return v.value === _;
}

export type ValueOf<Val> = Val extends Readable<infer T> ? T : never;

export type ValuesOf<Vs extends Readable[]> = { [K in keyof Vs]: ValueOf<Vs[K]> };

/**
 * Maximum 53 inputs! Why? see https://mdn.io/MAX_SAFE_INTEGER
 * ```js
 * const foo$ = writable(0)
 * const bar$ = writable('a')
 * const foobar$ = combine([foo$, bar$])
 * foobar$.subscribe(console.log) // logs: [0, 'a']
 * ```
 */
export function combine<Vs extends Readable[] = Readable[]>(values: [...Vs]): Readable<[...ValuesOf<Vs>]> {
  const inner = writable();
  const value = Array(values.length);
  let count = 0;
  let total = pow(2, values.length) - 1;
  values.forEach(function ($, i) {
    const bit = pow(2, i);
    return $.subscribe(function (v) {
      value[i] = v;
      count |= bit;
      if (count === total) {
        inner.set(value);
      }
    });
  });
  return inner;
}
