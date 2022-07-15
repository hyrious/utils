/**
 * Borrow from Solid JS, use with caution! (it uses `innerHTML`)
 * @example
 * let $btn = template(`<button></button>`)
 * let count$ = writable(0)
 * count$.subscribe(count => { $btn.textContent = count })
 * $btn.onclick = () => update(count$, a => a + 1)
 */
export function template(html: string, isSVG?: boolean): Element {
  const t = document.createElement("template");
  t.innerHTML = html;
  let node = t.content.firstChild;
  if (isSVG) node = node!.firstChild;
  return node as Element;
}

/**
 * Borrow from Svelte.
 * @example
 * let $btn = element('button')
 * let count$ = writable(0)
 * count$.subscribe(count => { $btn.textContent = count })
 * $btn.onclick = () => update(count$, a => a + 1)
 */
export function element<T extends keyof HTMLElementTagNameMap>(tag: T) {
  return document.createElement(tag);
}

export function svg<T extends keyof SVGElementTagNameMap>(tag: T) {
  return document.createElementNS("http://www.w3.org/2000/svg", tag);
}

const resolved_promise = /* @__PURE__ */ Promise.resolve();
export function tick() {
  return resolved_promise;
}

/**
 * @example
 * const scheduleUpdate = batch(rerender)
 * scheduleUpdate()
 * scheduleUpdate()
 * expect(rerender).toBeCalledTimes(1)
 */
export function batch(impl: () => void): () => void {
  let scheduled = false;
  function flush() {
    scheduled = false;
    impl();
  }
  return function scheduleUpdate() {
    if (!scheduled) {
      scheduled = true;
      resolved_promise.then(flush);
    }
  };
}
