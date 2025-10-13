//=============================================================================
// Manage side effects.
//=============================================================================

export interface IDisposable<T = any> {
	dispose(): T;
}

export function isDisposable<E extends any>(thing: E): thing is E & IDisposable {
	return typeof thing === 'object' && thing !== null && typeof (thing as unknown as IDisposable).dispose === 'function';
}

export function dispose(disposable: IDisposable): void {
	disposable.dispose();
}

export function disposeAll(disposables: IDisposable[]): void {
	while (disposables.length) {
		const item = disposables.pop();
		item?.dispose();
	}
}

export abstract class Disposable implements IDisposable {
	private _isDisposed = false;

	protected _disposables: IDisposable[] = [];

	dispose(): any {
		if (this._isDisposed) {
			return;
		}
		this._isDisposed = true;
		disposeAll(this._disposables);
	}

	protected _register<T extends IDisposable>(value: T): T {
		if (this._isDisposed) {
			value.dispose();
		} else {
			this._disposables.push(value);
		}
		return value;
	}

	protected get isDisposed(): boolean {
		return this._isDisposed;
	}
}

class FunctionDisposable implements IDisposable {
	private _isDisposed = false;
	private readonly _fn: () => void;

	constructor(fn: () => void) {
		this._fn = fn;
	}

	dispose() {
		if (this._isDisposed) {
			return;
		}
		this._isDisposed = true;
		this._fn();
	}
}

export function toDisposable(fn: () => void): IDisposable {
	return new FunctionDisposable(fn);
}
