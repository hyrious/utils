export interface IDisposable {
  dispose(): void;
}

export function isDisposable<T>(thing: T): thing is T & IDisposable {
  return typeof thing === 'object' && thing !== null && typeof (thing as unknown as IDisposable).dispose === 'function';
}

export function dispose<T extends IDisposable>(thing: T): T;
export function dispose<T extends IDisposable>(thing: T | undefined): T | undefined;
export function dispose<T extends IDisposable>(thing: T): T {
  thing.dispose();
  return thing;
}
