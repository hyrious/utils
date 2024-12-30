import { isIterable } from './iterable';

/**
 * Something that can be disposed, like holding resources or making side effects.
 */
export interface IDisposable {
  dispose(): void;
}

export function isDisposable<T>(thing: T): thing is T & IDisposable {
  return typeof thing === 'object' && thing !== null && typeof (thing as unknown as IDisposable).dispose === 'function';
}

/**
 * Call the {@link IDisposable.dispose dispose} method on the given object(s).
 * If the argument is an array, it returns an empty array to enable the following
 * code pattern:
 *
 * ```ts
 * let subscription: IDisposable[] = [];
 * subscription = dispose(subscription);
 * ```
 *
 * If there're errors during disposing, it will be thrown as an {@link AggregateError}.
 */
export function dispose<T extends IDisposable>(disposable: T): T;
export function dispose<T extends IDisposable>(disposable: T | undefined): T | undefined;
export function dispose<T extends IDisposable, A extends Iterable<T>>(disposable: A): A;
export function dispose<T extends IDisposable>(disposable: ReadonlyArray<T>): ReadonlyArray<T>;
export function dispose<T extends IDisposable>(disposable: Array<T>): Array<T>;
export function dispose<T extends IDisposable>(disposable: T | Iterable<T> | undefined): any {
  if (isIterable<IDisposable>(disposable)) {
    const errors: any[] = [];
    for (const item of disposable) {
      try {
        item.dispose();
      } catch (error) {
        errors.push(error);
      }
    }
    if (errors.length === 1) {
      throw errors[0];
    }
    if (errors.length > 1) {
      throw new AggregateError(errors, 'More than one errors occurred during disposing.');
    }
    return Array.isArray(disposable) ? [] : disposable;
  } else if (disposable) {
    disposable.dispose();
    return disposable;
  }
}

export abstract class Disposable implements IDisposable {
  private _store: Set<IDisposable> | [IDisposable] | undefined = undefined;

  protected _register(disposable: IDisposable): void {
    if (!this._store) {
      this._store = [disposable];
    } else if (Array.isArray(this._store)) {
      this._store = new Set(this._store.concat(disposable));
    } else {
      this._store.add(disposable);
    }
  }

  dispose(): void {
    if (this._store) {
      const store = this._store;
      this._store = undefined;
      dispose(store);
    }
  }
}
