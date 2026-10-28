// WCAG contrast gate for the selected forest-green company website direction.
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const html = readFileSync(join(root, "public/company-preview/index.html"), "utf8");
const css = html.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? "";
const rootBlock = css.match(/:root\{([^}]+)\}/)?.[1] ?? "";
const tokens = Object.fromEntries([...rootBlock.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2].toLowerCase()]));

const luminance = (color) => {
  const channels = color.slice(1).match(/.{2}/g).map((v) => parseInt(v, 16) / 255)
    .map((v) => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};
const ratio = (a, b) => {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
};
const rows = [];
const check = (label, fg, bg, min = 4.5) => rows.push({ label, min, value: ratio(fg, bg) });

for (const name of ["ink", "muted", "night", "green", "paper"]) {
  if (!tokens[name]) throw new Error("Missing website palette token --" + name);
}

check("body text on warm paper", tokens.ink, tokens.paper);
check("secondary text on warm paper", tokens.muted, tokens.paper);
check("hero copy on forest background", "#ffffff", tokens.night);
check("hero accent on forest background", tokens.green, tokens.night);
check("dark CTA label on lime CTA", "#172c21", tokens.green);
check("story copy on pale green section", "#43574c", "#e7ede5");

const focusRule = css.match(/(?:a|button|input|select|textarea|summary):focus-visible\{([^}]+)\}/)?.[1] ?? "";
const expectedFocus = "outline:3px solid #f5f5ef;outline-offset:3px;box-shadow:0 0 0 6px #10272b";
if (!focusRule.includes(expectedFocus)) throw new Error("Website focus indicator must keep the two-tone light/dark ring");
check("light focus ring on forest sections", "#f5f5ef", tokens.night, 3);
check("dark focus ring on warm paper", tokens.night, tokens.paper, 3);
check("dark focus ring on pale green section", tokens.night, "#e7ede5", 3);

const options = readFileSync(join(root, "public/company-preview/design-options.html"), "utf8");
const greenFocusRule = options.match(/#d1 :focus-visible\{([^}]+)\}/)?.[1] ?? "";
if (!greenFocusRule.includes("outline:3px solid #f5f4ed") || !greenFocusRule.includes("box-shadow:0 0 0 6px #101a17")) {
  throw new Error("Selected dark-green sketch needs a two-tone keyboard-focus ring");
}
check("selected sketch 1: CTA label", "#132116", "#b7d982");
check("selected sketch 1: eyebrow on hero", "#a9d77e", "#071310");
check("selected sketch 1: light focus ring on forest", "#f5f4ed", "#101a17", 3);

let failures = 0;
for (const { label, min, value } of rows) {
  const pass = value >= min;
  if (!pass) failures++;
  console.log((pass ? "PASS" : "FAIL") + " " + label.padEnd(48) + " " + value.toFixed(2) + ":1 (min " + min + ")");
}
console.log("\n" + (rows.length - failures) + "/" + rows.length + " website contrast checks pass");
process.exit(failures ? 1 : 0);
