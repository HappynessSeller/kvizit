// Writes the vector scenes to scenes/*.svg (the game loads these; variants are generated in the browser),
// then checks the original and a spread of variants for see-through holes and untappable / confetti areas.
import { writeFileSync } from 'node:fs';
import { checkScene } from './check.mjs';

const VARIANTS = [0, 1, 2, 3, 4, 5, 6, 7];
let failed = 0;
for (const id of ['mokki', 'ruska', 'revontulet', 'saaristo']) {
  const { default: generate } = await import(`./gen-${id}.mjs`);
  const svg = generate(0);
  writeFileSync(new URL(`../scenes/${id}.svg`, import.meta.url), svg);
  console.log(`${id}: ${(svg.length / 1024).toFixed(1)} KB`);
  for (const v of VARIANTS) {
    const problems = await checkScene(v ? generate(v) : svg);
    for (const p of problems) console.error(`  ✗ ${id} variant ${v}: ${p}`);
    failed += problems.length;
  }
}
if (failed) {
  console.error(`${failed} scene check(s) failed`);
  process.exit(1);
}
console.log(`scene checks passed (variants ${VARIANTS.join(', ')})`);
