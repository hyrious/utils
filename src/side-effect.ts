import { isFunction } from "./misc";

/**
 * ```js
 * const disposers = disposable()
 * disposers.push(effect())
 * return disposers.flush
 * ```
 */
export function disposable() {
  const disposers: (() => void)[] = [];

  function push(f: () => void) {
    disposers.push(f);
  }

  function flush() {
    disposers.forEach((f) => f());
    disposers.length = 0;
  }

  return { push, flush };
}

/**
 * ```js
 * const runner = singleton()
 * runner.run(effect1)
 * runner.run(effect2) // triggers effect1's flush before effect2
 * return runner.flush
 * ```
 */
export function singleton() {
  let cleanup: (() => void) | void;

  function run(effect: () => (() => void) | void) {
    flush();
    cleanup = effect();
    if (!isFunction(cleanup)) cleanup = void 0;
  }

  function flush() {
    if (cleanup) {
      cleanup();
      cleanup = undefined;
    }
  }

  return { run, flush };
}
