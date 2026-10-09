// Gaia app demo. Reads the skill's assets at runtime so drawings and tokens stay in sync
// with plugins/gaia-brand/skills/gaia-brand. All records are synthetic and stay in this browser.

const ASSETS = '../skills/gaia-brand/assets/';
const STORE_KEY = 'gaia-demo-v1';
const PREFS_KEY = 'gaia-demo-prefs-v1';
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

const [drawings, manifest] = await Promise.all([
  fetch(ASSETS + 'illustrations.json').then(r => r.json()),
  fetch(ASSETS + 'manifest.json').then(r => r.json()),
]);

// Activity → drawing mapping comes from the skill's manifest.
const ACTIVITIES = {
  feeding:   { title: 'Feeding',    verb: 'Save feed' },
  sleep:     { title: 'Sleep',      verb: 'Save nap' },
  diaper:    { title: 'Diaper',     verb: 'Save diaper' },
  pumping:   { title: 'Pumping',    verb: 'Save session' },
  tummy_time: { title: 'Tummy time', verb: 'Save tummy time' },
  growth:    { title: 'Growth',     verb: 'Save measurement' },
  health:    { title: 'Health',     verb: 'Save reading' },
  milestone: { title: 'Milestones', verb: 'Save milestone' },
};
const drawingFor = kind => manifest.activities[kind];

/* ---------- storage (best effort; the demo works without it) ---------- */
const load = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode */ } };

/* ---------- synthetic fixture ---------- */
function seed() {
  const now = Date.now();
  const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
  const records = [];
  let rand = 7;
  const r = () => (rand = (rand * 16807) % 2147483647) / 2147483647;
  for (let d = 6; d >= 0; d--) {
    const base = startOfToday.getTime() - d * DAY;
    // Feeds roughly every 3h from 6am
    for (let h = 2; h < 24; h += 2.6 + r() * 0.9) {
      const at = base + h * HOUR;
      if (at > now - 40 * MIN) break;
      records.push({ id: crypto.randomUUID(), kind: 'feeding', at, type: r() > 0.3 ? 'Bottle' : 'Breast', amount: Math.round((100 + r() * 50) / 5) * 5 });
    }
    // Naps
    for (const h of [9.2, 12.8, 16.1]) {
      const at = base + (h + (r() - 0.5) * 0.6) * HOUR;
      const end = at + (40 + r() * 70) * MIN;
      if (end > now) continue;
      records.push({ id: crypto.randomUUID(), kind: 'sleep', at, end });
    }
    // Diapers
    for (let h = 3; h < 24; h += 3 + r() * 1.5) {
      const at = base + h * HOUR;
      if (at > now) break;
      records.push({ id: crypto.randomUUID(), kind: 'diaper', at, type: ['Wet', 'Wet', 'Dirty', 'Both'][Math.floor(r() * 4)] });
    }
    if (base + 11 * HOUR < now) records.push({ id: crypto.randomUUID(), kind: 'tummy_time', at: base + 11 * HOUR, minutes: 5 + Math.round(r() * 10) });
  }
  // Weekly weights for growth (child's own measurements only)
  for (let w = 8; w >= 0; w--) {
    records.push({ id: crypto.randomUUID(), kind: 'growth', at: startOfToday.getTime() - w * 7 * DAY + 10 * HOUR, weight: +(5.1 + (8 - w) * 0.16 + (r() - 0.5) * 0.06).toFixed(2), length: +(58 + (8 - w) * 0.7).toFixed(1) });
  }
  records.push({ id: crypto.randomUUID(), kind: 'milestone', at: startOfToday.getTime() - 3 * DAY + 15 * HOUR, note: 'Rolled from tummy to back' });
  return { child: { name: 'Wren', born: startOfToday.getTime() - 137 * DAY }, featured: 'feeding', records, timer: null };
}

let state = load(STORE_KEY, null) ?? seed();
let prefs = load(PREFS_KEY, { theme: 'system', motion: 'system' });
let tab = 'activity';
let historyDay = startOfDay(Date.now());
const persist = () => save(STORE_KEY, state);

