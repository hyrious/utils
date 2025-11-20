//=============================================================================
// Cancelable operations.
//=============================================================================

import type { DisposableStore, IDisposable } from './dispose.ts';
import { Emitter, Event, type IEvent } from './event.ts';

export interface ICancellationToken {
	readonly isCancellationRequested: boolean;
	readonly onCancellationRequested: IEvent<any>;
}

const cancalledEvent: IEvent<any> = Object.freeze(function (callback): IDisposable {
	const handle = setTimeout(callback, 0);
	return { dispose() { clearTimeout(handle); } };
});

export const CancellationToken = {
	None: Object.freeze<ICancellationToken>({
		isCancellationRequested: false,
		onCancellationRequested: Event.None
	}),
	Cancelled: Object.freeze<ICancellationToken>({
		isCancellationRequested: true,
		onCancellationRequested: cancalledEvent
	}),
} as const;

class MutableToken implements ICancellationToken, IDisposable {
	private _isCancelled = false;
	private _emitter: Emitter<any> | null = null;

	cancel(): void {
		if (!this._isCancelled) {
			this._isCancelled = true;
			if (this._emitter) {
				this._emitter.fire(undefined);
				this.dispose();
			}
		}
	}

	get isCancellationRequested(): boolean {
		return this._isCancelled;
	}

	get onCancellationRequested(): IEvent<any> {
		if (this._isCancelled) {
			return cancalledEvent;
		}
		if (!this._emitter) {
			this._emitter = new Emitter<any>();
		}
		return this._emitter.event;
	}

	dispose(): void {
		if (this._emitter) {
			this._emitter.dispose();
			this._emitter = null;
		}
	}
}

export function isCancellationToken(thing: any): thing is ICancellationToken {
	if (thing === CancellationToken.None || thing === CancellationToken.Cancelled) {
		return true;
	}
	if (thing instanceof MutableToken) {
		return true;
	}
	if (!thing || typeof thing != 'object') {
		return false;
	}
	return typeof (thing as ICancellationToken).isCancellationRequested == 'boolean'
		&& typeof (thing as ICancellationToken).onCancellationRequested == 'function';
}

export class CancellationTokenSource {
	private _token: ICancellationToken | null = null;

	get token(): ICancellationToken {
		this._token ||= new MutableToken();
		return this._token;
	}

	cancel(): void {
		if (!this._token) {
			this._token = CancellationToken.Cancelled;
		} else if (this._token instanceof MutableToken) {
			this._token.cancel();
		}
	}

	dispose(cancel: boolean = false): void {
		if (cancel) {
			this.cancel();
		}
		if (!this._token) {
			this._token = CancellationToken.None;
		} else if (this._token instanceof MutableToken) {
			this._token.dispose();
		}
	}
}

export function cancelOnDispose(store: DisposableStore): ICancellationToken {
	const source = new CancellationTokenSource();
	store.add({ dispose() { source.cancel(); } });
	return source.token;
}
