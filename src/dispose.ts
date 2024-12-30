export interface IDisposable {
  dispose(): void;
}

export function isDisposable<T>(thing: T): thing is T & IDisposable {
  return typeof thing === 'object' && thing !== null && typeof (thing as unknown as IDisposable).dispose === 'function';
}
