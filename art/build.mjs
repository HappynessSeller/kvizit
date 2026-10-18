// Writes the vector scenes to scenes/*.svg (the game loads these; variants are generated in the browser).
import { writeFileSync } from 'node:fs';

for (const id of ['mokki', 'ruska', 'revontulet', 'saaristo']) {
  const { default: generate } = await import(`./gen-${id}.mjs`);
  const svg = generate(0);
  writeFileSync(new URL(`../scenes/${id}.svg`, import.meta.url), svg);
  console.log(`${id}: ${(svg.length / 1024).toFixed(1)} KB`);
}
