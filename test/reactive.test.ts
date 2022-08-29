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

// https://svelte.dev/repl/6218ae0ecf5c455195b4a76d7f0cff9f
test("intermediate", () => {
  const a = writable(1);
  const b = derived([a], ([a]) => a + 1);
  const events: number[][] = [];
  const c = derived([a, b], ([a, b]) => {
    events.push([a, b]);
    return a + b;
  });
  a.set(2);

  // The [1, 3] is an intermediate value, which we may not want to see.
  // This is because b subscribes a and triggers b.effect before c.effect
  // and then b triggers its subscribers (c) before a triggers it.
  // So we can see b's next value before a's next value to pass down to c.
  expect(events).toEqual([
    [1, 2],
    [1, 3], // <--
    [2, 3],
  ]);
  // Because of the simplicity of implementation (just push values down),
  // I won't treat this behavior as a "bug". If you want to avoid that,
  // the correct implementation should be like vue / value-enhancer, i.e.:
  // Combine "push" and "pull" behaviors,
  // when some value change, it doesn't trigger effects eagerly, but
  // tells its derivations it was changed.
  // The real computation happens when you call `.value` of the derivation.
  // See value-enhancer for more details.

  // Svelte is a bit different, it is more correct than me.
  // Because when it triggers subscribers, it saves arguments to a queue.
  // See link above.

  resetAll([a, b, c]);
});
