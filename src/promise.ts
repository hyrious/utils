import { _ } from "./misc";

export async function go<T>(p: Promise<T>): Promise<[Awaited<T>, _] | [_, Error]> {
  try {
    return [await p, _];
  } catch (err) {
    return [_, err];
  }
}
