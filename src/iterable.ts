/**
 * Ensure something can be iterated over (i.e. `for .. of`).
 */
export function isIterable<T = any>(thing: any): thing is Iterable<T> {
  return thing && typeof thing === 'object' && typeof thing[Symbol.iterator] === 'function';
}