/* ---------- helpers ---------- */
function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v === true ? '' : v);
  }
  for (const child of children.flat()) if (child != null && child !== false) node.append(child.nodeType ? child : document.createTextNode(child));
  return node;
}
const SVG_NS = 'http://www.w3.org/2000/svg';
function svg(tag, attrs = {}, ...children) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) node.setAttribute(k, v);
  node.append(...children.flat().filter(Boolean));
  return node;
}

// Inline the traced drawing so ink follows the theme. Accent first, ink above (rendering contract).
function art(name, size, label) {
  const d = drawings[name];
  const s = svg('svg', { viewBox: `0 0 ${d.box[0]} ${d.box[1]}`, 'aria-hidden': label ? null : 'true', role: label ? 'img' : null, 'aria-label': label ?? null },
    svg('g', { class: 'accent' }, (d.accent ?? []).map(p => svg('path', { d: p }))),
    svg('g', { class: 'ink' }, d.ink.map(p => svg('path', { d: p }))));
  return el('span', { class: 'art', style: size ? `width:${size}px;height:${size}px` : null }, s);
}

// Functional glyphs stay clean and conventional.
const GLYPHS = {
  plus: 'M12 5v14M5 12h14',
  stop: 'M8 8h8v8H8z',
  edit: 'M4 7h10M4 12h6M4 17h10M17 10l3 3-3 3',
  close: 'M6 6l12 12M18 6L6 18',
  left: 'M15 6l-6 6 6 6',
  right: 'M9 6l6 6-6 6',
  activity: 'M4 5h6v6H4zM14 5h6v6h-6zM4 15h6v6H4zM14 15h6v6h-6z',
  history: 'M12 7v5l3 2M3.5 12a8.5 8.5 0 1 0 2.5-6M3 4v4h4',
  trends: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  growth: 'M12 21V10M12 10c0-4 3-6 7-6 0 4-3 6-7 6zM12 14c0-3-2.5-5-6-5 0 3 2.5 5 6 5z',
  account: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1-4 4.5-6 8-6s7 2 8 6',
};
const glyph = (name, cls = 'glyph') => svg('svg', { viewBox: '0 0 24 24', class: cls, 'aria-hidden': 'true', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg('path', { d: GLYPHS[name] }));

function startOfDay(t) { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); }
const timeFmt = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
const dayFmt = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
const shortDay = new Intl.DateTimeFormat(undefined, { weekday: 'narrow' });
const dateFmt = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });

function duration(ms) {
  const m = Math.max(0, Math.round(ms / MIN));
  const h = Math.floor(m / 60);
  return h ? `${h}h ${m % 60}m` : `${m}m`;
}
function ago(t) {
  const ms = Date.now() - t;
  if (ms < MIN) return 'Just now';
  if (ms >= DAY) { const d = Math.floor(ms / DAY); return d === 1 ? 'Yesterday' : `${d} days ago`; }
  return `${duration(ms)} ago`;
}
function clock(ms) {
  const s = Math.floor(ms / 1000);
  return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map((n, i) => i ? String(n).padStart(2, '0') : n).join(':');
}
function age(born) {
  const days = Math.floor((Date.now() - born) / DAY);
  const months = Math.floor(days / 30.44);
  const weeks = Math.floor((days - months * 30.44) / 7);
  return `${months} month${months === 1 ? '' : 's'}${weeks ? `, ${weeks} week${weeks === 1 ? '' : 's'}` : ''}`;
}
const latest = kind => state.records.filter(r => r.kind === kind).sort((a, b) => b.at - a.at)[0];

function summary(r) {
  switch (r.kind) {
    case 'feeding': return r.amount ? `${r.type} · ${r.amount} ml` : r.type;
    case 'sleep': return r.end ? duration(r.end - r.at) : 'Sleeping';
    case 'diaper': return r.type;
    case 'pumping': return `${r.amount} ml`;
    case 'tummy_time': return `${r.minutes} min`;
    case 'growth': return [r.weight && `${r.weight} kg`, r.length && `${r.length} cm`].filter(Boolean).join(' · ');
    case 'health': return [r.temp && `${r.temp} °C`, r.note].filter(Boolean).join(' · ');
    case 'milestone': return r.note;
  }
}

