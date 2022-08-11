import { First, Last } from "./array";
import { pow } from "./math";
import { safeNotEqual, _ } from "./misc";

export interface Readable<T = any> {
  readonly value: T;
  readonly subs: Set<(v: T) => void>;
  subscribe(sub: (v: T) => void): () => void;
}
type R<T = any> = Readable<T>;

export interface Writable<T = any> extends Readable<T> {
  set(value: T): void;
}

/**
 * This is somewhat a BehaviorSubject in Rx.
 */
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

/**
 * @example
 * let foo$ = writable(0)
 * let bar$ = writable()
 * bar$.subscribe(console.log) // no log
 * connect(foo$, bar$)         // logs: 0
 * foo$.set(1)                 // logs: 1
 * assert(foo$.value === bar$.value)
 */
export function connect(from: Readable, to: Writable) {
  return from.subscribe(to.set.bind(to));
}

/**
 * @example
 * let addThree: Operator<number> = sub => value => sub(value + 3)
 */
export interface Operator<In = any, Out = In> {
  (sub: (v: Out) => void): (v: In) => void;
}
type O<i, o> = Operator<i, o>;
type In<O> = O extends Operator<infer In, any> ? In : never;
type Out<O> = O extends Operator<any, infer Out> ? Out : never;

function mergeOps<Os extends Operator[]>(ops: [...Os]): Operator<In<First<Os>>, Out<Last<Os>>> {
  return (sub) => ops.reduceRight((value, sub) => sub(value), sub) as any;
}

/**
 * @example
 * let foo$ = writable(0)
 * let addThree = sub => value => sub(value + 3)
 * pipe(foo$, [addThree]).subscribe(console.log) // logs: 3
 */
export function pipe<T, O1>(from: R<T>, ops: [O<T, O1>]): R<O1>;
export function pipe<T, O1, O2>(from: R<T>, ops: [O<T, O1>, O<O1, O2>]): R<O2>;
export function pipe<T, O1, O2, O3>(from: R<T>, ops: [O<T, O1>, O<O1, O2>, O<O2, O3>]): R<O3>;
export function pipe<T, O1, O2, O3, O4>(from: R<T>, ops: [O<T, O1>, O<O1, O2>, O<O2, O3>, O<O3, O4>]): R<O4>;
export function pipe<T, Os extends Operator[]>(from: R<T>, ops: [...Os]): R<Out<Last<Os>>>;
export function pipe<T = any, Os extends Operator[] = Operator[]>(from: Readable<T>, ops: [...Os]): any {
  const inner = writable();
  const project = mergeOps(ops)(inner.set.bind(inner)) as (v: T) => void;
  from.subscribe(project);
  return inner;
}

export function map<T, K>(transform: (v: T) => K): Operator<T, K> {
  return (sub) => (v) => sub(transform(v));
}

export function filter<T>(predicate: (v: T) => boolean): Operator<T, T> {
  return (sub) => (v) => predicate(v) && sub(v);
}

export function scan<T, K>(scanner: (acc: T, v: K) => T, cur: T): Operator<K, T> {
  return (sub) => (v) => sub((cur = scanner(cur, v)));
}
