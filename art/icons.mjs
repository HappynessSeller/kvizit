// Renders PNG app icons from icons/icon.svg (needs: npm i).
import sharp from 'sharp';
const src = new URL('../icons/icon.svg', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
for (const s of [180, 192, 512]) {
  await sharp(src, { density: 300 }).resize(s, s).png().toFile(src.replace('icon.svg', `icon-${s}.png`));
}
console.log('icons ok');
