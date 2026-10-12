// WCAG contrast check for the Design Contract 03 token pairs actually used in the prototype.
import { readFileSync } from "node:fs";
const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const tok = Object.fromEntries([...css.matchAll(/--color-([a-z-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]));
const lum = (hex) => { const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
// [foreground, background, minimum, usage]
const pairs = [];
for (const bg of ["bg", "sidebar", "surface", "surface-raised"]) {
  pairs.push(["text-primary", bg, 4.5, "body text"], ["text-secondary", bg, 4.5, "metadata"]);
  for (const s of ["success", "warning", "danger", "focus"]) pairs.push([s, bg, 4.5, "status text / focus"]);
  pairs.push(["primary", bg, 3, "active nav marker, icons (non-text)"], ["border", bg, 3, "input/control boundary (WCAG 1.4.11, contract §2)"]);
}
pairs.push(["bg", "primary", 4.5, "primary button label"], ["bg", "primary-hover", 4.5, "primary button label :hover"], ["bg", "danger", 4.5, "notification count"], ["focus", "bg", 3, "focus ring"]);
let fail = 0;
for (const [fg, bg, min, use] of pairs) {
  const r = ratio(tok[fg], tok[bg]);
  const ok = r >= min;
  if (!ok) fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${fg.padEnd(15)} on ${bg.padEnd(15)} ${r.toFixed(2).padStart(5)}:1  (min ${min})  ${use}`);
}
console.log(`\n${pairs.length - fail}/${pairs.length} pairs pass`);
process.exit(fail ? 1 : 0);
