## @hyrious/utils

Utility functions I often use.

### Contents

Most of the utils are quite simple, I'd suggest you to read the source code directly.
Some interesting parts will be documented here.

#### writable(initial?)

<details><summary>
Create a reactive value (an instance of <code>Val</code>) that can be subscribed.
</summary>

<!-- prettier-ignore -->
```js
let count$ = writable(0);
count$.subscribe(console.log); // logs: 0
count$.set(1);                 // logs: 1
count$.value;                  // 1
```

To create a readonly value (i.e. no `set()`), you just type-cast it to `Readable`.

```ts
let count$ = writable(0);
let readonlyCount$: Readable<number> = count$;
```

This is super useful for using in UI frameworks.

```jsx
import { useSyncExternalStore } from "use-sync-external-store/shim";
const foo$ = writable(0);
const subscribeFoo = foo$.subscribe.bind(foo$);
function App() {
  const foo = useSyncExternalStore(subscribeFoo, () => foo$.value);
  return <button onClick={() => foo$.set(foo$.value + 1)}>{foo}</button>;
}
```

Feature, not bug:

```js
let foo$ = writable(-0);
foo$.set(+0); // won't trigger listeners because -0 === +0, same as NaN === NaN
let obj = [];
foo$.set(obj); // triggers listener(obj)
foo$.set(obj); // triggers listener(obj) again, because the object may be modified
```

</details>

#### batch(render)

<details><summary>
Batch multiple calls to one to happen in next micro task.
</summary>

```js
const schedule = batch(render);
times(10, () => schedule()); // run 10 times synchronously
await tick();
expect(render).toBeCalledTimes(1); // only render once
```

</details>

### Coding Style

<details><summary>1. Make sure to only export pure variables.</summary>

<!-- prettier-ignore -->
```js
export let a = 1;           // pure
export let a = 1 << 1;      // maybe not pure (need constant folding)
export let a = {}; a.b = 1; // not pure
export function f() {}      // pure
```

</details>

<details><summary>2. Correctly export isomorphic modules.</summary>

```js
"exports": {
   "./module": {
      "node": "./module-node.js",
      "default": "./module.js" // bundlers will be happy to see this
   }
}
```

</details>

3. No fool-proofing checks, use typescript to call attention.

## License

MIT @ [hyrious](https://github.com/hyrious)
