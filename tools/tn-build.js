#!/usr/bin/env node
/* Validates tintinalli/data/ and builds tintinalli/dist/.
 *   node tools/tn-build.js          validate + write dist
 *   node tools/tn-build.js --check  validate only
 * Exit code 1 if any ERROR is found. Warnings never fail the build. */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.join(__dirname, '..', 'tintinalli');
const dataDir = path.join(root, 'data');
const dist = path.join(root, 'dist');
const check = process.argv.includes('--check');

const errors = [], warns = [];
const E = (f, l, m) => errors.push(`${f}${l ? ':' + l : ''}: ${m}`);
const W = (f, l, m) => warns.push(`${f}${l ? ':' + l : ''}: ${m}`);

const ENUM = {
  cond: ['Urgent', 'Emergent'], act: ['RBR', 'CBR'], diet: ['PO', 'NPO'],
  ecg: ['none', 'once', 'stat'], cxr: ['none', 'PA', 'portable'],
  level: ['I', 'II', 'III'], status: ['demo', 'draft', 'reviewed']
};
const CATS = ['N', 'I', 'L', 'S', 'A', 'T', 'Co'];
const COND_SECS = ['features', 'ddx', 'redflags', 'guide', 'pearls'];
const VAR_SECS = ['scenario', 'why', 'escalate'];
const slug = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const readLines = (f) => fs.readFileSync(f, 'utf8').replace(/\r\n?/g, '\n').split('\n');

/* ---------- small helpers ---------- */
function splitPipe(line) { // "a | b | c" -> trimmed parts
  return line.split(' | ').map((s) => s.trim());
}
function parseList(f, file, lines) { // sections.txt style
  const out = [];
  lines.forEach((raw, i) => {
    if (!raw.trim() || /^\s*\/\//.test(raw)) return;
    const p = raw.split('|').map((s) => s.trim());
    if (p.length < 3) return E(file, i + 1, 'expected "id | English | Farsi"');
    if (!slug.test(p[0])) return E(file, i + 1, `bad id "${p[0]}"`);
    out.push({ id: p[0], n: p[1], fa: p[2] });
  });
  return out;
}
function parseOrderLine(file, ln, raw) {
  let t = raw.replace(/^\s*-\s*/, '').trim();
  const flags = [];
  t = t.replace(/\{(hi|ci|renal|note)(?::\s*([^}]*))?\}/g, (_, k, v) => { flags.push({ k, v: (v || '').trim() }); return ''; }).trim();
  let cond = '';
  const m = t.match(/^\[(?:if\s+)?([^\]]+)\]\s*/);
  if (m) { cond = m[1].trim(); t = t.slice(m[0].length); }
  let why = '';
  const idx = t.indexOf(' | ');
  if (idx >= 0) { why = t.slice(idx + 3).trim(); t = t.slice(0, idx).trim(); }
  if (!t) E(file, ln, 'empty order');
  if (/\b(HM|COM)\b/.test(t)) E(file, ln, 'write "Cardiac monitoring and pulse oximetry" in full, never "HM" or "COM"');
  if (/^@fluid$/i.test(t)) t = '@fluid';
  const o = { t };
  if (cond) o.if = cond;
  if (why) o.why = why;
  if (flags.length) o.fl = flags;
  return o;
}
function bullets(buf) {
  return buf.filter((l) => /^\s*-\s+/.test(l)).map((l) => l.replace(/^\s*-\s+/, '').trim());
}

