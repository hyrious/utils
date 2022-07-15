const decoder = /* @__PURE__ */ new TextDecoder();
export function decode(buffer: Uint8Array) {
  return decoder.decode(buffer);
}

const encoder = /* @__PURE__ */ new TextEncoder();
export function encode(string: string) {
  return encoder.encode(string);
}
