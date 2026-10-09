import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export function drawingSvg(name, drawing, ink = '#1D1D1B', accent = '#FEE951') {
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
  if (!/^#[0-9a-f]{6}$/i.test(ink) || !/^#[0-9a-f]{6}$/i.test(accent)) throw new Error('Colors must be six-digit hex values.');
  const [w, h] = drawing.box;
  if (!(w > 0 && h > 0)) throw new Error('Invalid drawing bounds.');
  const paint = (paths, fill) => paths.map(d => `<path d="${escape(d)}" fill="${fill}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img"><title>${escape(name)}</title><g data-role="accent">${paint(drawing.accent ?? [], accent)}</g><g data-role="ink">${paint(drawing.ink, ink)}</g></svg>\n`;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [name, ...args] = process.argv.slice(2);
    const options = {};
    for (let i = 0; i < args.length; i += 2) {
      if (!['--theme', '--ink', '--accent', '--output'].includes(args[i]) || !args[i + 1]) throw new Error('Unknown or incomplete option.');
      options[args[i].slice(2)] = args[i + 1];
    }
    const drawings = JSON.parse(readFileSync(new URL('../assets/illustrations.json', import.meta.url), 'utf8'));
    if (!drawings[name]) throw new Error(`Choose an illustration from: ${Object.keys(drawings).join(', ')}`);
    if (options.theme && !['light', 'dark'].includes(options.theme)) throw new Error('Theme must be light or dark.');
    const svg = drawingSvg(name, drawings[name], options.ink ?? (options.theme === 'dark' ? '#F2F2ED' : '#1D1D1B'), options.accent ?? '#FEE951');
    if (options.output) writeFileSync(options.output, svg); else process.stdout.write(svg);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