/* ---------- condition file ---------- */
function parseConds(file, lines) {
  const out = [];
  let cond = null, v = null, sec = null, secKind = null, buf = [];
  const flush = (ln) => {
    if (!sec) return;
    const k = sec;
    if (COND_SECS.includes(k)) {
      if (!cond) return;
      if (k === 'guide') cond.guide = buf.join('\n').trim();
      else if (k === 'ddx') cond.ddx = bullets(buf).map((b) => {
        const parts = b.split(' | ');
        let name = parts[0].trim(), note = (parts[1] || '').trim(), cm = false, id = '';
        if (name.startsWith('!')) { cm = true; name = name.slice(1).trim(); }
        const mm = name.match(/\s@([a-z0-9-]+)$/); if (mm) { id = mm[1]; name = name.slice(0, mm.index).trim(); }
        const d = { n: name }; if (cm) d.cm = 1; if (id) d.id = id; if (note) d.note = note; return d;
      });
      else cond[k] = bullets(buf);
    } else if (VAR_SECS.includes(k)) {
      if (!v) return;
      if (k === 'escalate') v.esc = bullets(buf);
      else v[k === 'scenario' ? 'sc' : k] = buf.join('\n').trim();
    } else if (CATS.includes(k)) {
      if (!v) return;
      v.o[k] = v.o[k] || [];
      buf.forEach((raw) => { if (/^\s*-\s+/.test(raw)) v.o[k].push(parseOrderLine(file, raw.__ln, raw)); });
    }
    sec = null; buf = [];
  };
  lines.forEach((raw, i) => {
    const ln = i + 1;
    if (/^\s*\/\//.test(raw)) return;
    const m = raw.match(/^@(\w+)\s*(.*)$/);
    if (m) {
      flush(ln);
      const name = m[1], low = name.toLowerCase(), arg = m[2].trim();
      if (low === 'cond') {
        cond = { id: arg, variants: [], _file: file, _ln: ln }; out.push(cond); v = null; secKind = 'condhead';
        if (!slug.test(arg)) E(file, ln, `bad condition id "${arg}"`);
      } else if (!cond) { E(file, ln, `@${name} before @cond`); }
      else if (low === 'variant') {
        v = { id: arg, o: {} }; cond.variants.push(v); secKind = 'varhead';
        if (!slug.test(arg)) E(file, ln, `bad variant id "${arg}"`);
      } else if (COND_SECS.includes(low) || VAR_SECS.includes(low)) { sec = low; secKind = 'text'; }
      else if (CATS.map((c) => c.toLowerCase()).includes(low)) { sec = CATS.find((c) => c.toLowerCase() === low); secKind = 'text'; }
      else E(file, ln, `unknown section @${name}`);
      return;
    }
    if (sec) { if (raw.trim()) { const r = new String(raw); r.__ln = ln; buf.push(r); } else buf.push(''); return; }
    if (!raw.trim()) return;
    const kv = raw.match(/^([a-z0-9_]+)\s*:\s*(.*)$/i);
    if (!kv) return E(file, ln, 'expected "key: value", found: ' + raw.slice(0, 50));
    const k = kv[1].toLowerCase(), val = kv[2].trim();
    if (secKind === 'condhead') cond[k] = val;
    else if (secKind === 'varhead') v[k] = val;
  });
  flush();
  return out;
}

function validateCond(file, c, sections, ccIds, chapters) {
  if (!c) return null;
  file = `${c._file}:${c._ln} (${c.id})`;
  const chap = chapters[c.ch];
  if (!c.ch) E(file, 0, 'missing "ch:" (chapter number)');
  else if (!chap) E(file, 0, `unknown chapter ${c.ch}`);
  else {
    if (!c.section) c.section = chap.section;
    if (!c.source) c.source = `Tintinalli's Emergency Medicine Manual, 8th ed., Ch. ${chap.n}: ${chap.title}, pp. ${chap.pages.replace('-', '–')}`;
  }
  ['section', 'name', 'status'].forEach((k) => { if (!c[k]) E(file, 0, `missing "${k}:"`); });
  if (c.section && !sections.some((s) => s.id === c.section)) E(file, 0, `unknown section "${c.section}"`);
  if (c.status && !ENUM.status.includes(c.status)) E(file, 0, `status must be one of ${ENUM.status.join(', ')}`);
  if (c.status === 'reviewed' && (!c.reviewer || !c.reviewed)) E(file, 0, 'status "reviewed" needs "reviewer:" and "reviewed:" (date)');
  c.cc = (c.cc || '').split(',').map((s) => s.trim()).filter(Boolean);
  c.cc.forEach((x) => { if (!ccIds.includes(x)) E(file, 0, `unknown chief complaint "${x}" (see data/cc.txt)`); });
  if (!c.cc.length) W(file, 0, 'no "cc:" (chief complaints); it will not appear on the complaint pages');
  if (!c.name_fa) W(file, 0, 'no "name_fa:"');
  if (!c.source) W(file, 0, 'no "source:" (chapter / page)');
  if (!c.features || !c.features.length) W(file, 0, 'no @features');
  if (!c.ddx || !c.ddx.length) W(file, 0, 'no @ddx');
  if (!c.guide) W(file, 0, 'no @guide');
  if (!c.variants.length) E(file, 0, 'needs at least one @variant');
  const seen = {};
  c.variants.forEach((v) => {
    const at = `variant "${v.id}"`;
    if (seen[v.id]) E(file, 0, `${at} is duplicated`); seen[v.id] = 1;
    ['name', 'imp', 'cond', 'act', 'diet', 'ecg', 'cxr'].forEach((k) => { if (!v[k]) E(file, 0, `${at}: missing "${k}:"`); });
    ['cond', 'act', 'diet', 'ecg', 'cxr', 'level'].forEach((k) => { if (v[k] && !ENUM[k].includes(v[k])) E(file, 0, `${at}: ${k} must be one of ${ENUM[k].join(' / ')}`); });
    if (!v.level) W(file, 0, `${at}: no level (I/II/III)`);
    if (!v.sc) W(file, 0, `${at}: no @scenario (needed for self-test, drill and flashcards)`);
    if (!v.why) W(file, 0, `${at}: no @why`);
    if (v.ecg === 'none' && /\b(MI|ACS)\b|coronary/.test(v.imp || '')) W(file, 0, `${at}: ECG is "none" but the impression looks cardiac`);
    const nOrders = Object.values(v.o).reduce((n, a) => n + a.length, 0);
    if (!nOrders) W(file, 0, `${at}: no orders beyond the fixed block`);
    (v.o.S || []).forEach((o) => { if (/^(@fluid)$/.test(o.t) && v.diet === 'PO' && !o.if) W(file, 0, `${at}: @fluid without a condition on a PO patient; add [if dehydrated and tachycardic]`); });
  });
  return c;
}

/* ---------- cc.txt ---------- */
function parseCC(file, lines) {
  const out = []; let cur = null, sec = null;
  lines.forEach((raw, i) => {
    const ln = i + 1;
    if (/^\s*\/\//.test(raw)) return;
    const m = raw.match(/^@(\w+)\s*(.*)$/);
    if (m) {
      const k = m[1].toLowerCase();
      if (k === 'cc') { cur = { id: m[2].trim(), n: '', fa: '', cm: [], rf: [] }; out.push(cur); sec = 'head'; if (!slug.test(cur.id)) E(file, ln, `bad id "${cur.id}"`); }
      else if (!cur) E(file, ln, `@${k} before @cc`);
      else if (k === 'cantmiss' || k === 'redflags') sec = k;
      else E(file, ln, `unknown section @${k}`);
      return;
    }
    if (!raw.trim() || !cur) return;
    if (sec === 'head') {
      const kv = raw.match(/^([a-z_]+)\s*:\s*(.*)$/i);
      if (!kv) return E(file, ln, 'expected key: value');
      if (kv[1] === 'name') cur.n = kv[2].trim(); else if (kv[1] === 'name_fa') cur.fa = kv[2].trim(); else E(file, ln, `unknown key ${kv[1]}`);
    } else if (sec === 'cantmiss') {
      const b = raw.replace(/^\s*-\s*/, '').split(' | ');
      let name = b[0].trim(), id = '';
      const mm = name.match(/\s@([a-z0-9-]+)$/); if (mm) { id = mm[1]; name = name.slice(0, mm.index).trim(); }
      const o = { n: name }; if (id) o.id = id; if ((b[1] || '').trim()) o.note = b[1].trim(); cur.cm.push(o);
    } else if (sec === 'redflags') cur.rf.push(raw.replace(/^\s*-\s*/, '').trim());
  });
  out.forEach((c) => { if (!c.n) E(file, 0, `cc "${c.id}" needs name:`); });
  return out;
}

function parseDrugs(file, lines) {
  const out = [];
  lines.forEach((raw, i) => {
    if (!raw.trim() || /^\s*\/\//.test(raw)) return;
    const p = splitPipe(raw);
    if (p.length < 3) return E(file, i + 1, 'expected "regex | kind | note"');
    try { new RegExp(p[0], 'i'); } catch (e) { return E(file, i + 1, 'bad regex'); }
    if (!['hi', 'renal'].includes(p[1])) return E(file, i + 1, 'kind must be hi or renal');
    out.push({ re: p[0], k: p[1], note: p[2] });
  });
  return out;
}

/* ---------- run ---------- */
function parseChapters(file, lines) {
  const out = {};
  lines.forEach((raw, i) => {
    if (!raw.trim() || /^\s*\/\//.test(raw)) return;
    const p = raw.split(' | ').map((x) => x.trim());
    if (p.length < 4) return E(file, i + 1, 'expected "n | section | pages | title"');
    out[p[0]] = { n: +p[0], section: p[1], pages: p[2], title: p[3] };
  });
  return out;
}
const sections = parseList('sections.txt', 'sections.txt', readLines(path.join(dataDir, 'sections.txt')));
const chapters = parseChapters('chapters.txt', readLines(path.join(dataDir, 'chapters.txt')));
const ccs = parseCC('cc.txt', readLines(path.join(dataDir, 'cc.txt')));
const drugs = parseDrugs('drugs.txt', readLines(path.join(dataDir, 'drugs.txt')));
const ccIds = ccs.map((c) => c.id);
const files = fs.readdirSync(path.join(dataDir, 'conditions')).filter((f) => f.endsWith('.txt') && !f.startsWith('_')).sort();
const conds = [];
files.forEach((f) => {
  parseConds(f, readLines(path.join(dataDir, 'conditions', f))).forEach((c) => {
    const ok = validateCond(f, c, sections, ccIds, chapters);
    if (ok) { delete ok._file; delete ok._ln; conds.push(ok); }
  });
});
const ids = {};
conds.forEach((c) => { if (ids[c.id]) E(c.id, 0, 'duplicate condition id'); ids[c.id] = 1; });
const chDone = {}; conds.forEach((c) => { chDone[c.ch] = (chDone[c.ch] || 0) + 1; });
console.log(`Chapters covered: ${Object.keys(chDone).length} / ${Object.keys(chapters).length}`);
// links from cc.txt and @ddx to conditions that do not exist are only warnings (the book is added in batches)
ccs.forEach((c) => c.cm.forEach((m) => { if (m.id && !ids[m.id]) W('cc.txt', 0, `${c.id}: "${m.n}" links to missing condition "${m.id}"`); }));

const nv = conds.reduce((n, c) => n + c.variants.length, 0);
console.log(`${conds.length} conditions, ${nv} variants, ${sections.length} sections, ${ccs.length} chief complaints, ${drugs.length} safety rules.`);
if (warns.length) console.log(`\n${warns.length} warning(s):\n - ` + warns.join('\n - '));
if (errors.length) console.error(`\nERRORS:\n - ` + errors.join('\n - '));
else console.log('\nAll checks passed.');

if (!check && !errors.length) {
  fs.mkdirSync(dist, { recursive: true });
  fs.readdirSync(dist).forEach((f) => fs.unlinkSync(path.join(dist, f)));
  const js = (x) => JSON.stringify(x).split(String.fromCharCode(0x2028)).join('\\u2028').split(String.fromCharCode(0x2029)).join('\\u2029');
  const hash = crypto.createHash('sha1').update(js([conds, sections, ccs, drugs])).digest('hex').slice(0, 7);
  const built = new Date().toISOString().slice(0, 10);
  const meta = {
    version: built.replace(/-/g, '') + '-' + hash, built, sections, cc: ccs, drugs, chapters,
    conds: conds.map((c) => ({
      id: c.id, sec: c.section, ch: +c.ch, n: c.name, fa: c.name_fa || '', cc: c.cc, kw: c.keywords || '', st: c.status,
      v: c.variants.map((v) => ({ id: v.id, n: v.name, lv: v.level || '' }))
    }))
  };
  const outFiles = [];
  fs.writeFileSync(path.join(dist, 'meta.js'), '/* Generated by tools/tn-build.js. Do not edit. */\nwindow.TN_META = ' + js(meta) + ';\n'); outFiles.push('dist/meta.js');
  sections.forEach((s) => {
    const data = {};
    conds.filter((c) => c.section === s.id).forEach((c) => { data[c.id] = c; });
    const name = `dist/sec-${s.id}.js`;
    fs.writeFileSync(path.join(root, name), '/* Generated by tools/tn-build.js. Do not edit. */\nTN.defSec(' + js(s.id) + ',' + js(data) + ');\n'); outFiles.push(name);
  });
  const shell = ['index.html', 'manifest.webmanifest', 'css/t.css', 'js/core.js', 'js/calc.js', 'js/app.js', 'js/qrcode.js', 'icons/icon-192.png', 'icons/icon-512.png'];
  fs.writeFileSync(path.join(dist, 'files.json'), JSON.stringify({ version: meta.version, files: shell.concat(outFiles) }));
  console.log(`Wrote tintinalli/dist (${outFiles.length} files, version ${meta.version}).`);
}
process.exit(errors.length ? 1 : 0);
