import { spread, template, writable, combine } from "../src";

let $tpl = template("<div><input type=number>+<input type=number>=<output></output></div>");

let [$a, $b, $c] = spread<[HTMLInputElement, HTMLInputElement, HTMLOutputElement]>($tpl.children);
let [foo$, bar$] = [3, 5].map(writable);

const entries = [
  [foo$, $a],
  [bar$, $b],
] as const;

entries.forEach(([val$, $el]) => val$.subscribe((value) => ($el.value = String(value))));
combine([foo$, bar$]).subscribe((a) => ($c.textContent = "" + (a[0] + a[1])));

entries.forEach(([val$, $el]) => ($el.oninput = () => val$.set($el.valueAsNumber)));

document.body.append($tpl);
