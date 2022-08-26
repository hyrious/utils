import { _ } from "./misc";

/**
 * Save you a try-catch.
 * ```js
 * const [ok, err] = await go(fetch(...))
 * if (err) {
 *   console.error(err)
 * }
 * ```
 */
export async function go<T>(p: Promise<T>): Promise<[Awaited<T>, _] | [_, Error]> {
  try {
    return [await p, _];
  } catch (err) {
    return [_, err];
  }
}
