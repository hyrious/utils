/**
 * Make all readonly properties in `T` writable.
 */
export type Writable<T> = { -readonly [P in keyof T]: T[P] };
