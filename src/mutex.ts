/**
 * Borrow from lib0/mutex.
 * @example
 * const mux = mutex()
 * mux(() => {
 *   // do something
 *   mux(() => {
 *     // cannot do anything
 *   }, () => {
 *     // fallback if cannot do something
 *   })
 * })
 */
export function mutex() {
  let token = true;
  return (f: () => void, g?: () => void) => {
    if (token) {
      token = false;
      try {
        f();
      } finally {
        token = true;
      }
    } else if (g) {
      g();
    }
  };
}
