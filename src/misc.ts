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
  return new Promise((resolve) => setTimeout(resolve, ms));
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