function toast(message) {
  const t = document.getElementById('toast');
  t.textContent = message; t.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => (t.hidden = true), 2600);
}

/* ---------- theme & motion ---------- */
const media = { dark: matchMedia('(prefers-color-scheme: dark)'), reduce: matchMedia('(prefers-reduced-motion: reduce)') };
function applyPrefs() {
  const theme = prefs.theme === 'system' ? (media.dark.matches ? 'dark' : 'light') : prefs.theme;
  document.documentElement.dataset.gaiaTheme = theme;
  document.documentElement.dataset.motion = (prefs.motion === 'reduced' || (prefs.motion === 'system' && media.reduce.matches)) ? 'reduced' : 'full';
}
media.dark.addEventListener('change', () => { applyPrefs(); render(); });
media.reduce.addEventListener('change', applyPrefs);

/* ---------- screens ---------- */
const screens = {
  activity() {
    const { child, featured } = state;
    const header = el('header', { class: 'header' },
      el('div', { class: 'who' },
        el('span', { class: 'demo-chip overline' }, 'Demo data'),
        el('h1', { class: 'screen-title', style: 'margin-top:8px' }, child.name),
        el('p', { class: 'label' }, age(child.born))),
      el('button', { class: 'icon-btn', 'aria-label': 'Edit layout', onclick: openLayoutSheet }, glyph('edit')));

    const others = Object.keys(ACTIVITIES).filter(k => k !== featured);
    return [header, featuredCard(featured), el('div', { class: 'grid' }, others.map(tile))];
  },

  history() {
    const dayEnd = historyDay + DAY;
    const items = state.records.filter(r => r.at >= historyDay && r.at < dayEnd).sort((a, b) => b.at - a.at);
    const isToday = historyDay === startOfDay(Date.now());
    const bar = el('div', { class: 'daybar' },
      el('button', { class: 'icon-btn', 'aria-label': 'Previous day', onclick: () => { historyDay = startOfDay(historyDay - DAY / 2); render(); } }, glyph('left')),
      el('span', { class: 'value' }, isToday ? 'Today' : dayFmt.format(historyDay)),
      el('button', { class: 'icon-btn', 'aria-label': 'Next day', disabled: isToday, style: isToday ? 'opacity:.3' : null, onclick: () => { historyDay = startOfDay(historyDay + DAY * 1.5); render(); } }, glyph('right')));
    const body = items.length
      ? el('ul', { class: 'list' }, items.map(r => el('li', {},
          art(drawingFor(r.kind), 28),
          el('div', { class: 'what' }, el('p', { class: 'value' }, ACTIVITIES[r.kind].title), el('p', { class: 'label' }, summary(r))),
          el('time', { datetime: new Date(r.at).toISOString() }, timeFmt.format(r.at)))))
      : el('div', { class: 'card empty' }, art('babySleepingCurledUp', 96), el('p', { class: 'value' }, 'Nothing logged for this day yet.'));
    return [el('h1', { class: 'screen-title' }, 'History'), el('p', { class: 'label', style: 'margin:4px 0 0' }, 'The whole day, in order.'), bar, body];
  },

  trends() {
    const today = startOfDay(Date.now());
    const days = Array.from({ length: 7 }, (_, i) => today - (6 - i) * DAY);
    const feeds = days.map(d => state.records.filter(r => r.kind === 'feeding' && r.at >= d && r.at < d + DAY).length);
    const sleep = days.map(d => state.records.filter(r => r.kind === 'sleep' && r.end && r.at >= d && r.at < d + DAY).reduce((s, r) => s + (r.end - r.at), 0));
    const avgFeeds = feeds.slice(0, 6).reduce((a, b) => a + b, 0) / 6;
    const avgSleep = sleep.slice(0, 6).reduce((a, b) => a + b, 0) / 6;
    return [
      el('h1', { class: 'screen-title' }, 'Trends'),
      el('p', { class: 'label', style: 'margin:4px 0 24px' }, 'Patterns without targets.'),
      el('div', { class: 'stack' },
        trendCard('bottle', 'Feeds per day', barChart(days, feeds, v => String(v)),
          [['Today', String(feeds[6]), ''], ['Daily avg', avgFeeds.toFixed(1), ''], ['Since last', latest('feeding') ? duration(Date.now() - latest('feeding').at) : '—', '']]),
        trendCard('moon', 'Daytime naps', barChart(days, sleep.map(ms => ms / HOUR), v => v ? duration(v * HOUR) : ''),
          [['Today', duration(sleep[6]), ''], ['Daily avg', duration(avgSleep), ''], ['Naps today', String(state.records.filter(r => r.kind === 'sleep' && r.at >= today).length), '']])),
      el('p', { class: 'notice', style: 'margin-top:16px' }, 'Counts come from the synthetic log on this device. Bars show totals per calendar day; today is still in progress.'),
    ];
  },

  growth() {
    const items = state.records.filter(r => r.kind === 'growth').sort((a, b) => a.at - b.at);
    const lastW = items.filter(r => r.weight).at(-1);
    const lastL = items.filter(r => r.length).at(-1);
    return [
      el('h1', { class: 'screen-title' }, 'Growth'),
      el('p', { class: 'label', style: 'margin:4px 0 24px' }, 'Measurements in context.'),
      el('div', { class: 'card card-press' },
        el('div', { style: 'display:flex;justify-content:space-between;align-items:flex-start;gap:12px' },
          el('div', {},
            el('p', { class: 'overline', style: 'margin:0 0 8px' }, 'Weight'),
            el('div', { style: 'display:flex;align-items:baseline;gap:6px' }, el('span', { class: 'figure' }, lastW ? String(lastW.weight) : '—'), el('span', { class: 'unit' }, 'kg')),
            lastW && el('p', { class: 'label', style: 'margin:8px 0 0' }, `Measured ${dateFmt.format(lastW.at)}`)),
          art('scale', 56)),
        el('div', { class: 'result' }, lineChart(items.filter(r => r.weight))),
        el('div', { class: 'stats' },
          stat('Length', lastL ? `${lastL.length}` : '—', 'cm'),
          stat('Entries', String(items.length), ''),
          stat('Since first', lastW && items[0]?.weight ? `+${(lastW.weight - items[0].weight).toFixed(2)}` : '—', 'kg'))),
      el('p', { class: 'notice', style: 'margin-top:16px' }, 'This demo plots Wren’s own measurements only. WHO reference percentiles need the real reference data and aren’t drawn here.'),
      el('button', { class: 'btn btn-primary btn-block', style: 'margin-top:24px', onclick: () => openLogSheet('growth') }, glyph('plus'), 'Add measurement'),
    ];
  },

  account() {
    const theme = document.documentElement.dataset.gaiaTheme;
    const choice = (key, value, label) => el('button', { class: 'pill', 'aria-pressed': String(prefs[key] === value), onclick: () => { prefs[key] = value; save(PREFS_KEY, prefs); applyPrefs(); render(); } }, label);
    return [
      el('img', { class: 'wordmark', src: ASSETS + (theme === 'dark' ? 'gaia-wordmark-dark.svg' : 'gaia-wordmark.svg'), alt: 'Gaia' }),
      el('h1', { class: 'screen-title', style: 'margin-top:24px' }, 'Account'),
      el('div', { class: 'card', style: 'margin-top:24px' },
        el('div', { class: 'setting' }, el('span', { class: 'value' }, 'Appearance'),
          el('div', { class: 'pills' }, choice('theme', 'system', 'System'), choice('theme', 'light', 'Light'), choice('theme', 'dark', 'Dark'))),
        el('div', { class: 'setting' }, el('span', { class: 'value' }, 'Reduce motion'),
          el('div', { class: 'pills' }, choice('motion', 'system', 'System'), choice('motion', 'reduced', 'On'), choice('motion', 'full', 'Off')))),
      el('div', { class: 'group card' },
        el('div', { style: 'display:flex;gap:16px;align-items:center' }, art('twoParentsHoldingABabyBetweenThem', 72),
          el('p', { class: 'notice' }, 'Everyone sees the same baby log. Sharing isn’t part of this demo; records stay in this browser.')),
        el('button', { class: 'btn btn-secondary btn-block', style: 'margin-top:20px', onclick: () => { state = seed(); persist(); toast('Demo data reset.'); render(); } }, 'Reset demo data')),
      el('p', { class: 'notice', style: 'margin-top:24px' }, 'Prototype built from the gaia-brand skill. Gaia’s logos, illustrations and tokens remain reserved; see the skill’s LICENSE.md.'),
    ];
  },
};

