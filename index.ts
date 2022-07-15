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

interface IEventEmitter<E = any, V = any> {
  on(event: E, callback: (v: V) => void): void
  off(event: E, callback: (v: V) => void): void
}
/**
 * Return a disposer on event emitter's `on()`.
 */
export function on<E = any, V = any>(e: IEventEmitter<E, V>, event: E, callback: (v: V) => void) {
  e.on(event, callback)
  return () => e.off(event, callback)
}

interface IEventTarget<E = any, V = any> {
  addEventListener(event: E, callback: (v: V) => void): void
  removeEventListener(event: E, callback: (v: V) => void): void
}
/**
 * Return a disposer on event target's `addEventListener()`.
 */
export function addEventListener<E = any, V = any>(e: IEventTarget<E, V>, event: E, callback: (v: V) => void) {
  e.addEventListener(event, callback)
  return () => e.removeEventListener(event, callback)
}

/**
 * A map, but initializes lazily.
 * ```js
 * let services = createServiceLocator()
 * services.register("foo", () => "bar" + Math.random())
 * services.register("bar", () => Promise.resolve("baz"))
 * services.register("baz", undefined) // intentional no baz
 * services.register("qux", (foo, bar) => "quux", ["foo", "bar"]) // dependencies
 *
 * services.get("foo") // => "bar0.12345"
 * services.get("foo") // => "bar0.12345" (cached)
 * services.get("bar") // => Promise { "baz" }
 * // practice: always prepend "await" to resolve a service
 * await services.get("bar") // => "baz"
 * services.get("baz") // => undefined
 * ```
 */
export function createServiceLocator() {
  const cache = new Map<string, any>()
  const initializers = new Map<string, { value: (...deps: any) => any; deps?: string[] }>()
  return {
    get cache() { return cache },
    register(key: string, value: any, deps?: string[]) {
      if (typeof value !== 'function') {
        cache.set(key, value)
        return
      }

      initializers.set(key, { value, deps })
    },
    get(key: string) {
      if (cache.has(key))
        return cache.get(key)

      const data = initializers.get(key)
      if (!data)
        return undefined

      initializers.delete(key)
      const value = data.value(...(data.deps || []).map(k => this.get(k)))
      cache.set(key, value)

      return value
    },
  }
}
