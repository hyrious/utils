import { _ } from "./misc";

type VoidType = _ | void | never;
type VoidKeys<Data> = {
  [K in keyof Data]: Data[K] extends VoidType ? K : never;
}[keyof Data];
type Keys<Data> = Extract<keyof Data, string>;

export type EmitterListener<Data, K extends Keys<Data> = Keys<Data>> = Data[K] extends VoidType
  ? () => void
  : (data: Data[K]) => void;

/**
 * For more complex usage, see https://github.com/crimx/remitter
 * ```js
 * const emitter = new Emitter<{ a: number, b: string }>()
 * const dispose = emitter.on("a", a => console.log(a))
 * emitter.emit("a", 1) // logs: 1
 * dispose()
 * ```
 */
export class Emitter<Data = any> {
  declare readonly subs: Map<Keys<Data>, Set<EmitterListener<Data, any>>>;
  constructor(_type: Data) {
    this.subs = new Map();
  }
  /**
   * Emit an event to all listeners.
   */
  emit<K extends VoidKeys<Data>>(ev: K): void;
  emit<K extends Keys<Data>>(ev: K, data: Data[K]): void;
  emit<K extends Keys<Data>>(ev: K, data?: Data[K]) {
    const subs = this.subs.get(ev);
    if (subs) subs.forEach((sub) => sub(data as Data[K]));
  }
  /**
   * Add a listener to some event.
   */
  on<K extends Keys<Data>>(ev: K, listener: EmitterListener<Data, K>): () => void {
    let subs = this.subs.get(ev);
    if (!subs) {
      subs = new Set();
      this.subs.set(ev, subs);
    }
    subs.add(listener);
    return () => this.off(ev, listener);
  }
  /**
   * Remove a listener from some event.
   * Returns true if the listener did exist.
   */
  off<K extends Keys<Data>>(ev: K, listener: EmitterListener<Data, K>) {
    const subs = this.subs.get(ev);
    if (subs) {
      const ret = subs.delete(listener);
      if (subs.size === 0) {
        this.subs.delete(ev);
      }
      return ret;
    }
    return false;
  }
  /**
   * Remove all listeners from some/all event(s).
   */
  clear<K extends Keys<Data>>(ev?: K) {
    if (ev) {
      const subs = this.subs.get(ev);
      if (subs) {
        subs.clear();
        this.subs.delete(ev);
      }
    } else {
      this.subs.clear();
    }
  }
}

/**
 * For more complex usage, see https://github.com/crimx/remitter
 * ```js
 * const emitter = observable({ a: 1, b: '' }) // input only for type inferring
 * const dispose = emitter.on("a", a => console.log(a))
 * emitter.emit("a", 1) // logs: 1
 * dispose()
 * ```
 */
export function observable<Data = any>(_type: Data): Emitter<Data> {
  return new Emitter<Data>(_type);
}
