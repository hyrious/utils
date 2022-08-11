import { $, Readable, writable } from "../src";

const count$ = writable([0]);
function increment() {
  count$.value[0]++;
  count$.set(count$.value);
}

import { useSyncExternalStore } from "react";

// Note about how 'useSyncExternalStore' works:
// subscribe() tells react that the value MIGHT be changed, the value doesn't matter
// getSnapshot() actually reads the value and compare it (Object.is) in react
// if it is actually changed, react triggers a refresh
//
// Trap:
// params are all functions, you have to memorize them (like hoisting) by yourself
// if the subscribe function reference changes, react will force refresh one more time
function reactive<T, V = T>(val$: Readable<T>, selector?: (t: T) => V) {
  const subscribe = val$.subscribe.bind(val$);
  const getSnapshot = selector ? () => selector(val$.value) : () => val$.value as unknown as V;
  return function useStore(): V {
    return useSyncExternalStore(subscribe, getSnapshot);
  };
}

const useCount = reactive(count$, (a) => a[0]);

function App() {
  const count = useCount();
  console.log("render App", count);
  return <button onClick={increment}>{count}</button>;
}

import { createRoot } from "react-dom/client";

createRoot($("#app")!).render(<App />);
