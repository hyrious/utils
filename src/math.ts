import { _ } from "./misc";

export const pow = Math.pow;
export const random = Math.random;

export function clamp(x: number, min: number, max: number) {
  return x < min ? min : x > max ? max : x;
}

/** `max` is exclusive */
export function rand(max?: number): number {
  return max !== _ ? (random() * max) | 0 : random();
}
