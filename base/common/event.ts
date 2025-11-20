//=============================================================================
// Fire and listen to events.
//=============================================================================

import { Disposable, toDisposable, type IDisposable } from './dispose.ts';

export type Listener<T> = (e: T) => unknown;

export interface IEvent<T = void> {
	(listener: Listener<T>): IDisposable;
}

export const Event = {
	None: Object.freeze<IEvent<any>>(() => Disposable.None)
} as const;

export class Emitter<T> implements IDisposable<void> {

	private _isDisposed = false;
	private _multi?: Set<Listener<T>> | null;
	private _single?: Listener<T> | null;
	private _event?: IEvent<T>;

	fire(event: T): void {
		this._multi ? this._multi.forEach(listener => listener(event)) : this._single?.(event);
	}

	get event(): IEvent<T> {
		this._event ??= (callback: Listener<T>) => {
			if (this._isDisposed) {
				return Disposable.None;
			}

			this._multi || this._single
				? (this._single = void (this._multi ??= new Set<Listener<T>>().add(this._single!)).add(callback))
				: (this._single = callback);

			return toDisposable(() => this._removeListener(callback));
		};
		return this._event;
	}

	private _removeListener(callback: Listener<T>) {
		this._multi
			? this._multi.delete(callback)
			: this._single === callback && (this._single = null);
	}

	dispose(): void {
		if (!this._isDisposed) {
			this._isDisposed = true;
			this._multi = null;
			this._single = null;
		}
	}
}