function featuredCard(kind) {
  const last = latest(kind);
  const running = kind === 'sleep' && state.timer;
  return el('article', { class: 'card featured card-press', 'aria-label': ACTIVITIES[kind].title },
    el('div', { class: 'row' }, art(drawingFor(kind), 88), addButton(kind)),
    el('div', { class: 'meta' },
      el('h2', { class: 'card-title' }, ACTIVITIES[kind].title),
      running ? el('p', { class: 'clock', 'data-clock': '' }, clock(Date.now() - state.timer.start))
        : el('p', { class: 'label' }, last ? `${ago(last.at)} · ${summary(last)}` : 'Nothing logged yet')),
    kind === 'feeding' && el('div', { class: 'pills', 'aria-label': 'Today' },
      el('span', { class: 'demo-chip value' }, `${state.records.filter(r => r.kind === 'feeding' && r.at >= startOfDay(Date.now())).length} feeds today`),
      el('span', { class: 'demo-chip value' }, `${state.records.filter(r => r.kind === 'feeding' && r.at >= startOfDay(Date.now())).reduce((s, r) => s + (r.amount || 0), 0)} ml`)));
}

function tile(kind) {
  const last = latest(kind);
  const running = kind === 'sleep' && state.timer;
  return el('article', { class: 'card tile card-press', 'aria-label': ACTIVITIES[kind].title },
    el('div', { class: 'row' }, art(drawingFor(kind), 56), addButton(kind)),
    el('div', { class: 'meta' },
      el('h3', { class: 'value', style: 'margin:0;font-size:15px' }, ACTIVITIES[kind].title),
      running ? el('p', { class: 'clock', 'data-clock': '' }, clock(Date.now() - state.timer.start))
        : el('p', { class: 'label' }, last ? ago(last.at) : 'Nothing yet')));
}

