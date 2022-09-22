export type _ = undefined;
export const _ = undefined;
export function noop() {}
export function run(fn: () => void) {
  fn();
}
export function runAll(fns: Array<() => void> | Set<() => void>) {
  fns.forEach(run);
}
export function times(n: number, fn: (() => void) | ((i: number) => void)) {
  for (let i = 0; i < n; ++i) fn(i);
}
export function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
/**
 * Borrow from svelte/interval.
 * It treats `-0 === +0` and `NaN === NaN`.
 */
export function notEqual(a: unknown, b: unknown) {
  return a != a ? b == b : a !== b;
}
/**
 * Borrow from svelte/interval.
 * It treats any object / function as not equal to itself.
 */
export function safeNotEqual(a: unknown, b: unknown) {
  return a != a ? b == b : a !== b || ((a as boolean) && typeof a === "object") || typeof a === "function";
}
/**
 * Helper function to extract tuple values.
 * ```js
 * const [str, num] = spread<[string, number]>(document.querySelectorAll('*'))
 * ```
 */
export function spread<T = any[]>(args: Iterable<unknown> | ArrayLike<unknown>): T {
  return Array.from(args) as unknown as T;
}
export function isFunction(a: unknown): a is Function {
  return typeof a === "function";
}
/**
 * Deep clone, but only for plain objects.
 * Hint: shallow clone is `Object.assign({}, x)`.
 */
export function clone<T>(x: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(x);
  }
  return _clone(x);
}
function _clone(x: any): any {
  if (Array.isArray(x)) {
    return x.map(_clone);
  } else if (typeof x === "object" && x !== null) {
    let o: any = {};
    for (const k in x) {
      o[k] = _clone(x[k]);
    }
    return o;
  }
  return x;
}
/**
 * Check if a value is JSON-serializable.
 * It does not check deeper.
 */
export function isJSON(x: any): boolean {
  if (x === _) return false;
  const t = typeof x;
  if (t === "string" || t === "number" || t === "boolean") return true;
  if (t !== "object") return false; // bigint, function, symbol
  if (Array.isArray(x)) return true;
  return (x.constructor && x.constructor.name === "Object") || typeof x.toJSON === "function";
}
export function debounce<Args extends unknown[], Ret, Fn extends (...args: Args) => Ret>(
  fn: Fn,
  ms = 200,
  name = fn.name
): Fn {
  let token = 0; // should be ok in both node and browser
  function wrapper() {
    clearTimeout(token);
    // @ts-ignore
    token = setTimeout(fn.bind(this, ...arguments), ms);
  }
  Object.defineProperty(wrapper, "name", { value: name, configurable: true });
  Object.defineProperty(wrapper, "length", { value: fn.length, configurable: true });
  return wrapper as any;
}
export function tap<T>(x: T, f: (x: T) => void): T {
  f(x);
  return x;
}
export function isDate(x: unknown): x is Date {
  return Object.prototype.toString.call(x) === "[object Date]";
}
export function once<Fn extends (...args: any) => any>(fn: Fn): Fn & { reset: () => void } {
  let done = false;
  let result: ReturnType<Fn>;
  function wrapper() {
    if (done) return result;
    done = true;
    return (result = fn());
  }
  Object.defineProperty(wrapper, "name", { value: fn.name, configurable: true });
  wrapper.reset = function reset() {
    done = false;
  };
  return wrapper as Fn & { reset: () => void };
}
