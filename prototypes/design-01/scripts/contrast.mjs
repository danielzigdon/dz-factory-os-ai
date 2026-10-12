// WCAG contrast gate for Design Contract 03 tokens, driven by how the tokens are actually used in the source.
//   1. Every text-* token used in the code is checked against every opaque surface the app renders on (>= 4.5:1).
//   2. Every solid fill used behind text (bg-primary, bg-danger, bg-primary-hover via hover:) is checked with its label.
//   3. Every translucent fill found in the code (bg-x/NN) must have an explicit, passing check — unknown ones fail.
//   4. Interactive control boundaries (border-border-strong) and the focus ring must be >= 3:1 (WCAG 1.4.11).
//   5. No <input>/<select>/<textarea> may use the decorative `border-border` token.
// `border` (decorative separators) is reported for information only.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const css = readFileSync(join(root, "app/globals.css"), "utf8");
const tok = Object.fromEntries([...css.matchAll(/--color-([a-z-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2].toLowerCase()]));

const files = [];
const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (/\.tsx?$/.test(f)) files.push(p); } };
["app", "components"].forEach((d) => walk(join(root, d)));
const src = files.map((f) => readFileSync(f, "utf8")).join("\n");

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lum = (h) => { const c = hex(h).map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const over = (fg, alpha, bg) => "#" + hex(fg).map((c, i) => Math.round(c * alpha + hex(bg)[i] * (1 - alpha)).toString(16).padStart(2, "0")).join("");

const SURFACES = ["bg", "sidebar", "surface", "surface-raised"];
const rows = [];
const check = (label, fg, bg, min, gating = true) => rows.push({ label, r: ratio(fg, bg), min, gating });

// 1. text tokens actually used
const textToks = [...new Set([...src.matchAll(/\btext-(text-primary|text-secondary|primary|success|warning|danger|focus|bg)\b/g)].map((m) => m[1]))];
for (const t of textToks.filter((t) => t !== "bg")) for (const s of SURFACES) check(`text-${t} on ${s}`, tok[t], tok[s], 4.5);

// 2. solid fills behind text
const fills = [...new Set([...src.matchAll(/\b(?:hover:)?bg-(primary-hover|primary|danger|success|warning)\b(?!\/)/g)].map((m) => m[1]))];
for (const f of fills) check(`text-bg on bg-${f} (label)`, tok.bg, tok[f], 4.5);

// 3. translucent fills → explicit composite checks
const translucent = [...new Set([...src.matchAll(/\b(?:hover:)?bg-([a-z-]+)\/(\d+)\b/g)].map((m) => `${m[1]}/${m[2]}`))];
const KNOWN = {
  "primary/15": [["text-primary", "bg"], ["text-primary", "surface"]], // active filter chip
  "warning/10": [["warning", "bg"]],                                      // demo marker hover
  "bg/95": [["text-primary", "bg"]],                                      // sticky top bar
  "surface/90": [],                                                       // tab-scroll fade (decorative)
};
for (const t of translucent) {
  if (!(t in KNOWN)) { rows.push({ label: `UNCHECKED translucent fill bg-${t}`, r: 0, min: 1, gating: true }); continue; }
  const [name, a] = t.split("/");
  for (const [fg, base] of KNOWN[t]) check(`${fg} on bg-${t} over ${base}`, tok[fg], over(tok[name], +a / 100, tok[base]), 4.5);
}

// 4. non-text UI
for (const s of SURFACES) check(`border-strong (control boundary) vs ${s}`, tok["border-strong"], tok[s], 3);
for (const s of SURFACES) check(`focus ring vs ${s}`, tok.focus, tok[s], 3);
for (const s of SURFACES) check(`primary indicator (active nav / tab) vs ${s}`, tok.primary, tok[s], 3);
for (const s of SURFACES) check(`border (decorative separator) vs ${s} — info`, tok.border, tok[s], 3, false);

// 5. controls must not use the decorative border
const offenders = [];
for (const f of files) readFileSync(f, "utf8").split("\n").forEach((l, i) => {
  if (/<(input|select|textarea)\b/.test(l) && /\bborder-border\b(?!-)/.test(l)) offenders.push(`${f.replace(root, "")}:${i + 1}`);
});
rows.push({ label: `controls using decorative border: ${offenders.join(", ") || "none"}`, r: offenders.length ? 0 : Infinity, min: 1, gating: true });

let fail = 0;
for (const { label, r, min, gating } of rows) {
  const ok = r >= min;
  if (!ok && gating) fail++;
  const tag = ok ? "PASS" : gating ? "FAIL" : "INFO";
  console.log(`${tag}  ${label.padEnd(58)} ${Number.isFinite(r) ? r.toFixed(2).padStart(5) + ":1" : "     -"}  (min ${min})`);
}
const gated = rows.filter((r) => r.gating).length;
console.log(`\n${gated - fail}/${gated} gating checks pass · ${rows.length - gated} informational`);
process.exit(fail ? 1 : 0);
