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
  function dueCount() {
    var lt = S.get('lt', {}), now = Date.now(), n = 0;
    M.conds.forEach(function (c) { c.v.forEach(function (v) { var s = lt[c.id + '/' + v.id]; if (!s || s.due <= now) n++; }); });
    return n;
  }
  function pushRecent(id) {
    var r = S.get('recent', []).filter(function (x) { return x !== id; });
    r.unshift(id); S.set('recent', r.slice(0, 12));
  }
  var banner = '<div class="banner" role="note"><b>Study aid, not a protocol.</b> Orders are drafted from a textbook and are <b>pending physician review</b>. Verify against your hospital protocol and the patient before use.</div>';

  /* ---------- views ---------- */
  var ICO = {
    case: '<path d="M3 12h4l2.5-7 4 14 2.5-7h5"/>',
    test: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M8 7.5h8M8 11.5h6"/>',
    calc: '<rect x="4" y="3" width="16" height="18" rx="2.5"/><path d="M8 7h8M8 12h3M13 12h3M8 16.5h3M13 16.5h3"/>',
    my: '<path d="M12 3.6l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.8l5.9-.8z"/>',
    about: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.6v.9"/>'
  };
  function toolCard(href, ico, title, sub, hot) {
    return '<a class="tool' + (hot ? ' hot' : '') + '" href="' + href + '"><span class="ti"><svg viewBox="0 0 24 24" aria-hidden="true">' + ICO[ico] + '</svg></span><span><b>' + title + '</b><em>' + sub + '</em></span></a>';
  }
  function vHome() {
    var done = S.get('done', {}), bm = S.get('bm', {}), recent = S.get('recent', []).filter(function (x) { return condMeta[x]; });
    var nv = M.conds.reduce(function (a, c) { return a + c.v.length; }, 0), due = dueCount();
    var h = '<section class="hero"><h1>Tintinalli-based ED orders</h1>' +
      '<p class="lede">Every condition in <i>Tintinalli\'s Emergency Medicine Manual</i>, 8th ed., written as a ready order sheet: <b>Imp / Cond / Act / Diet</b>, then <b>Please:</b> in NILSTATCo order. Draft, pending physician review.</p>' +
      '<div class="stats">' +
      '<div class="stat"><b>' + M.conds.length + '</b><span>conditions</span></div>' +
      '<div class="stat"><b>' + nv + '</b><span>order sets</span></div>' +
      '<a class="stat" href="#/test"><b>' + due + '</b><span>due to review</span></a>' +
      '<a class="stat" href="#/my"><b>' + Object.keys(done).length + '</b><span>studied</span></a>' +
      '</div></section>';
    h += banner;
    if (recent.length) h += '<h2>Jump back in</h2><div class="chips">' + recent.slice(0, 7).map(function (id) {
      return '<a class="chip" href="#/c/' + id + '">' + esc(condMeta[id].n) + '</a>';
    }).join('') + '</div>';
    h += '<h2>Tools</h2><div class="tools">' +
      toolCard('#/case', 'case', 'Case simulator', 'A full vignette: you name the impression and write the whole order set from the order database.', true) +
      toolCard('#/test', 'test', 'Self-test', due + ' card(s) due. Recall the sheet from the scenario, then grade yourself.') +
      toolCard('#/calc', 'calc', 'Calculators', TN.CALCS.length + ' scores and drips: HEART, Wells, GCS, Parkland, anion gap and more.') +
      toolCard('#/my', 'my', 'My study', Object.keys(bm).length + ' bookmarked · progress, notes, Anki export and backup.') +
      toolCard('#/about', 'about', 'About &amp; install', 'How an order is built, the fluid rule, offline install and the content version.') +
      '</div>';
    h += '<h2>Start with the chief complaint</h2><p class="mute">Each complaint opens with its can\'t-miss list and red flags, then every matching order set.</p>';
    var groups = [], gm = {};
    M.cc.forEach(function (c) {
      var g = c.g || 'Other', k = g.split('|')[0].trim();
      if (!gm[k]) { gm[k] = { n: k, fa: (g.split('|')[1] || '').trim(), list: [] }; groups.push(gm[k]); }
      gm[k].list.push(c);
    });
    h += groups.map(function (g) {
      return '<div class="band"><h3>' + esc(g.n) + (g.fa ? ' <small dir="auto">' + esc(g.fa) + '</small>' : '') + '</h3><div class="ccgrid">' + g.list.map(function (c) {
        var n = M.conds.filter(function (x) { return x.cc.indexOf(c.id) >= 0; }).length;
        return '<a class="cc" href="#/cc/' + c.id + '"><b>' + esc(c.n) + '</b><small>' + esc(c.fa) + '</small><i>' + n + '</i>' +
          (c.cm && c.cm.length ? '<span class="cmn">' + c.cm.length + ' can\'t-miss</span>' : '') + '</a>';
      }).join('') + '</div></div>';
    }).join('');
    h += '<h2>Browse by section</h2><div class="seclist">' + M.sections.map(function (s) {
      var cs = M.conds.filter(function (c) { return c.sec === s.id; }), d = cs.filter(function (c) { return done[c.id]; }).length, p = cs.length ? Math.round(d / cs.length * 100) : 0;
      return '<a class="secrow" href="#/s/' + s.id + '"><b>' + esc(s.n) + '</b><span class="fa" dir="auto">' + esc(s.fa) + '</span><div class="bar"><i style="width:' + p + '%"></i></div><span class="mute tiny">' + cs.length + ' conditions · ' + d + ' studied</span></a>';
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
      if (it.cat !== last) { h += '<li class="ogrp"><span class="gl gl-' + it.cat + '">' + it.cat + '</span>' + TN.CAT_NAME[it.cat] + '</li>'; last = it.cat; }
      h += '<li class="oitem" data-n="' + it.n + '" value="' + it.n + '"><label><input type="checkbox" data-pick="' + it.n + '" aria-label="Select order ' + it.n + '"><span class="ocat c-' + it.cat + '">' + it.cat + '</span><span class="otext">' + esc(it.t) + '</span></label>' +
        flagsHtml(it.fl) + (set.why && it.why ? '<div class="why" dir="auto"><i>Why:</i> ' + esc(it.why) + '</div>' : '') + '</li>';
    });
    return h + '</ol></div>';
  }
  var cur = null; // current condition view state
  function vCond(c, vid) {
    var v = c.variants.filter(function (x) { return x.id === vid; })[0] || c.variants[0];
    var o = TN.compose(v); cur = { c: c, v: v, o: o }; pushRecent(c.id);
    var bm = S.get('bm', {}), done = S.get('done', {});
    var h = '<p><a href="#/s/' + c.section + '">← ' + esc(secName(c.section)) + '</a>' +
      (c.cc || []).map(function (id) { return ccMeta[id] ? ' <a class="chip sm" href="#/cc/' + id + '">' + esc(ccMeta[id].n) + '</a>' : ''; }).join('') + '</p>';
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
    h += '<div class="obar sticky"><button data-act="copy-all" class="pri">⧉ Copy orders</button> <button data-act="copy-pick">⧉ Copy ticked</button> <button data-act="pick-all">Tick all</button> <button data-act="cover" aria-pressed="false">🙈 Cover orders</button> <a class="btn" href="#/print/' + c.id + '/' + v.id + '">🖶 Print sheet</a></div>';
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
    if (!scope) return { html: '<p><a href="#/">← Home</a></p><h1>Self-test</h1><p>You see the scenario, recall the orders from memory, reveal and grade yourself. Cards you miss come back sooner. For a harder, open-ended version where you build the sheet order by order, use the <a href="#/case">case simulator</a>.</p><div class="grid">' +
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

  /* ---- About / install / share ---- */
  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; var b = $('#install'); if (b) b.hidden = false; });
  function vAbout() {
    var h = '<p><a href="#/">← Home</a></p><h1>About &amp; install</h1>';
    h += banner + '<h2>How an order is built</h2><p>Every order set starts with <b>Imp, Cond, Act, Diet</b>, then <b>Please:</b> items in the fixed NILSTATCo order:</p><ol><li><b>N</b> Nursing: IV line fix, Cardiac monitoring and pulse oximetry, O2 therapy, ECG</li><li><b>I</b> Imaging: CXR (PA or portable) and any other imaging</li><li><b>L</b> Lab tests: one item, CBC, BUN, Cr, Na, K plus case-specific tests</li><li><b>S</b> Serum</li><li><b>A</b> Antibiotics (zero or more)</li><li><b>T</b> Treatment (zero or more)</li><li><b>Co</b> Consult (zero or more)</li></ol>';
    h += '<p><b>Fluid rule:</b> mild volume depletion (tachycardia): N/S 500 cc – 1 L, then maintenance (NPO: Serum 1/3 – 2/3, 1 L TDS). Not applied in CKD, AKI, anuria or heart failure / pulmonary edema.</p>';
    h += '<h2>How to practise</h2><ul><li><b>Case simulator</b> gives you a full vignette and an empty sheet. You name the impression, set the disposition line, then write the orders yourself by searching every order in the database. It scores <i>coverage</i> (how much of the book&rsquo;s set you ordered) and <i>precision</i> (how much of what you ordered belongs), and shows what you missed and why it mattered.</li><li><b>Self-test</b> shows the scenario and asks you to recall the whole sheet from memory, then you grade yourself.</li><li>Both feed one spaced-repetition schedule kept on this device.</li></ul>';
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
    var seg = (location.hash.split('/')[1] || '').split('?')[0];
    $$('#nav a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#/' + seg); });
    $$('#tabs a').forEach(function (a) { a.classList.toggle('on', a.dataset.tab === seg); });
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
    else if (hs === '#/case') show(TN.Case.setup());
    else if (hs === '#/case/go') show(TN.Case.run());
    else if (hs === '#/about') show(vAbout());
    else if (hs === '#/q') { show(vSearch()); if (!q) searchEl.focus(); }
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

  /* ---------- bridge for js/case.js ---------- */
  TN.ui = { sheetHtml: sheetHtml, secName: secName, loadAll: loadAll, pairs: pairs, shuffle: shuffle, toast: toast, condMeta: condMeta, ccMeta: ccMeta, condRow: condRow };

  /* ---------- start ---------- */
  $('#foot').textContent = 'Tintinalli-based orders · content ' + M.version + ' · study aid, not a protocol';
  applySettings(); route();
  var idle = window.requestIdleCallback || function (f) { setTimeout(f, 800); };
  idle(function () { loadAll().then(function (all) { buildFullIdx(all); if (location.hash === '#/q') show(vSearch()); }).catch(function () {}); });
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('../sw.js').catch(function () {});
})();
