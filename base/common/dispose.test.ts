import assert from 'node:assert';
import test from 'node:test';
import { dispose, disposeAll, isDisposable, type IDisposable } from './dispose.ts';

class Disposable implements IDisposable {
	isDisposed = false;
	dispose() { this.isDisposed = true; }
}

test('isDisposable', () => {
	const disposable = new Disposable();
	assert.strictEqual(isDisposable(disposable), true);
	assert.strictEqual(isDisposable({}), false);
});

test('dispose', () => {
	const disposable = new Disposable();
	assert.strictEqual(disposable.isDisposed, false);
	dispose(disposable);
	assert.strictEqual(disposable.isDisposed, true);
});

test('disposeAll', () => {
	const disposables = [new Disposable(), new Disposable(), new Disposable()];
	for (const disposable of disposables) {
		assert.strictEqual(disposable.isDisposed, false);
	}
	disposeAll(disposables);
	for (const disposable of disposables) {
		assert.strictEqual(disposable.isDisposed, true);
	}
});
