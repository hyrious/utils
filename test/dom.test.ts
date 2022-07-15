import { test, expect, vi } from "vitest";
import { batch, tick } from "../src/dom";

test("batch", async () => {
  const flush = vi.fn();
  const schedule = batch(flush);
  for (let i = 0; i < 10; i++) {
    schedule();
  }
  expect(flush).toHaveBeenCalledTimes(0);
  await tick();
  expect(flush).toHaveBeenCalledTimes(1);
});
