import { expect, test, vi } from "vitest";
import { writable, combine, resetAll } from "../src/reactive";

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
