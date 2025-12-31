//=============================================================================
// Common Error Utilities
//=============================================================================

export interface SerializedError {
	readonly $isError: true;
	readonly name: string;
	readonly message: string;
	readonly stack?: string;
	readonly code?: string;
	readonly cause?: SerializedError;
}

export function serializeError(error: Error): SerializedError;
export function serializeError(error: any): any;
export function serializeError(error: any): any {
	if (error instanceof Error) {
		const { name, message, stack, cause } = error;
		return {
			$isError: true,
			name,
			message,
			stack,
			cause: cause ? serializeError(cause) : undefined,
			code: (error as any).code,
		};
	}
	return error;
}

export function deserializeError(data: SerializedError): Error {
	const error = new Error();
	error.name = data.name;
	error.message = data.message;
	error.stack = data.stack;
	if (data.code) {
		(error as any).code = data.code;
	}
	if (data.cause) {
		(error as any).cause = deserializeError(data.cause);
	}
	return error;
}

/**
 * Extracts the error message from any possible error type.
 *
 * ```js
 * console.log(getErrorMessage(new Error('Something went wrong'))); // 'Something went wrong'
 * ```
 */
export function getErrorMessage(error: unknown): string {
	if (typeof error === 'string') {
		if (error[0] === '{') {
			try {
				return getErrorMessage(JSON.parse(error));
			} catch {
				return error;
			}
		}
	}
	if (error == null) {
		return 'Unknown error';
	}
	if (typeof (error as any).message === 'string') {
		return getErrorMessage((error as any).message);
	}
	if (typeof (error as any).name === 'string') {
		return (error as any).name;
	}
	if (typeof (error as any).code === 'string') {
		return (error as any).code;
	}
	if (typeof error.toString === 'function') {
		return error.toString();
	}
	return 'Unknown error';
}

/**
 * Checks if the given error is an AbortError.
 */
export function isAbortError(error: unknown): boolean {
	if ((error as { name: string; } | null)?.name === 'AbortError') {
		return true;
	}
	if ((error as { code: string; } | null)?.code === 'ABORT_ERR') {
		return true;
	}
	return false;
}

/**
 * Mimics the DOMException AbortError.
 */
export class AbortError extends Error {
	override readonly name = 'AbortError';
	readonly code = 'ABORT_ERR';

	constructor(message = 'The operation was aborted', options?: ErrorOptions) {
		super(message, options);
	}
}
