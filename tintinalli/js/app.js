(function () {
  'use strict';
  var TN = window.TN, M = window.TN_META, esc = TN.esc, S = TN.store;
  var app = document.getElementById('app');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  if (!M) { app.innerHTML = '<div class="warn">dist/meta.js not found. Run <code>node tools/tn-build.js</code>.</div>'; return; }
  TN.META = M;

  var condMeta = {}, secMeta = {}, ccMeta = {};
  M.conds.forEach(function (c) { condMeta[c.id] = c; });
  M.sections.forEach(function (s) { secMeta[s.id] = s; });
  M.cc.forEach(function (c) { ccMeta[c.id] = c; });

  /* ---------- settings (S7) ---------- */
  var set = Object.assign({ fs: 1, contrast: false, touch: false, theme: 'auto', dir: 'ltr', why: true }, S.get('settings', {}));
  function applySettings() {
    var r = document.documentElement;
    r.style.setProperty('--fs', set.fs);
    r.setAttribute('data-contrast', set.contrast ? 'high' : 'normal');
    r.setAttribute('data-touch', set.touch ? 'large' : 'normal');
    if (set.theme === 'auto') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', set.theme);
    r.setAttribute('dir', set.dir);
    S.set('settings', set);
    var f = $('#set-form'); if (f) {
      f.contrast.checked = set.contrast; f.touch.checked = set.touch; f.why.checked = set.why; f.theme.value = set.theme; f.dir.value = set.dir;
      $('#fs-val').textContent = Math.round(set.fs * 100) + '%';
    }
  }
  document.addEventListener('change', function (e) {
    var f = e.target.form; if (!f || f.id !== 'set-form') return;
    set.contrast = f.contrast.checked; set.touch = f.touch.checked; set.theme = f.theme.value; set.dir = f.dir.value;
    var w = f.why.checked; if (w !== set.why) { set.why = w; route(); }
    applySettings();
  });

  /* ---------- helpers ---------- */
  function toast(msg) { var t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove('on'); }, 2200); }
  var STATUS = { demo: ['DEMO', 'Format demo. Not extracted from the book yet.'], draft: ['DRAFT', 'Draft, pending physician review.'], reviewed: ['REVIEWED', 'Reviewed by a physician.'] };
  function statusBadge(st) { var s = STATUS[st] || STATUS.draft; return '<span class="badge st-' + st + '" title="' + esc(s[1]) + '">' + s[0] + '</span>'; }
  function lvBadge(lv) { return lv ? '<span class="badge lv-' + lv + '" title="Level ' + lv + '">L' + lv + '</span>' : ''; }
  function secName(id) { var s = secMeta[id]; return s ? s.n : id; }
  function repoSlug() {
    var h = location.hostname, p = location.pathname.split('/').filter(Boolean);
    if (/\.github\.io$/.test(h)) return h.replace(/\.github\.io$/, '') + '/' + (p[0] || h);
    return '';
  }
  function getCond(id) {
    var m = condMeta[id]; if (!m) return Promise.resolve(null);
    return TN.loadSec(m.sec).then(function (d) { return d[id] || null; });
  }
  function loadAll() { return Promise.all(M.sections.map(function (s) { return TN.loadSec(s.id); })).then(function () { var all = []; M.sections.forEach(function (s) { Object.keys(TN.SEC[s.id]).forEach(function (k) { all.push(TN.SEC[s.id][k]); }); }); return all; }); }
  function pairs(conds) { var out = []; conds.forEach(function (c) { c.variants.forEach(function (v) { out.push({ cond: c, variant: v }); }); }); return out; }
  function vkey(c, v) { return c.id + '/' + v.id; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var banner = '<div class="banner" role="note"><b>Study aid, not a protocol.</b> Orders are drafted from a textbook and are <b>pending physician review</b>. Verify against your hospital protocol and the patient before use.</div>';

  /* ---------- views ---------- */
  function vHome() {
    var h = banner;
    h += '<h1>Tintinalli-based orders</h1>';
    h += '<p class="mute">Pick the chief complaint to see the can\'t-miss list and the matching order sets.</p>';
    h += '<h2>Chief complaint</h2><div class="chips">' + M.cc.map(function (c) {
      var n = M.conds.filter(function (x) { return x.cc.indexOf(c.id) >= 0; }).length;
      return '<a class="chip big" href="#/cc/' + c.id + '"><span>' + esc(c.n) + '</span><small dir="auto">' + esc(c.fa) + '</small><i>' + n + '</i></a>';
    }).join('') + '</div>';
    h += '<h2>Tools</h2><div class="chips"><a class="chip" href="#/calc">🧮 Calculators</a><a class="chip" href="#/test">🧠 Self-test</a><a class="chip" href="#/drill">✍️ Order drill</a><a class="chip" href="#/my">★ My study</a><a class="chip" href="#/about">ℹ︎ About &amp; install</a></div>';
    var done = S.get('done', {}), bm = S.get('bm', {});
    h += '<h2>Sections</h2><div class="grid">' + M.sections.map(function (s) {
      var cs = M.conds.filter(function (c) { return c.sec === s.id; }), d = cs.filter(function (c) { return done[c.id]; }).length;
      return '<a class="card" href="#/s/' + s.id + '"><b>' + esc(s.n) + '</b><span dir="auto" class="mute">' + esc(s.fa) + '</span><span class="mute">' + cs.length + ' conditions · ' + d + ' studied</span></a>';
    }).join('') + '</div>';
    return { html: h, title: 'Tintinalli-based orders' };
  }

  function condRow(c) {
    return '<li class="crow"><a class="cname" href="#/c/' + c.id + '"><b>' + esc(c.n) + '</b> <span dir="auto" class="mute">' + esc(c.fa) + '</span></a> ' + statusBadge(c.st) +
      '<div class="vchips">' + c.v.map(function (v) { return '<a class="chip sm" href="#/c/' + c.id + '/' + v.id + '">' + lvBadge(v.lv) + ' ' + esc(v.n) + '</a>'; }).join('') + '</div></li>';
  }
  function vSection(id) {
    var s = secMeta[id]; if (!s) return null;
    var cs = M.conds.filter(function (c) { return c.sec === id; }).sort(function (a, b) { return a.n.localeCompare(b.n); });
    return { html: '<p><a href="#/">← Home</a></p><h1>' + esc(s.n) + ' <small dir="auto" class="mute">' + esc(s.fa) + '</small></h1>' + (cs.length ? '<ul class="clist">' + cs.map(condRow).join('') + '</ul>' : '<p class="mute">No conditions yet.</p>'), title: s.n };
  }
  function vCC(id) {
    var c = ccMeta[id]; if (!c) return null;
    var h = '<p><a href="#/">← Home</a></p><h1>' + esc(c.n) + ' <small dir="auto" class="mute">' + esc(c.fa) + '</small></h1>';
    if (c.cm.length || c.rf.length) h += '<section class="cantmiss" aria-label="Can\'t-miss diagnoses"><h2>⚠ Can\'t miss</h2><ul>' + c.cm.map(function (m) {
      var link = m.id && condMeta[m.id] ? '<a href="#/c/' + m.id + '"><b>' + esc(m.n) + '</b></a>' : '<b>' + esc(m.n) + '</b>';
      return '<li>' + link + (m.note ? ' <span dir="auto" class="mute">' + esc(m.note) + '</span>' : '') + '</li>';
    }).join('') + '</ul>' + (c.rf.length ? '<h3>Red flags</h3>' + TN.list(c.rf) : '') + '<p class="mute small">Provisional list; to be reviewed against the book and by a physician.</p></section>';
    var cs = M.conds.filter(function (x) { return x.cc.indexOf(id) >= 0; });
    h += '<h2>Order sets for this complaint</h2>' + (cs.length ? '<ul class="clist">' + cs.map(condRow).join('') + '</ul>' : '<p class="mute">No conditions added for this complaint yet.</p>');
    return { html: h, title: c.n };
  }

  /* ---- search ---- */
  var fullIdx = null, q = '';
  function buildFullIdx(all) {
    fullIdx = {};
    all.forEach(function (c) { // variant-specific text only; the fixed block (mentions asthma, COPD, ...) would match everything
      fullIdx[c.id] = c.variants.map(function (v) { var t = [v.imp, v.name]; TN.CATS.forEach(function (k) { (v.o[k] || []).forEach(function (i) { t.push(i.t === '@fluid' ? 'fluid N/S serum' : i.t); }); }); return t.join(' '); }).join(' ').toLowerCase();
    });
  }
  function search(text) {
    var toks = text.toLowerCase().split(/\s+/).filter(Boolean); if (!toks.length) return [];
    var res = [];
    M.conds.forEach(function (c) {
      var head = [c.n, c.fa, c.kw, secName(c.sec), c.cc.map(function (x) { return ccMeta[x] ? ccMeta[x].n + ' ' + ccMeta[x].fa : x; }).join(' '), c.v.map(function (v) { return v.n; }).join(' ')].join(' ').toLowerCase();
      var full = fullIdx ? fullIdx[c.id] || '' : '', score = 0, ok = true;
      toks.forEach(function (t) {
        if (c.n.toLowerCase().indexOf(t) === 0) score += 5; else if (head.indexOf(t) >= 0) score += 3; else if (full.indexOf(t) >= 0) score += 1; else ok = false;
      });
      if (ok) res.push({ c: c, s: score });
    });
    return res.sort(function (a, b) { return b.s - a.s; }).map(function (r) { return r.c; });
  }
  function vSearch() {
    var r = search(q);
    return { html: '<h1>Search</h1><p class="mute">' + (fullIdx ? 'Searching names, keywords and order text.' : 'Searching names and keywords (order text is still loading).') + '</p>' + (r.length ? '<ul class="clist">' + r.map(condRow).join('') + '</ul>' : '<p>' + (q ? 'No match for “' + esc(q) + '”.' : 'Type in the search box.') + '</p>'), title: 'Search' };
  }

  /* ---- order sheet ---- */
  function flagsHtml(fl) {
    var seen = {}, out = [];
    fl.slice().sort(function (a, b) { return (b.v ? 1 : 0) - (a.v ? 1 : 0); }).forEach(function (f) {
      if ((f.k === 'hi' || f.k === 'renal') && seen[f.k]) return; seen[f.k] = 1;
      if (f.k === 'hi') out.push('<span class="fl fl-hi" title="' + esc(f.v) + '">⚠ HIGH-ALERT</span>' + (f.v ? '<span class="flnote">' + esc(f.v) + '</span>' : ''));
      else if (f.k === 'renal') out.push('<span class="fl fl-renal" title="' + esc(f.v) + '">RENAL</span>' + (f.v ? '<span class="flnote">' + esc(f.v) + '</span>' : ''));
      else if (f.k === 'ci') out.push('<span class="fl fl-ci">AVOID IF</span><span class="flnote">' + esc(f.v) + '</span>');
      else out.push('<span class="flnote">' + esc(f.v) + '</span>');
    });
    return out.length ? '<div class="flags">' + out.join('') + '</div>' : '';
  }
  function sheetHtml(c, v, o, id) {
    var h = '<div class="osheet" id="' + id + '"><div class="ohead">' + o.header.map(function (x) { return '<div><b>' + x[0] + ':</b> ' + esc(x[1]) + '</div>'; }).join('') + '<div><b>Please:</b></div></div><ol class="olist" start="1">';
    var last = '';
    o.items.forEach(function (it) {
      if (it.cat !== last) { h += '<li class="ogrp" aria-hidden="true">' + it.cat + ' · ' + TN.CAT_NAME[it.cat] + '</li>'; last = it.cat; }
      h += '<li class="oitem" data-n="' + it.n + '" value="' + it.n + '"><label><input type="checkbox" data-pick="' + it.n + '" aria-label="Select order ' + it.n + '"><span class="ocat c-' + it.cat + '">' + it.cat + '</span><span class="otext">' + esc(it.t) + '</span></label>' +
        flagsHtml(it.fl) + (set.why && it.why ? '<div class="why" dir="auto"><i>Why:</i> ' + esc(it.why) + '</div>' : '') + '</li>';
    });
    return h + '</ol></div>';
  }
  var cur = null; // current condition view state
  function vCond(c, vid) {
    var v = c.variants.filter(function (x) { return x.id === vid; })[0] || c.variants[0];
    var o = TN.compose(v); cur = { c: c, v: v, o: o };
    var bm = S.get('bm', {}), done = S.get('done', {});
    var h = '<p><a href="#/s/' + c.section + '">← ' + esc(secName(c.section)) + '</a></p>';
    h += '<div class="ctitle"><h1>' + esc(c.name) + '</h1><div dir="auto" class="fa-title">' + esc(c.name_fa || '') + '</div>';
    h += '<div class="cbar">' + statusBadge(c.status) + ' <button data-act="bm" class="tb' + (bm[c.id] ? ' on' : '') + '" aria-pressed="' + !!bm[c.id] + '">★ Bookmark</button> <button data-act="done" class="tb' + (done[c.id] ? ' on' : '') + '" aria-pressed="' + !!done[c.id] + '">✓ Studied</button> <button data-act="anki-one" class="tb">⤓ Anki CSV</button> <a class="tb" target="_blank" rel="noopener" href="' + (repoSlug() ? 'https://github.com/' + repoSlug() + '/issues/new?labels=feedback&title=' + encodeURIComponent('[Tintinalli] ' + c.name) + '&body=' + encodeURIComponent('Page: ' + location.href + '\n\nComment:\n') : '#') + '">⚑ Report an error</a></div></div>';
    if (c.status === 'demo') h += '<div class="banner demo" role="note"><b>DEMO CONTENT.</b> Written only to test the format. It was <b>not</b> extracted from Tintinalli and must not be used clinically. It will be replaced.</div>';
    else if (c.status === 'draft') h += '<div class="banner" role="note"><b>Draft.</b> Extracted from the book, pending physician review.</div>';
    else h += '<div class="banner ok" role="note">Reviewed by ' + esc(c.reviewer || '') + ' on ' + esc(c.reviewed || '') + '.</div>';

    if (c.variants.length > 1) h += '<div class="vtabs" role="tablist" aria-label="Order set variants">' + c.variants.map(function (x) { return '<a role="tab" aria-selected="' + (x === v) + '" class="vtab' + (x === v ? ' on' : '') + '" href="#/c/' + c.id + '/' + x.id + '">' + lvBadge(x.level) + ' ' + esc(x.name) + '</a>'; }).join('') + '</div>';
    h += '<section class="vcard"><h2>' + lvBadge(v.level) + ' ' + esc(v.name) + '</h2>';
    if (v.sc) h += '<div class="scn" dir="auto"><b>سناریو</b><br>' + esc(v.sc) + '</div>';
    if (v.esc && v.esc.length) h += '<div class="esc"><b>↑ Escalate</b>' + TN.list(v.esc) + '</div>';
    if (v.why) h += '<div class="vwhy" dir="auto">' + esc(v.why) + '</div>';
    h += '<div class="obar"><button data-act="copy-all" class="pri">⧉ Copy orders</button> <button data-act="copy-pick">⧉ Copy ticked</button> <button data-act="pick-all">Tick all</button> <button data-act="cover" aria-pressed="false">🙈 Cover orders</button> <a class="btn" href="#/print/' + c.id + '/' + v.id + '">🖶 Print sheet</a></div>';
    h += sheetHtml(c, v, o, 'osheet') + '</section>';

    var sec = function (title, body, open) { return body ? '<details class="dsec"' + (open === false ? '' : ' open') + '><summary><h2>' + title + '</h2></summary>' + body + '</details>' : ''; };
    h += sec('Clinical features', TN.list(c.features));
    if (c.ddx && c.ddx.length) h += sec('Differential diagnosis', '<ul class="ddx">' + c.ddx.map(function (d) {
      var nm = d.id && condMeta[d.id] ? '<a href="#/c/' + d.id + '">' + esc(d.n) + '</a>' : esc(d.n);
      return '<li class="' + (d.cm ? 'cm' : '') + '">' + (d.cm ? '<span class="fl fl-hi">CAN\'T MISS</span> ' : '') + '<b>' + nm + '</b>' + (d.note ? ' <span dir="auto" class="mute">' + esc(d.note) + '</span>' : '') + '</li>';
    }).join('') + '</ul>');
    h += sec('Red flags', TN.list(c.redflags));
    h += sec('Study guide', c.guide ? '<div class="guide">' + TN.md(c.guide) + '</div>' : '');
    h += sec('Pearls and pitfalls', TN.list(c.pearls));
    h += '<details class="dsec" open><summary><h2>My notes</h2></summary><textarea id="note" rows="4" placeholder="Private notes (saved on this device)" aria-label="My notes">' + esc(S.get('note.' + c.id, '')) + '</textarea></details>';
    h += '<p class="mute small">Source: ' + esc(c.source || '—') + '</p>';
    return { html: h, title: c.name + ' · ' + v.name };
  }

  function vPrint(c, vid) {
    var v = c.variants.filter(function (x) { return x.id === vid; })[0] || c.variants[0], o = TN.compose(v);
    var h = '<p class="noprint"><a href="#/c/' + c.id + '/' + v.id + '">← Back</a> <button class="pri" onclick="window.print()">🖶 Print</button> <span class="mute small">Prints as one A4 page.</span></p><div class="psheet">';
    h += '<div class="pform"><div>Patient name: <u></u></div><div>Age: <u class="s"></u> Weight: <u class="s"></u> kg</div><div>Date / time: <u></u></div><div>Allergies: <u></u></div></div>';
    h += '<div class="phead">' + o.header.map(function (x) { return '<div><b>' + x[0] + ':</b> ' + esc(x[1]) + '</div>'; }).join('') + '<div><b>Please:</b></div></div><table class="ptab"><thead><tr><th>#</th><th>Order</th><th>Time</th><th>Nurse</th></tr></thead><tbody>';
    o.items.forEach(function (it) { h += '<tr><td>' + it.n + '</td><td>' + esc(it.t) + '</td><td></td><td></td></tr>'; });
    h += '</tbody></table><div class="psign">Physician: <u></u> Signature: <u></u> Time: <u></u></div><p class="pfoot">Draft order set (' + esc(c.status) + '), study aid. Verify before use. Version ' + esc(M.version) + '</p></div>';
    return { html: h, title: 'Print · ' + c.name };
  }

  /* ---- calculators ---- */
  function vCalcList() {
    return { html: '<p><a href="#/">← Home</a></p><h1>Calculators</h1><p class="mute">Reference tools. Verify against the original score and your judgement.</p><div class="grid">' + TN.CALCS.map(function (c) { return '<a class="card" href="#/calc/' + c.id + '"><b>' + esc(c.name) + '</b><span class="mute">' + esc(c.note) + '</span></a>'; }).join('') + '</div>', title: 'Calculators' };
  }
  function vCalc(id) {
    var c = TN.CALCS.filter(function (x) { return x.id === id; })[0]; if (!c) return null;
    var h = '<p><a href="#/calc">← Calculators</a></p><h1>' + esc(c.name) + '</h1><p class="mute">' + esc(c.note) + '</p><form id="calc" data-calc="' + c.id + '" onsubmit="return false">';
    c.fields.forEach(function (f) {
      if (f.type === 'check') h += '<label class="row"><input type="checkbox" name="' + f.id + '"> <span>' + esc(f.label) + ' <small class="mute">(' + (f.pts > 0 ? '+' : '') + f.pts + ')</small></span></label>';
      else if (f.type === 'pick') h += '<label class="row col"><span>' + esc(f.label) + '</span><select name="' + f.id + '">' + f.opts.map(function (o, i) { return '<option value="' + i + '">' + esc(o[0]) + '</option>'; }).join('') + '</select></label>';
      else h += '<label class="row col"><span>' + esc(f.label) + '</span><input type="number" inputmode="decimal" step="any" name="' + f.id + '"></label>';
    });
    return { html: h + '</form><div class="result" id="cres" aria-live="polite"></div>', title: c.name, after: function () { calcRun(); } };
  }
  function calcRun() {
    var f = $('#calc'); if (!f) return;
    var c = TN.CALCS.filter(function (x) { return x.id === f.dataset.calc; })[0], vals = {};
    c.fields.forEach(function (fd) { var el = f.elements[fd.id]; vals[fd.id] = fd.type === 'check' ? el.checked : fd.type === 'pick' ? parseInt(el.value, 10) : el.value; });
    var r = c.run(vals, c.fields);
    $('#cres').innerHTML = r ? '<div class="score">' + esc(r.score) + '</div><div>' + esc(r.text) + '</div>' : '<span class="mute">Enter the values.</span>';
  }
  document.addEventListener('input', function (e) { if (e.target.form && e.target.form.id === 'calc') calcRun(); });

  /* ---- My study (L4) + Anki (L5) ---- */
  function vMy() {
    var bm = S.get('bm', {}), done = S.get('done', {});
    var h = '<p><a href="#/">← Home</a></p><h1>My study</h1>';
    h += '<h2>Progress</h2><div class="grid">' + M.sections.map(function (s) {
      var cs = M.conds.filter(function (c) { return c.sec === s.id; }), d = cs.filter(function (c) { return done[c.id]; }).length, p = cs.length ? Math.round(d / cs.length * 100) : 0;
      return '<div class="card"><b>' + esc(s.n) + '</b><div class="bar" role="progressbar" aria-valuenow="' + p + '" aria-valuemin="0" aria-valuemax="100"><i style="width:' + p + '%"></i></div><span class="mute">' + d + ' / ' + cs.length + ' studied</span></div>';
    }).join('') + '</div>';
    function lst(map) { var ids = Object.keys(map).filter(function (k) { return map[k] && condMeta[k]; }); return ids.length ? '<ul class="clist">' + ids.map(function (k) { return condRow(condMeta[k]); }).join('') + '</ul>' : '<p class="mute">Nothing yet.</p>'; }
    h += '<h2>★ Bookmarks</h2>' + lst(bm) + '<h2>✓ Studied</h2>' + lst(done);
    var notes = S.keys().filter(function (k) { return k.indexOf('note.') === 0 && S.get(k); });
    h += '<h2>Notes</h2>' + (notes.length ? '<ul class="clist">' + notes.map(function (k) { var id = k.slice(5); return '<li class="crow"><a href="#/c/' + id + '"><b>' + esc(condMeta[id] ? condMeta[id].n : id) + '</b></a><div dir="auto" class="mute">' + esc(S.get(k)).slice(0, 200) + '</div></li>'; }).join('') + '</ul>' : '<p class="mute">No notes yet.</p>');
    h += '<h2>Flashcards (Anki CSV)</h2><p class="mute">Import in Anki with <i>Allow HTML in fields</i> ticked. Fields: Front, Back, Tags.</p><div class="obar"><button data-act="anki-bm">Bookmarked</button> <button data-act="anki-done">Studied</button> <button data-act="anki-all">Everything</button></div>';
    h += '<h2>Backup</h2><div class="obar"><button data-act="export">⤓ Export my data</button> <label class="btn">⤒ Import <input type="file" id="imp" accept="application/json" hidden></label></div>';
    return { html: h, title: 'My study' };
  }
  function ankiFor(filter, name) {
    loadAll().then(function (all) {
      var cs = all.filter(filter); if (!cs.length) return toast('No conditions selected.');
      TN.download(name + '.csv', TN.toCsv(TN.ankiRows(pairs(cs).map(function (p) { return { cond: p.cond, variant: p.variant }; }))), 'text/csv;charset=utf-8');
      toast('Exported ' + cs.length + ' condition(s).');
    });
  }

  /* ---- Self-test (L1), Leitner boxes ---- */
  var DAYS = [0, 1, 3, 7, 14, 30];
  var tst = null;
  function vTest(scope) {
    if (!scope) return { html: '<p><a href="#/">← Home</a></p><h1>Self-test</h1><p>You see the scenario; recall the orders; reveal; grade yourself. Cards you miss come back sooner (spaced repetition on this device).</p><div class="grid">' +
      '<a class="card" href="#/test/all"><b>All conditions</b></a><a class="card" href="#/test/bm"><b>Bookmarked</b></a>' + M.sections.map(function (s) { return '<a class="card" href="#/test/' + s.id + '"><b>' + esc(s.n) + '</b></a>'; }).join('') + '</div>', title: 'Self-test' };
    return { html: '<p><a href="#/test">← Scope</a></p><h1>Self-test</h1><div id="tcard" class="tcard"><p class="mute">Loading…</p></div>', title: 'Self-test', after: function () { startTest(scope); } };
  }
  function startTest(scope) {
    loadAll().then(function (all) {
      var bm = S.get('bm', {}), lt = S.get('lt', {}), now = Date.now();
      var cs = all.filter(function (c) { return scope === 'all' || (scope === 'bm' ? bm[c.id] : c.section === scope); });
      var q = pairs(cs).filter(function (p) { return p.variant.sc; }).filter(function (p) { var s = lt[vkey(p.cond, p.variant)]; return !s || s.due <= now; });
      tst = { q: shuffle(q), n: 0, scope: scope }; nextCard();
    });
  }
  function nextCard() {
    var box = $('#tcard'); if (!box) return;
    if (!tst.q.length) { box.innerHTML = '<p>🎉 Nothing due. ' + tst.n + ' card(s) done this session.</p><p><a class="btn" href="#/test">Choose another scope</a></p>'; return; }
    var p = tst.q[0], v = p.variant;
    box.innerHTML = '<div class="mute small">' + tst.q.length + ' due · ' + esc(secName(p.cond.section)) + '</div><div class="scn" dir="auto"><b>سناریو</b><br>' + esc(v.sc) + '</div><p><b>What are the orders?</b> Recall Imp / Cond / Act / Diet, then each item in N-I-L-S-A-T-Co order.</p><button class="pri" data-act="reveal">Reveal answer</button><div id="ans" hidden></div>';
  }
  function revealCard() {
    var p = tst.q[0], c = p.cond, v = p.variant, o = TN.compose(v);
    var a = $('#ans'); a.hidden = false; a.innerHTML = '<h3>' + esc(c.name) + ': ' + esc(v.name) + '</h3>' + sheetHtml(c, v, o, 'ans-sheet') + '<div class="obar grade"><button data-grade="0">✗ Missed</button> <button data-grade="1">~ Partly</button> <button data-grade="2" class="pri">✓ Got it</button></div>';
    $('[data-act="reveal"]').hidden = true;
  }
  function gradeCard(g) {
    var p = tst.q.shift(), lt = S.get('lt', {}), k = vkey(p.cond, p.variant), s = lt[k] || { box: 0 };
    s.box = g === 2 ? Math.min(s.box + 1, DAYS.length - 1) : g === 1 ? s.box : 0;
    s.due = Date.now() + DAYS[s.box] * 864e5; if (g === 0) s.due = Date.now() + 10 * 6e4;
    lt[k] = s; S.set('lt', lt); tst.n++;
    if (g === 0) tst.q.push(p);
    nextCard();
  }

  /* ---- Order drill (L2) ---- */
  var drl = null;
  function vDrill() { return { html: '<p><a href="#/">← Home</a></p><h1>Order drill</h1><p>Build the orders for a case. Set Cond / Act / Diet / ECG / CXR, then put each real order into its NILSTATCo slot (N, I, L, S, A, T, Co) and leave wrong ones as “—”.</p><div id="dcard"><p class="mute">Loading…</p></div>', title: 'Order drill', after: function () { loadAll().then(function (all) { drl = { all: all }; newDrill(); }); } }; }
  function rawItems(v) { var out = []; TN.CATS.forEach(function (cat) { (v.o[cat] || []).forEach(function (it) { out.push({ cat: cat, t: (it.if ? TN.condLead(it.if) + ': ' : '') + (it.t === '@fluid' ? TN.fluidText(v.diet) : it.t) }); }); }); return out; }
  function newDrill() {
    var box = $('#dcard'); if (!box) return;
    var ps = pairs(drl.all).filter(function (p) { return p.variant.sc && rawItems(p.variant).length >= 1; });
    if (!ps.length) { box.innerHTML = '<p class="mute">No cases available.</p>'; return; }
    var p = ps[Math.floor(Math.random() * ps.length)], right = rawItems(p.variant);
    var others = [];
    ps.forEach(function (x) { if (x.cond.id !== p.cond.id) rawItems(x.variant).forEach(function (i) { if (!right.some(function (r) { return r.t === i.t; }) && !others.some(function (r) { return r.t === i.t; })) others.push(i); }); });
    var dis = shuffle(others).slice(0, Math.max(3, Math.min(6, right.length))).map(function (i) { return { cat: '', t: i.t, wrong: true }; });
    drl.cur = { p: p, pool: shuffle(right.concat(dis)) };
    var sel = function (id, opts) { return '<label class="row col"><span>' + id + '</span><select name="' + id + '">' + ['—'].concat(opts).map(function (o) { return '<option value="' + (o === '—' ? '' : o) + '">' + o + '</option>'; }).join('') + '</select></label>'; };
    box.innerHTML = '<div class="scn" dir="auto"><b>سناریو</b><br>' + esc(p.variant.sc) + '</div><form id="dform" onsubmit="return false"><div class="dgrid">' + sel('Cond', ['Urgent', 'Emergent']) + sel('Act', ['RBR', 'CBR']) + sel('Diet', ['PO', 'NPO']) + sel('ECG', ['none', 'once', 'stat']) + sel('CXR', ['none', 'PA', 'portable']) + '</div><h3>Orders: which are right, and in which slot?</h3><ul class="dpool">' +
      drl.cur.pool.map(function (it, i) { return '<li><select name="i' + i + '" aria-label="Slot for: ' + esc(it.t) + '"><option value="">—</option>' + TN.CATS.map(function (c) { return '<option>' + c + '</option>'; }).join('') + '</select> <span>' + esc(it.t) + '</span></li>'; }).join('') + '</ul><div class="obar"><button class="pri" data-act="drill-check">Check</button> <button data-act="drill-new">Next case</button></div></form><div id="dres" aria-live="polite"></div>';
  }
  function checkDrill() {
    var f = $('#dform'), d = drl.cur, v = d.p.variant, score = 0, tot = 0, h = '';
    [['Cond', v.cond], ['Act', v.act], ['Diet', v.diet], ['ECG', v.ecg], ['CXR', v.cxr]].forEach(function (x) {
      tot++; var ok = f.elements[x[0]].value === x[1]; if (ok) score++; h += '<li class="' + (ok ? 'ok' : 'bad') + '">' + x[0] + ': ' + (ok ? '✔ ' : '✘ you said “' + esc(f.elements[x[0]].value || '—') + '”, correct: ') + '<b>' + esc(x[1]) + '</b></li>';
    });
    d.pool.forEach(function (it, i) {
      var val = f.elements['i' + i].value, want = it.wrong ? '' : it.cat;
      if (!it.wrong || val) tot++; else return;
      var ok = val === want; if (ok) score++;
      h += '<li class="' + (ok ? 'ok' : 'bad') + '">' + (ok ? '✔ ' : '✘ ') + esc(it.t) + ' — ' + (it.wrong ? 'not part of this case' : 'slot <b>' + it.cat + '</b> (' + TN.CAT_NAME[it.cat] + ')') + (ok || it.wrong ? '' : '; you chose ' + (val || '—')) + '</li>';
    });
    $('#dres').innerHTML = '<div class="score">' + score + ' / ' + tot + '</div><ul class="dres">' + h + '</ul><p class="mute">Correct set for this case: <a href="#/c/' + d.p.cond.id + '/' + v.id + '">' + esc(d.p.cond.name) + '</a>.</p>';
  }

  /* ---- About / install / share ---- */
  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; var b = $('#install'); if (b) b.hidden = false; });
  function vAbout() {
    var h = '<p><a href="#/">← Home</a></p><h1>About &amp; install</h1>';
    h += banner + '<h2>How an order is built</h2><p>Every order set starts with <b>Imp, Cond, Act, Diet</b>, then <b>Please:</b> items in the fixed NILSTATCo order:</p><ol><li><b>N</b> Nursing: IV line fix, Cardiac monitoring and pulse oximetry, O2 therapy, ECG</li><li><b>I</b> Imaging: CXR (PA or portable) and any other imaging</li><li><b>L</b> Lab tests: one item, CBC, BUN, Cr, Na, K plus case-specific tests</li><li><b>S</b> Serum</li><li><b>A</b> Antibiotics (zero or more)</li><li><b>T</b> Treatment (zero or more)</li><li><b>Co</b> Consult (zero or more)</li></ol>';
    h += '<p><b>Fluid rule:</b> mild volume depletion (tachycardia): N/S 500 cc – 1 L, then maintenance (NPO: Serum 1/3 – 2/3, 1 L TDS). Not applied in CKD, AKI, anuria or heart failure / pulmonary edema.</p>';
    h += '<h2>Install and offline</h2><div class="obar"><button id="install" class="pri" data-act="install" hidden>Install app</button> <button data-act="offline">Save everything for offline use</button></div><p id="offmsg" class="mute small"></p><p class="mute small">On iPhone: Share → Add to Home Screen. Content version <b>' + esc(M.version) + '</b> (built ' + esc(M.built) + ').</p>';
    h += '<h2>Share</h2><div id="qr" class="qr" aria-label="QR code of this site\'s address"></div><p class="mute small" id="qrurl"></p>';
    return { html: h, title: 'About', after: function () {
      if (deferred) $('#install').hidden = false;
      var url = location.href.split('#')[0]; $('#qrurl').textContent = url;
      try { var qr = qrcode(0, 'M'); qr.addData(url); qr.make(); $('#qr').innerHTML = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true }); } catch (e) { $('#qr').textContent = 'QR unavailable'; }
    } };
  }
  function saveOffline() {
    var m = $('#offmsg'); m.textContent = 'Downloading…';
    fetch('dist/files.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (j) {
      var n = 0; return Promise.all(j.files.map(function (f) { return fetch(f, { cache: 'reload' }).then(function () { m.textContent = 'Saved ' + (++n) + ' / ' + j.files.length; }); })).then(function () { m.textContent = 'Everything is saved. The app now works offline.'; });
    }).catch(function () { m.textContent = 'Could not save everything. Check your connection and try again.'; });
  }

  /* ---------- routing ---------- */
  var token = 0;
  function show(r) {
    if (!r) r = { html: '<h1>Not found</h1><p><a href="#/">Home</a></p>', title: 'Not found' };
    app.innerHTML = r.html; document.title = r.title + ' · Tintinalli-based orders';
    window.scrollTo(0, 0); var h1 = $('h1', app); if (h1 && document.activeElement !== searchEl) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
    if (r.after) r.after();
    $$('#nav a').forEach(function (a) { var on = a.getAttribute('href') === ('#/' + (location.hash.split('/')[1] || '')); a.classList.toggle('on', on); });
  }
  function route() {
    var my = ++token, hs = decodeURIComponent(location.hash || '#/'), m;
    if ((m = hs.match(/^#\/c\/([a-z0-9-]+)(?:\/([a-z0-9-]+))?$/))) {
      app.innerHTML = '<p class="mute">Loading…</p>';
      getCond(m[1]).then(function (c) { if (my === token) show(c ? vCond(c, m[2]) : null); }).catch(function () { if (my === token) app.innerHTML = '<div class="warn">Could not load this section. Check your connection.</div>'; });
    } else if ((m = hs.match(/^#\/print\/([a-z0-9-]+)(?:\/([a-z0-9-]+))?$/))) {
      getCond(m[1]).then(function (c) { if (my === token) show(c ? vPrint(c, m[2]) : null); });
    } else if ((m = hs.match(/^#\/s\/([a-z0-9-]+)$/))) show(vSection(m[1]));
    else if ((m = hs.match(/^#\/cc\/([a-z0-9-]+)$/))) show(vCC(m[1]));
    else if (hs === '#/calc') show(vCalcList());
    else if ((m = hs.match(/^#\/calc\/([a-z0-9-]+)$/))) show(vCalc(m[1]));
    else if (hs === '#/my') show(vMy());
    else if (hs === '#/test') show(vTest());
    else if ((m = hs.match(/^#\/test\/([a-z0-9-]+)$/))) show(vTest(m[1]));
    else if (hs === '#/drill') show(vDrill());
    else if (hs === '#/about') show(vAbout());
    else if (hs === '#/q') show(vSearch());
    else show(vHome());
  }
  window.addEventListener('hashchange', route);

  /* ---------- events ---------- */
  var searchEl = $('#q');
  searchEl.addEventListener('input', function () { q = searchEl.value.trim(); if (location.hash !== '#/q') location.hash = '#/q'; else show(vSearch()); });
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-act],[data-grade]'); if (!t) return;
    var act = t.dataset.act;
    if (t.dataset.grade != null) return gradeCard(parseInt(t.dataset.grade, 10));
    if (act === 'fs-up' || act === 'fs-down') { set.fs = Math.max(0.8, Math.min(1.6, Math.round((set.fs + (act === 'fs-up' ? 0.1 : -0.1)) * 10) / 10)); applySettings(); return; }
    if (act === 'copy-all') { TN.copy(cur.o.text).then(function () { toast('Orders copied'); }, function () { toast('Copy failed'); }); }
    else if (act === 'copy-pick') {
      var picked = {}, k = 0; $$('#osheet [data-pick]').forEach(function (cb) { if (cb.checked) { picked[cb.dataset.pick] = 1; k++; } });
      if (!k) return toast('Tick the orders you want first');
      TN.copy(TN.toText(cur.o.header, cur.o.items, picked)).then(function () { toast(k + ' order(s) copied'); }, function () { toast('Copy failed'); });
    } else if (act === 'pick-all') { var all = $$('#osheet [data-pick]'), on = all.some(function (cb) { return !cb.checked; }); all.forEach(function (cb) { cb.checked = on; }); t.textContent = on ? 'Untick all' : 'Tick all'; }
    else if (act === 'cover') { var sh = $('#osheet'), cv = sh.classList.toggle('covered'); t.setAttribute('aria-pressed', cv); t.textContent = cv ? '👁 Uncover orders' : '🙈 Cover orders'; }
    else if (act === 'bm' || act === 'done') {
      var key = act, map = S.get(key, {}); map[cur.c.id] = !map[cur.c.id]; if (!map[cur.c.id]) delete map[cur.c.id]; S.set(key, map);
      t.classList.toggle('on', !!map[cur.c.id]); t.setAttribute('aria-pressed', !!map[cur.c.id]); toast(act === 'bm' ? (map[cur.c.id] ? 'Bookmarked' : 'Bookmark removed') : (map[cur.c.id] ? 'Marked as studied' : 'Unmarked'));
    }
    else if (act === 'anki-one') { TN.download('anki-' + cur.c.id + '.csv', TN.toCsv(TN.ankiRows(pairs([cur.c]).map(function (p) { return { cond: p.cond, variant: p.variant }; }))), 'text/csv;charset=utf-8'); }
    else if (act === 'anki-bm') { var b = S.get('bm', {}); ankiFor(function (c) { return b[c.id]; }, 'anki-bookmarked'); }
    else if (act === 'anki-done') { var d = S.get('done', {}); ankiFor(function (c) { return d[c.id]; }, 'anki-studied'); }
    else if (act === 'anki-all') ankiFor(function () { return true; }, 'anki-all');
    else if (act === 'export') { var o = {}; S.keys().forEach(function (k) { o[k] = S.get(k); }); TN.download('tintinalli-my-data.json', JSON.stringify(o, null, 1), 'application/json'); }
    else if (act === 'reveal') revealCard();
    else if (act === 'drill-check') checkDrill();
    else if (act === 'drill-new') newDrill();
    else if (act === 'install' && deferred) { deferred.prompt(); deferred = null; t.hidden = true; }
    else if (act === 'offline') saveOffline();
  });
  document.addEventListener('input', function (e) { if (e.target.id === 'note' && cur) S.set('note.' + cur.c.id, e.target.value); });
  document.addEventListener('change', function (e) {
    if (e.target.id !== 'imp') return;
    var fr = new FileReader(); fr.onload = function () { try { var o = JSON.parse(fr.result); Object.keys(o).forEach(function (k) { S.set(k, o[k]); }); toast('Imported'); route(); } catch (x) { toast('Not a valid backup file'); } };
    fr.readAsText(e.target.files[0]);
  });
  document.addEventListener('keydown', function (e) { if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); searchEl.focus(); } });

  /* ---------- start ---------- */
  $('#foot').textContent = 'Tintinalli-based orders · content ' + M.version + ' · study aid, not a protocol';
  applySettings(); route();
  var idle = window.requestIdleCallback || function (f) { setTimeout(f, 800); };
  idle(function () { loadAll().then(function (all) { buildFullIdx(all); if (location.hash === '#/q') show(vSearch()); }).catch(function () {}); });
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('../sw.js').catch(function () {});
})();
