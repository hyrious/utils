import { expect, test, vi } from "vitest";
import { writable, combine, resetAll, connect, Operator, pipe, derived, reaction } from "../src/reactive";

test("combine", () => {
  const foo$ = writable(0);
  const bar$ = writable<string>();

  const callback = vi.fn();
  const foobar$ = combine([foo$, bar$]);
  foobar$.subscribe(callback);
  expect(callback).toBeCalledTimes(0);

  bar$.set("hello");
  expect(callback).toBeCalledWith([0, "hello"]);
  expect(callback).toBeCalledTimes(1);

  expect(foobar$.value).toEqual([foo$.value, bar$.value]);

  bar$.set("hello");
  expect(callback).toBeCalledTimes(1);

  expect(foobar$.value).toEqual([foo$.value, bar$.value]);

  bar$.set("world");
  expect(callback).toBeCalledWith([0, "world"]);
  expect(callback).toBeCalledTimes(2);

  expect(foobar$.value).toEqual([foo$.value, bar$.value]);

  resetAll([foo$, bar$, foobar$]);
});

test("derived", () => {
  const foo$ = writable(3);
  const bar$ = writable(5);
  const sum$ = derived([foo$, bar$], ([foo, bar]) => foo + bar);

  const callback = vi.fn();
  sum$.subscribe(callback);
  expect(callback).toBeCalledWith(8);
  expect(callback).toBeCalledTimes(1);
  expect(sum$.value).toEqual(8);

  resetAll([foo$, bar$, sum$]);
});

test("connect", () => {
  const foo$ = writable<number>();
  const bar$ = writable<number>();

  const callback = vi.fn();
  bar$.subscribe(callback);
  connect(foo$, bar$);
  expect(callback).toBeCalledTimes(0);

  foo$.set(1);
  expect(callback).toBeCalledWith(1);
  expect(callback).toBeCalledTimes(1);

  foo$.set(2);
  expect(callback).toBeCalledWith(2);
  expect(callback).toBeCalledTimes(2);

  expect(foo$.value).toEqual(bar$.value);

  resetAll([foo$, bar$]);

  const countdown$ = derived([foo$], ([foo], set) => {
    while (foo-- > 0) set(foo);
  });
  const collected: number[] = [];
  reaction(countdown$, (v) => collected.push(v));
  foo$.set(3);
  expect(collected).toEqual([2, 1, 0]);

  resetAll([foo$, bar$]);
});

test("pipe", () => {
  const foo$ = writable(0);

  const add2: Operator<number> = (f) => (x) => f(x + 2);
  const mul2: Operator<number> = (f) => (x) => f(x * 2);

  const bar$ = pipe(foo$, [add2, mul2]);
  expect(bar$.value).toEqual(4);

  foo$.set(2);
  expect(bar$.value).toEqual(8);

  resetAll([foo$, bar$]);
});
