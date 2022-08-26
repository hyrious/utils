const decoder = /* @__PURE__ */ new TextDecoder();
export function decode(buffer: Uint8Array) {
  return decoder.decode(buffer);
}

const encoder = /* @__PURE__ */ new TextEncoder();
export function encode(string: string) {
  return encoder.encode(string);
}

/**
 * ```js
 * hash('') // 0
 * hash('a') // 97
 * hash('ab') // 3135
 * ```
 */
export function hash(s: string): number {
  for (var i = s.length - 1, h = 0; i >= 0; --i) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h;
}

export function slash(s: string) {
  return s.replace(/\\/g, "/");
}