function addButton(kind) {
  const running = kind === 'sleep' && state.timer;
  if (running) return el('button', { class: 'add running', 'aria-label': 'Stop nap timer', onclick: stopTimer }, glyph('stop'));
  return el('button', { class: 'add', 'aria-label': `Log ${ACTIVITIES[kind].title.toLowerCase()}`, onclick: () => openLogSheet(kind) }, glyph('plus'));
}

function trendCard(drawing, title, chart, stats) {
  return el('section', { class: 'card' },
    el('div', { style: 'display:flex;gap:12px;align-items:center' }, art(drawing, 32), el('h2', { class: 'card-title' }, title)),
    el('div', { class: 'result' }, chart),
    el('div', { class: 'stats' }, stats.map(([l, v, u]) => stat(l, v, u))));
}
const stat = (label, value, unit) => el('div', {}, el('span', { class: 'label' }, label), el('span', {}, el('span', { class: 'figure-2' }, value), unit ? el('span', { class: 'unit' }, ` ${unit}`) : null));

function barChart(days, values, fmt) {
  const W = 320, H = 150, top = 18, bottom = 22, n = values.length, slot = W / n, bw = Math.min(26, slot * 0.56);
  const max = Math.max(...values, 1);
  const s = svg('svg', { class: 'chart', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': days.map((d, i) => `${dayFmt.format(d)}: ${fmt(values[i]) || 'none'}`).join('; ') });
  values.forEach((v, i) => {
    const x = i * slot + (slot - bw) / 2, h = (H - top - bottom) * (v / max), y = H - bottom - h;
    s.append(svg('rect', { class: 'track', x, y: top, width: bw, height: H - top - bottom, rx: bw / 2 }));
    if (v) s.append(svg('rect', { class: 'mark bar', x, y, width: bw, height: h, rx: bw / 2, style: `animation-delay:${i * 40}ms` }));
    if (i === n - 1 && v) s.append(svg('text', { class: 'val', x: x + bw / 2, y: y - 6, 'text-anchor': 'middle' }, fmt(v)));
    s.append(svg('text', { x: x + bw / 2, y: H - 4, 'text-anchor': 'middle' }, i === n - 1 ? 'Today' : shortDay.format(days[i])));
  });
  return s;
}

function lineChart(points) {
  const W = 320, H = 140, pad = { l: 34, r: 8, t: 12, b: 22 };
  if (points.length < 2) return el('p', { class: 'label' }, 'Add two measurements to see a line.');
  const xs = points.map(p => p.at), ys = points.map(p => p.weight);
  const [x0, x1] = [Math.min(...xs), Math.max(...xs)];
  const [y0, y1] = [Math.floor(Math.min(...ys) * 2) / 2, Math.ceil(Math.max(...ys) * 2) / 2];
  const X = t => pad.l + (W - pad.l - pad.r) * (t - x0) / (x1 - x0 || 1);
  const Y = v => H - pad.b - (H - pad.t - pad.b) * (v - y0) / (y1 - y0 || 1);
  const s = svg('svg', { class: 'chart', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': `Weight from ${ys[0]} kg to ${ys.at(-1)} kg between ${dateFmt.format(x0)} and ${dateFmt.format(x1)}` });
  for (let v = y0; v <= y1 + 1e-9; v += 0.5) {
    s.append(svg('rect', { class: 'track', x: pad.l, y: Y(v) - 0.5, width: W - pad.l - pad.r, height: 1 }));
    s.append(svg('text', { x: pad.l - 6, y: Y(v) + 4, 'text-anchor': 'end' }, `${v.toFixed(1)}`));
  }
  s.append(svg('path', { class: 'line', pathLength: '1', d: points.map((p, i) => `${i ? 'L' : 'M'}${X(p.at).toFixed(1)} ${Y(p.weight).toFixed(1)}`).join('') }));
  points.forEach((p, i) => s.append(svg('circle', { class: i === points.length - 1 ? 'today' : 'dot', cx: X(p.at), cy: Y(p.weight), r: i === points.length - 1 ? 5 : 3 })));
  s.append(svg('text', { x: pad.l, y: H - 4 }, dateFmt.format(x0)));
  s.append(svg('text', { x: W - pad.r, y: H - 4, 'text-anchor': 'end' }, dateFmt.format(x1)));
  return s;
}

/* ---------- sheets ---------- */
let lastFocus = null;
function openSheet(title, drawing, body, footer) {
  const sheet = document.getElementById('sheet');
  lastFocus = document.activeElement;
  sheet.replaceChildren(
    el('div', { class: 'grabber', 'aria-hidden': 'true' }),
    el('div', { class: 'sheet-head' },
      drawing ? art(drawing, 40) : null,
      el('h2', { class: 'card-title', id: 'sheet-title' }, title),
      el('button', { class: 'icon-btn', 'aria-label': 'Close', onclick: closeSheet }, glyph('close'))),
    ...[el('div', { class: 'sheet-body' }, body), footer && el('div', { class: 'sheet-foot' }, footer)].filter(Boolean));
  sheet.classList.remove('closing');
  sheet.hidden = false;
  document.getElementById('scrim').hidden = false;
  (sheet.querySelector('input, .pill, .btn-primary') ?? sheet.querySelector('button'))?.focus();
}
function closeSheet() {
  const sheet = document.getElementById('sheet');
  if (sheet.hidden) return;
  sheet.classList.add('closing');
  document.getElementById('scrim').hidden = true;
  const done = () => { sheet.hidden = true; sheet.classList.remove('closing'); lastFocus?.focus?.(); };
  document.documentElement.dataset.motion === 'reduced' ? setTimeout(done, 90) : sheet.addEventListener('animationend', done, { once: true });
}
document.getElementById('scrim').addEventListener('click', closeSheet);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

function pillGroup(label, options, value, onChange) {
  const group = el('div', { class: 'pills', role: 'group', 'aria-label': label });
  const buttons = options.map(o => el('button', { class: 'pill', type: 'button', 'aria-pressed': String(o === value), onclick: () => { buttons.forEach(b => b.setAttribute('aria-pressed', String(b === buttons[options.indexOf(o)]))); onChange(o); } }, o));
  group.append(...buttons);
  return el('div', { class: 'field' }, el('span', {}, label), group);
}
function numberField(label, unit, value, step, onChange) {
  const input = el('input', { type: 'number', inputmode: 'decimal', step, min: '0', value, oninput: e => onChange(e.target.value) });
  return el('label', { class: 'field' }, el('span', {}, label), el('span', { class: 'well' }, input, el('span', { class: 'unit' }, unit)));
}
function textField(label, value, onChange, placeholder) {
  return el('label', { class: 'field' }, el('span', {}, label), el('span', { class: 'well' }, el('input', { type: 'text', value, placeholder, oninput: e => onChange(e.target.value) })));
}
function timeField(entry) {
  const d = new Date(entry.at);
  const v = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return el('label', { class: 'field' }, el('span', {}, 'Time'), el('span', { class: 'well' }, el('input', { type: 'time', value: v, oninput: e => {
    const [h, m] = e.target.value.split(':').map(Number);
    if (Number.isFinite(h)) { const t = new Date(); t.setHours(h, m, 0, 0); entry.at = t.getTime(); }
  } })));
}

function openLogSheet(kind) {
  const entry = { id: crypto.randomUUID(), kind, at: Date.now() };
  const prev = latest(kind) ?? {};
  let fields;
  switch (kind) {
    case 'feeding':
      Object.assign(entry, { type: prev.type ?? 'Bottle', amount: prev.amount ?? 120 });
      fields = [pillGroup('Type', ['Bottle', 'Breast'], entry.type, v => (entry.type = v)), numberField('Amount', 'ml', entry.amount, 5, v => (entry.amount = +v)), timeField(entry)];
      break;
    case 'sleep':
      return openSheet('Sleep', 'moon', [
        el('p', { class: 'label', style: 'margin:0' }, 'Start a timer now, or add a nap that already happened.'),
        el('button', { class: 'btn btn-primary btn-block', onclick: () => { state.timer = { start: Date.now() }; persist(); closeSheet(); toast('Nap timer started.'); render(); } }, 'Start nap timer'),
        el('button', { class: 'btn btn-secondary btn-block', onclick: () => { state.records.push({ id: entry.id, kind, at: Date.now() - 45 * MIN, end: Date.now() }); persist(); closeSheet(); toast('Nap saved: 45m.'); render(); } }, 'Add a 45-minute nap ending now')]);
    case 'diaper':
      entry.type = 'Wet';
      fields = [pillGroup('What was in it', ['Wet', 'Dirty', 'Both', 'Dry'], entry.type, v => (entry.type = v)), timeField(entry)];
      break;
    case 'pumping':
      entry.amount = prev.amount ?? 90;
      fields = [numberField('Amount', 'ml', entry.amount, 5, v => (entry.amount = +v)), timeField(entry)];
      break;
    case 'tummy_time':
      entry.minutes = prev.minutes ?? 10;
      fields = [numberField('Duration', 'min', entry.minutes, 1, v => (entry.minutes = +v)), timeField(entry)];
      break;
    case 'growth':
      Object.assign(entry, { weight: prev.weight ?? '', length: prev.length ?? '' });
      fields = [numberField(`${state.child.name}’s weight`, 'kg', entry.weight, 0.01, v => (entry.weight = v ? +v : null)), numberField(`${state.child.name}’s length`, 'cm', entry.length, 0.1, v => (entry.length = v ? +v : null))];
      break;
    case 'health':
      Object.assign(entry, { temp: '', note: '' });
      fields = [numberField('Temperature', '°C', '', 0.1, v => (entry.temp = v ? +v : null)), textField('Note', '', v => (entry.note = v.trim()), 'Optional'), timeField(entry),
        el('p', { class: 'notice' }, 'A log, not medical advice. If you’re worried, contact your doctor.')];
      break;
    case 'milestone':
      entry.note = '';
      fields = [textField('What happened', '', v => (entry.note = v.trim()), 'First giggle'), timeField(entry)];
      break;
  }
  const saveBtn = el('button', { class: 'btn btn-primary btn-block', onclick: () => {
    const missing = (kind === 'milestone' && !entry.note) || (kind === 'growth' && !entry.weight && !entry.length) || (kind === 'health' && !entry.temp && !entry.note);
    if (missing) { toast('Add a value first.'); return; }
    if (entry.at > Date.now()) entry.at -= DAY; // a time later than now means last night
    state.records.push(entry); persist(); closeSheet();
    toast(`${ACTIVITIES[kind].title} saved.`); render();
  } }, ACTIVITIES[kind].verb);
  openSheet(ACTIVITIES[kind].title, drawingFor(kind), fields, saveBtn);
}

function stopTimer() {
  const { start } = state.timer;
  state.records.push({ id: crypto.randomUUID(), kind: 'sleep', at: start, end: Date.now() });
  state.timer = null; persist();
  toast(`Nap saved: ${duration(Date.now() - start)}.`);
  render();
}

function openLayoutSheet() {
  let choice = state.featured;
  openSheet('Featured activity', null, [
    el('p', { class: 'label', style: 'margin:0' }, 'Choose which activity sits at the top of Activity.'),
    pillGroup('Activity', Object.values(ACTIVITIES).map(a => a.title), ACTIVITIES[choice].title, t => (choice = Object.keys(ACTIVITIES).find(k => ACTIVITIES[k].title === t)))],
    el('button', { class: 'btn btn-primary btn-block', onclick: () => { state.featured = choice; persist(); closeSheet(); render(); } }, 'Done'));
}

/* ---------- tab bar ---------- */
function ringPath() {
  // A slightly uneven hand-drawn loop that overshoots its start, like a pen circling the icon.
  return svg('svg', { class: 'ring', viewBox: '0 0 42 34', 'aria-hidden': 'true' },
    svg('path', { pathLength: '1', d: 'M30 4.5C22 1.8 9.5 3 4.8 10.5C1.2 16.4 3.6 25.8 11.8 29.6C19.6 33.2 32.4 31.2 37.6 24.1C41.4 18.8 39.5 9.6 32.3 5.4C27.6 2.7 21 2.4 16.4 3.6' }));
}
function renderTabs() {
  document.querySelectorAll('.tab').forEach(btn => {
    const icon = btn.querySelector('.tab-icon');
    const selected = btn.dataset.tab === tab;
    btn.toggleAttribute('aria-current', selected);
    if (selected) btn.setAttribute('aria-current', 'page');
    icon.replaceChildren(glyph(icon.dataset.icon), selected ? ringPath() : '');
  });
}
document.querySelectorAll('.tab').forEach(btn => btn.addEventListener('click', () => {
  if (tab === btn.dataset.tab) return;
  tab = btn.dataset.tab;
  if (tab === 'history') historyDay = startOfDay(Date.now());
  render(); renderTabs();
  window.scrollTo({ top: 0 });
}));

/* ---------- render loop ---------- */
function render(quiet = false) {
  const screen = document.getElementById('screen');
  screen.classList.toggle('quiet', quiet);
  screen.replaceChildren(...screens[tab]().filter(Boolean));
}

// Running timers show real elapsed time.
setInterval(() => {
  if (!state.timer) return;
  document.querySelectorAll('[data-clock]').forEach(n => (n.textContent = clock(Date.now() - state.timer.start)));
}, 1000);
// Refresh "x ago" labels each minute without re-running entrance motion.
setInterval(() => { if (tab === 'activity' && document.getElementById('sheet').hidden) render(true); }, MIN);

applyPrefs();
render();
renderTabs();
