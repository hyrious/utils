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
export function update<T = any>($: Writable<T>, fn: (v: T) => T) {
  $.set(fn($.value));
}

/**
 * Add subscriber to the subscription list but do not invoke it immediately.
 */
export function reaction<T = any>($: Readable<T>, fn: (v: T) => void) {
  $.subs.add(fn);
  return () => $.subs.delete(fn);
}

/**
 * Clear all subscriptions.
 */
export function reset($: Readable) {
  $.subs.clear();
}

/**
 * Clear all subscriptions.
 */
export function resetAll($$: Readable[]) {
  $$.forEach(reset);
}

/**
 * Tell if a reactive value is not ready (no first value).
 */
export function notReady($: Readable) {
  return $.value === _;
}

export type ValueOf<$> = $ extends Readable<infer T> ? T : never;

export type ValuesOf<$$ extends Readable[]> = { [K in keyof $$]: ValueOf<$$[K]> };

/**
 * Maximum 53 inputs! Why? see https://mdn.io/MAX_SAFE_INTEGER
 * ```js
 * const foo$ = writable(0)
 * const bar$ = writable('a')
 * const foobar$ = combine([foo$, bar$])
 * foobar$.subscribe(console.log) // logs: [0, 'a']
 * ```
 */
export function combine<$$ extends Readable[] = Readable[]>($$: [...$$]): Readable<[...ValuesOf<$$>]> {
  const inner = writable();
  const value = Array($$.length);
  let count = 0;
  let total = pow(2, $$.length) - 1;
  $$.forEach(function ($, i) {
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
