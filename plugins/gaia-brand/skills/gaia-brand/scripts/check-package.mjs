import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, relative, extname } from 'node:path';
import { drawingSvg } from './render-illustration.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
function walk(dir) {
  return readdirSync(dir).flatMap(name => {
    const path = resolve(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}
const manifest = JSON.parse(readFileSync(resolve(root, 'assets/manifest.json')));
for (const [name, expected] of Object.entries(manifest.sha256)) {
  const path = resolve(root, name);
  assert(path.startsWith(root + '/'), `Resource outside skill: ${name}`);
  const actual = createHash('sha256').update(readFileSync(path)).digest('hex');
  assert.equal(actual, expected, `Changed resource: ${name}`);
}
const tokens = JSON.parse(readFileSync(resolve(root, 'assets/tokens.json')));
assert.equal(tokens.themes.light.surface, '#DBDBCF');
assert.equal(tokens.themes.dark.textPrimary, '#F2F2ED');
assert.deepEqual(Object.values(tokens.typography.fontSize), [11, 14, 15, 20, 24, 26, 64]);
assert.equal(tokens.layout.radius.lg, 24);
for (const family of ['figtree', 'inter']) assert(existsSync(resolve(root, `assets/fonts/${family}-OFL.txt`)));
const drawings = JSON.parse(readFileSync(resolve(root, 'assets/illustrations.json')));
for (const [name, drawing] of Object.entries(drawings)) {
  const svg = readFileSync(resolve(root, manifest.illustrations[name]), 'utf8');
  assert.equal(svg, drawingSvg(name, drawing), `SVG/data mismatch: ${name}`);
  assert(!svg.includes('stroke-width'), `Traced art given a stroke: ${name}`);
  assert(svg.indexOf('data-role="accent"') < svg.indexOf('data-role="ink"'));
  const dark = drawingSvg(name, drawing, tokens.themes.dark.textPrimary);
  assert(dark.includes('#F2F2ED') && dark.includes('#FEE951'));
}
for (const name of Object.values(manifest.activities)) assert(drawings[name], `Missing activity drawing: ${name}`);
for (const file of walk(root)) {
  const ext = extname(file);
  if (!['.md', '.mjs', '.json', '.yaml', '.html', '.css', '.svg'].includes(ext)) continue;
  const content = readFileSync(file, 'utf8');
  const privateFragments = ['/Users/' + 'adamperlis', 'gaia-support-' + '2026', '-----BEGIN ' + 'PRIVATE KEY-----', 'sk_' + 'live_'];
  for (const fragment of privateFragments) assert(!content.includes(fragment), `Possible private material: ${relative(root, file)}`);
  if (ext === '.md') {
    for (const match of content.matchAll(/\]\(([^)]+)\)/g)) {
      const link = match[1];
      if (/^(https?:|#|mailto:)/.test(link)) continue;
      const target = resolve(dirname(file), link.split('#')[0]);
      assert(target.startsWith(root + '/') && existsSync(target), `Broken local link: ${link} in ${relative(root, file)}`);
    }
  }
}
const actualResources = walk(resolve(root, 'assets')).map(file => relative(root, file)).filter(name => name !== 'assets/manifest.json');
assert.deepEqual(actualResources.sort(), Object.keys(manifest.sha256).sort(), 'Unlisted or missing assets.');
process.stdout.write(`Package OK: ${Object.keys(drawings).length} illustrations, 8 activity mappings, 2 themes, ${actualResources.length} verified assets.\n`);
