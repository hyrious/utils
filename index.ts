/**
 * Get a "detached" promise object, make synchronous tasks easier.
 * ```js
 * let [p, r] = block();
 * (async () => { r(1) })();
 * (async () => { console.log(await p) })(); // logs "1"
 * ```
 */
export function block<T = void>() {
  let r!: (t: T) => void
  const p = new Promise<T>(r_ => r = r_)
  return [p, r] as const
}

/**
 * Get result and error like Go.
 * ```js
 * let [res, err] = await go(fs.promises.writeFile('a.txt', 'hello'));
 * if (err) console.log("error:", err);
 * ```
 */
export function go<T = any, E = Error>(p: PromiseLike<T>): [a: T, e: undefined] | [a: undefined, e: E]
export function go<T = any>(p: T): [a: T, e: undefined]
export function go(p: any): any {
  if (p instanceof Promise || (p && p.then && p.catch && p.finally))
    return p.then((a: any) => [a, undefined]).catch((e: any) => [undefined, e])
  return [p, undefined]
}
