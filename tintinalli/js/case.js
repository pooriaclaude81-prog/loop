/* Case simulator: a full vignette, then the user writes the whole order set
   by picking from every order in the database. Graded against the book's set. */
(function (root) {
  'use strict';
  var TN = root.TN = root.TN || {};
  var CS = TN.Case = {};
  var esc = TN.esc, S = TN.store;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- order signature: collapses dose / route / wording ---------- */
  var UNIT = 'mg|mcg|µg|g|kg|ml|cc|l|u|iu|units?|mmol|meq|mmhg|%|mg/kg|mcg/kg|g/kg|ml/kg|u/kg|units/kg|mcg/min|mg/min|ml/h|l/min|mg/dl|mmol/l';
  var STOP = new RegExp('\\b(iv|im|po|sc|sq|sl|pr|pv|io|et|neb|nebulized|nebulised|inhaled|oral|orally|topical|stat|bid|tid|tds|qid|od|nocte|prn|daily|hourly|infusion|bolus|loading|load|maintenance|dose|doses|then|every|over|per|min|mins|minute|minutes|hour|hours|hr|hrs|h|day|days|week|weeks|max|maximum|titrated|titrate|followed|by|up|to|and|or|the|a|an|of|for|with|without|if|in|on|at|as|needed|chewed|first|initial|single|total|further|more|both|each|any|all)\\b', 'g');
  /* words too vague on their own: the signature then keeps two words */
  var GEN = {};
  ('ct mri mr us ultrasound usg sono sonography sonogram doppler echo echocardiography radiograph radiographs radiography xray film films plain imaging scan ' +
   'type blood serum plasma urine urinary stool wound swab culture cultures bedside point portable repeat serial measure calculate check obtain consider ' +
   'chest abdominal abdomen pelvic pelvis head neck spine spinal skull cervical thoracic lumbar limb extremity foot hand wrist knee ankle shoulder elbow hip joint ' +
   'soft fluid fluids nerve local regional consult consultation referral refer admit admission transfer discharge observation observe monitor monitoring ' +
   'surgery surgical urgent emergent emergency immediate early treat treatment supportive standard high low rapid slow sodium potassium calcium magnesium ' +
   'activated normal hypertonic packed fresh whole human anti intravenous nasal nasogastric gastric bowel wound skin eye ear topical wound').split(' ').forEach(function (w) { GEN[w] = 1; });
  var FILLER = /^(not routinely required|none routine|none required|none$|none in ed|not required|as indicated|per injuries|no specific (treatment|emergency)|only if it will change)/i;
  function clean(t) {
    var s = String(t || '').toLowerCase().replace(/\([^)]*\)/g, ' ');
    s = s.split(/[,;:]| — | – | - /)[0];
    s = s.replace(/[^a-z0-9/+. ]+/g, ' ').replace(/\s\/\s/g, ' ');
    s = s.replace(new RegExp('(^|\\s)[0-9][0-9.]*\\s*(' + UNIT + ')?(?=\\s|$)', 'g'), ' ');
    return s.replace(STOP, ' ').replace(/\s+/g, ' ').trim();
  }
  function sig(t) {
    var s = clean(t)
      .replace(/^chest (x ?ray|radiograph|film)/, 'cxr')
      .replace(/^ekg/, 'ecg')
      .replace(/^(n\/s|ns|saline)\b/, 'normal saline')
      .replace(/^ct scan/, 'ct')
      .replace(/^cr\b/, 'creatinine')
      .replace(/^(abdominal (x ?ray|radiograph)|kub)/, 'kub');
    var w = s.split(' ').filter(Boolean);
    if (!w.length) return '';
    return GEN[w[0]] ? w.slice(0, 2).join(' ') : w[0];
  }
  CS.sig = sig;

  /* lab lines are comma lists: score each test on its own, minus the fixed five */
  var FIXLAB = { cbc: 1, bun: 1, creatinine: 1, na: 1, sodium: 1, k: 1, potassium: 1, 'blood count': 1 };
  function parts(cat, t) {
    if (cat !== 'L') return [t];
    return t.split(/[,;]/).map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 2; });
  }
  function orderList(v, cat) {
    var out = [];
    (v.o[cat] || []).forEach(function (it) {
      var full = it.t === '@fluid' ? TN.fluidText(v.diet) : it.t;
      if (FILLER.test(full)) return;
      parts(cat, full).forEach(function (t) {
        var g = sig(t); if (!g || (cat === 'L' && FIXLAB[g])) return;
        out.push({ cat: cat, sig: g, t: t, why: it.why || '', iff: it.if || '', hi: (it.fl || []).some(function (x) { return x.k === 'hi'; }) });
      });
    });
    return out;
  }

  /* ---------- the order palette: every order in the database ---------- */
  var PAL = null;
  function palette(all) {
    if (PAL) return PAL;
    var map = {};
    all.forEach(function (c) {
      c.variants.forEach(function (v) {
        TN.CATS.forEach(function (cat) {
          orderList(v, cat).forEach(function (o) {
            var k = cat + '|' + o.sig, e = map[k] || (map[k] = { cat: cat, sig: o.sig, n: 0, texts: {} });
            e.n++; e.texts[o.t] = (e.texts[o.t] || 0) + 1;
          });
        });
      });
    });
    PAL = Object.keys(map).map(function (k) {
      var e = map[k], best = '', bn = -1;
      Object.keys(e.texts).forEach(function (t) { if (e.texts[t] > bn || (e.texts[t] === bn && t.length < best.length)) { bn = e.texts[t]; best = t; } });
      e.t = best.charAt(0).toUpperCase() + best.slice(1); e.q = (e.sig + ' ' + best).toLowerCase(); delete e.texts; return e;
    }).sort(function (a, b) { return b.n - a.n || a.sig.localeCompare(b.sig); });
    PAL.by = {}; TN.CATS.forEach(function (c) { PAL.by[c] = PAL.filter(function (e) { return e.cat === c; }); });
    return PAL;
  }
  CS.palette = palette;

  /* ---------- case building ---------- */
  /* keep the bullets that describe the patient; drop management text, differential
     dumps and table transcriptions, which would either answer the case or read as noise */
  var MGMT = /درمان|آنتی‌بیوتیک|انفوزیون|دوز|تجویز|\bmg\b|\bmcg\b|\bIV\b|\bPO\b|\bIM\b/i;
  var NOISE = /جدول|تشخیص افتراقی|افتراق|الگوریتم|شکل \d/;
  function makeCase(p) {
    var c = p.cond, v = p.variant, f = (c.features || []).filter(Boolean);
    var keep = f.filter(function (x) { return !MGMT.test(x) && !NOISE.test(x) && x.length < 340; });
    if (keep.length < 2) keep = f.filter(function (x) { return !NOISE.test(x); });
    return { cond: c, v: v, sc: v.sc || '', find: keep.length ? keep : f, rf: c.redflags || [] };
  }
  function gold(v) {
    var out = [];
    TN.CATS.forEach(function (cat) {
      orderList(v, cat).forEach(function (o) {
        if (!out.some(function (x) { return x.cat === o.cat && x.sig === o.sig; })) out.push(o);
      });
    });
    return out;
  }
  CS.gold = gold;

  /* ---------- state ---------- */
  var st = null, tick = null;
  var MODES = { guided: 'Guided', full: 'Full case' };
  function cfg() { return Object.assign({ mode: 'guided', scope: 'all' }, S.get('cs.cfg', {})); }
  function setCfg(o) { S.set('cs.cfg', Object.assign(cfg(), o)); }
  function hhmmss(ms) { var s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }

  /* ---------- setup view ---------- */
  CS.setup = function () {
    var M = TN.META, c = cfg(), log = S.get('cs.log', []), best = S.get('cs.best', {});
    var done = Object.keys(best).length, avg = log.length ? Math.round(log.reduce(function (a, x) { return a + x.s; }, 0) / log.length) : 0;
    var h = '<h1>Case simulator</h1><p class="mute">A full vignette, no multiple choice. You name the impression, set Cond / Act / Diet / ECG / CXR, then write the order set yourself by picking from <b>every order in the database</b>. It is scored against the book\'s set for that case.</p>';
    h += '<div class="stats"><div class="stat"><b>' + done + '</b><span>cases played</span></div><div class="stat"><b>' + (log.length ? avg + '%' : '—') + '</b><span>average score</span></div><div class="stat"><b>' + (PAL ? PAL.length : '…') + '</b><span>orders in palette</span></div></div>';
    h += '<div class="cs-panel"><h2><span class="num">1</span> Difficulty</h2><p class="hint">Guided narrows the differential to the presenting complaint and tells you how many orders each slot needs. Full case gives you all ' + M.conds.length + ' conditions and no counts.</p><div class="seg" id="cs-mode">' +
      Object.keys(MODES).map(function (k) { return '<button type="button" data-mode="' + k + '" class="' + (c.mode === k ? 'on' : '') + '">' + MODES[k] + '</button>'; }).join('') + '</div></div>';
    h += '<div class="cs-panel"><h2><span class="num">2</span> Where should the cases come from?</h2><label class="row col"><span class="hint">Scope</span><select id="cs-scope">' +
      '<option value="all">Everything (' + M.conds.length + ' conditions)</option><option value="bm">My bookmarks</option>' +
      '<optgroup label="Chief complaint">' + M.cc.map(function (x) { return '<option value="cc:' + x.id + '">' + esc(x.n) + '</option>'; }).join('') + '</optgroup>' +
      '<optgroup label="Section">' + M.sections.map(function (x) { return '<option value="sec:' + x.id + '">' + esc(x.n) + '</option>'; }).join('') + '</optgroup></select></label>';
    h += '<div class="obar"><button class="pri" data-act="cs-start">▶ Start a case</button> <a class="btn" href="#/test">Self-test instead</a></div></div>';
    if (log.length) h += '<h2>Recent cases</h2><ul class="clist">' + log.slice(0, 8).map(function (x) {
      var cm = TN.ui.condMeta[x.c];
      return '<li class="crow"><a class="cname" href="#/c/' + x.c + (x.v ? '/' + x.v : '') + '">' + esc(cm ? cm.n : x.c) + '</a> <span class="badge ' + (x.s >= 80 ? 'st-reviewed' : x.s >= 55 ? 'st-draft' : 'st-demo') + '">' + x.s + '%</span></li>';
    }).join('') + '</ul>';
    return { html: h, title: 'Case simulator', after: function () {
      var sel = $('#cs-scope'); if (sel) sel.value = c.scope;
      TN.ui.loadAll().then(function (all) { palette(all); var b = $('.stat b'); if (b && $('.stats')) $$('.stats .stat b')[2].textContent = PAL.length; });
    } };
  };

  /* ---------- run view ---------- */
  CS.run = function () {
    return { html: '<div id="csbox"><div class="skel" style="width:35%;height:1.5em"></div><div class="skel"></div><div class="skel" style="width:80%"></div></div>', title: 'Case simulator', after: function () {
      TN.ui.loadAll().then(function (all) { palette(all); nextCase(all); });
    } };
  };

  function poolFor(all) {
    var c = cfg(), bm = S.get('bm', {});
    var cs = all.filter(function (x) {
      if (c.scope === 'all') return true;
      if (c.scope === 'bm') return bm[x.id];
      if (c.scope.indexOf('cc:') === 0) return x.cc.indexOf(c.scope.slice(3)) >= 0;
      if (c.scope.indexOf('sec:') === 0) return x.section === c.scope.slice(4);
      return true;
    });
    return TN.ui.pairs(cs).filter(function (p) { return p.variant.sc && gold(p.variant).length >= 3; });
  }

  function nextCase(all) {
    var ps = poolFor(all);
    if (!ps.length) { $('#csbox').innerHTML = '<div class="warn">No cases in this scope yet. <a href="#/case">Pick another scope</a>.</div>'; return; }
    var best = S.get('cs.best', {});
    var fresh = ps.filter(function (p) { return !best[p.cond.id + '/' + p.variant.id]; });
    var use = fresh.length ? fresh : ps;
    var p = use[Math.floor(Math.random() * use.length)];
    startCase(p, all);
  }

  function startCase(p, all) {
    st = { all: all, p: p, c: makeCase(p), gold: gold(p.variant), dx: null, dxv: null, hdr: {}, ord: [], t0: Date.now(), slot: 'I', query: '', shown: cfg().mode === 'guided' ? 6 : 4, done: false };
    render(); startClock();
  }
  function startClock() {
    clearInterval(tick);
    tick = setInterval(function () { var e = $('#csclock'); if (!e) return clearInterval(tick); if (!st.done) e.textContent = '⏱ ' + hhmmss(Date.now() - st.t0); }, 1000);
  }

  var HDR = [
    ['cond', 'Cond', ['Urgent', 'Emergent']],
    ['act', 'Act', ['RBR', 'CBR']],
    ['diet', 'Diet', ['PO', 'NPO']],
    ['ecg', 'ECG', ['none', 'once', 'stat']],
    ['cxr', 'CXR', ['none', 'PA', 'portable']]
  ];

  function stepsHtml() {
    var steps = [['Case', true], ['Impression', !!st.dx], ['Disposition', Object.keys(st.hdr).length === 5], ['Orders', st.ord.length > 0]];
    var first = steps.findIndex(function (x) { return !x[1]; });
    return steps.map(function (s, i) { return '<li class="' + (s[1] ? 'done' : (i === first ? 'on' : '')) + '">' + s[0] + '</li>'; }).join('');
  }
  function slotBarHtml() {
    var guided = cfg().mode === 'guided', need = {}, have = {};
    st.gold.forEach(function (g) { need[g.cat] = (need[g.cat] || 0) + 1; });
    st.ord.forEach(function (o) { have[o.cat] = (have[o.cat] || 0) + 1; });
    return TN.CATS.map(function (k) {
      var n = guided ? (need[k] || 0) : null;
      return '<button type="button" class="c-' + k + (st.slot === k ? ' on' : '') + '" data-slot="' + k + '">' + k + ' · ' + TN.CAT_NAME[k] +
        (n !== null ? ' <span class="n">' + (have[k] || 0) + '/' + n + '</span>' : (have[k] ? ' <span class="n">' + have[k] + '</span>' : '')) + '</button>';
    }).join('');
  }
  function refreshLive() {
    var s = $('#cs-steps'); if (s) s.innerHTML = stepsHtml();
    var sl = $('#cs-slots'); if (sl) sl.innerHTML = slotBarHtml();
    var sh = $('#cs-sheet'); if (sh) sh.innerHTML = sheetInner();
    drawOrders();
  }
  function render() {
    if (!$('#csbox') || !st) return;
    var c = st.c, M = TN.META, mode = cfg().mode, guided = mode === 'guided';
    var ccn = c.cond.cc.map(function (id) { var x = TN.ui.ccMeta[id]; return x ? x.n : id; });
    var h = '<div class="cs-head"><ul class="cs-steps" id="cs-steps">' + stepsHtml() + '</ul><span class="clock" id="csclock">⏱ ' + hhmmss(Date.now() - st.t0) + '</span></div>';

    /* case card */
    h += '<article class="casecard"><header><b>Case</b>' + ccn.map(function (n) { return '<span class="chip sm">' + esc(n) + '</span>'; }).join('') +
      '<span class="badge st-draft" style="margin-inline-start:auto">' + MODES[mode] + '</span></header><div class="casebody">';
    h += '<p class="vignette" dir="rtl">' + esc(c.sc) + '</p>';
    var fshow = c.find.slice(0, st.shown);
    if (fshow.length) h += '<div class="findings"><h4>یافته‌های بالینی · what the book describes in this patient</h4><ul>' + fshow.map(function (x) { return '<li dir="auto">' + esc(x) + '</li>'; }).join('') + '</ul>' +
      (c.find.length > st.shown ? '<button data-act="cs-more" class="gho">+ ' + (c.find.length - st.shown) + ' more</button>' : '') + '</div>';
    var ccrf = [];
    c.cond.cc.forEach(function (id) { var x = TN.ui.ccMeta[id]; if (x) (x.rf || []).forEach(function (r) { if (ccrf.indexOf(r) < 0) ccrf.push(r); }); });
    if (ccrf.length) h += '<details class="findings"><summary class="mute small" style="cursor:pointer">Red flags to look for with this presentation (' + ccrf.length + ')</summary><ul>' +
      ccrf.map(function (x) { return '<li dir="auto">' + esc(x) + '</li>'; }).join('') + '</ul></details>';
    h += '</div></article>';

    if (st.done) { $('#csbox').innerHTML = h + st.resHtml; return; }

    /* 1 impression */
    h += '<section class="cs-panel"><h2><span class="num">1</span> Impression</h2><p class="hint">' +
      (guided ? 'Pick from the conditions that present with this complaint.' : 'Pick from every condition in the book.') + '</p>';
    if (st.dx) {
      h += '<div class="chosen"><span class="tagx">' + esc(st.dx.n) + '<button data-act="cs-dxclear" aria-label="Change impression">✕</button></span></div>';
      var vs = st.dx.v || [];
      if (vs.length > 1) h += '<p class="hint" style="margin-top:10px">Which stratum of this condition?</p><div class="seg">' + vs.map(function (x) { return '<button type="button" data-dxv="' + x.id + '" class="' + (st.dxv === x.id ? 'on' : '') + '">' + (x.lv ? 'L' + x.lv + ' ' : '') + esc(x.n) + '</button>'; }).join('') + '</div>';
    } else {
      h += '<div class="pick"><input id="cs-dxq" type="search" placeholder="Type a condition…" autocomplete="off" aria-label="Search conditions" value="' + esc(st.dxq || '') + '"></div><ul class="optlist" id="cs-dxlist"></ul>';
    }
    h += '</section>';

    /* 2 disposition */
    h += '<section class="cs-panel"><h2><span class="num">2</span> Disposition line</h2><p class="hint">The first four lines of every sheet, plus which ECG and CXR this patient needs.</p><div class="dgrid">';
    HDR.forEach(function (f) {
      h += '<div><div class="tiny mute" style="font-weight:700;text-transform:uppercase;letter-spacing:.05em">' + f[1] + '</div><div class="seg">' +
        f[2].map(function (o) { return '<button type="button" data-hdr="' + f[0] + '" data-val="' + o + '" class="' + (st.hdr[f[0]] === o ? 'on' : '') + '">' + o + '</button>'; }).join('') + '</div></div>';
    });
    h += '</div></section>';

    /* 3 orders */
    h += '<section class="cs-panel"><h2><span class="num">3</span> Orders</h2><p class="hint">The fixed block is already written for you. Add everything else this patient needs, in the right NILSTATCo slot, from the ' + PAL.length + ' orders in the database. ' +
      (guided ? 'The number on each slot is how many the book\'s set has.' : 'No counts in Full case mode — decide yourself.') + '</p>';
    h += '<div class="slotbar" id="cs-slots">' + slotBarHtml() + '</div>';
    h += '<div class="pick"><input id="cs-oq" type="search" placeholder="Search ' + TN.CAT_NAME[st.slot] + ' orders…" autocomplete="off" aria-label="Search orders" value="' + esc(st.query) + '"></div><ul class="optlist" id="cs-olist"></ul>';
    h += '<h3>My sheet</h3><ul class="mysheet" id="cs-sheet">' + sheetInner() + '</ul>';
    h += '<div class="obar"><button class="pri" data-act="cs-submit">✓ Submit the sheet</button> <button data-act="cs-skip">↷ Skip this case</button></div></section>';

    $('#csbox').innerHTML = h;
    drawDx(); drawOrders();
    var dq = $('#cs-dxq'); if (dq && st.focus === 'dx') { dq.focus(); dq.selectionStart = dq.value.length; }
    var oq = $('#cs-oq'); if (oq && st.focus === 'o') { oq.focus(); oq.selectionStart = oq.value.length; }
  }

  function sheetInner() {
    var labs = st.ord.filter(function (o) { return o.cat === 'L'; });
    var fx = ['IV line fix', 'Cardiac monitoring and pulse oximetry', 'O2 therapy (per protocol)'];
    if (st.hdr.ecg === 'stat') fx.push('ECG STAT, 0 – 30 – 60 min'); else if (st.hdr.ecg === 'once') fx.push('ECG');
    if (st.hdr.cxr === 'PA') fx.push('CXR (PA)'); else if (st.hdr.cxr === 'portable') fx.push('CXR (portable)');
    var h = '';
    fx.forEach(function (t, i) { h += '<li class="fixed"><b>' + (i + 1) + '.</b><span class="mi">' + esc(t) + '</span></li>'; });
    var n = fx.length + 1;
    h += '<li class="fixed"><b>' + n + '.</b><span class="ocat c-L">L</span><span class="mi">CBC, BUN, Cr, Na, K' +
      labs.map(function (o) { return ', <b>' + esc(o.t) + '</b>'; }).join('') + '</span>' +
      (labs.length ? '<button class="gho" data-rm="' + esc(labs[labs.length - 1].cat + '|' + labs[labs.length - 1].sig) + '" aria-label="Remove the last lab">✕</button>' : '') + '</li>';
    TN.CATS.forEach(function (cat) {
      if (cat === 'L') return;
      st.ord.filter(function (o) { return o.cat === cat; }).forEach(function (o) {
        n++; h += '<li><b>' + n + '.</b><span class="ocat c-' + cat + '">' + cat + '</span><span class="mi">' + esc(o.t) + '</span><button class="gho" data-rm="' + esc(o.cat + '|' + o.sig) + '" aria-label="Remove">✕</button></li>';
      });
    });
    if (!st.ord.length) h += '<li class="empty">Nothing added yet — search a slot above and tap to add.</li>';
    return h;
  }

  function drawDx() {
    var box = $('#cs-dxlist'); if (!box) return;
    var M = TN.META, guided = cfg().mode === 'guided', q = (st.dxq || '').toLowerCase().trim();
    if (!guided && q.length < 2) { box.innerHTML = '<li class="none">Type at least two letters to search all ' + M.conds.length + ' conditions.</li>'; return; }
    var list = M.conds.filter(function (c) { return !guided || c.cc.some(function (x) { return st.c.cond.cc.indexOf(x) >= 0; }); });
    if (q) list = list.filter(function (c) { return (c.n + ' ' + c.fa + ' ' + c.kw).toLowerCase().indexOf(q) >= 0; });
    list = list.sort(function (a, b) { return a.n.localeCompare(b.n); }).slice(0, 40);
    box.innerHTML = list.length ? list.map(function (c) {
      return '<li><button type="button" data-dx="' + c.id + '"><span>' + esc(c.n) + '</span> <span class="oc" dir="auto">' + esc(c.fa) + '</span></button></li>';
    }).join('') : '<li class="none">No condition matches “' + esc(q) + '”.</li>';
  }

  function drawOrders() {
    var box = $('#cs-olist'); if (!box) return;
    var q = st.query.toLowerCase().trim(), list = (PAL.by[st.slot] || []);
    if (q) list = list.filter(function (e) { return e.q.indexOf(q) >= 0; });
    var taken = {}; st.ord.forEach(function (o) { taken[o.cat + '|' + o.sig] = 1; });
    list = list.slice(0, 45);
    box.innerHTML = list.length ? list.map(function (e) {
      var k = e.cat + '|' + e.sig, on = taken[k], t = e.t.length > 104 ? e.t.slice(0, 101) + '…' : e.t;
      return '<li><button type="button" data-add="' + esc(k) + '"' + (on ? ' disabled' : '') + ' title="' + esc(e.t) + '">' + (on ? '✓ ' : '+ ') + esc(t) + ' <span class="oc">×' + e.n + '</span></button></li>';
    }).join('') : '<li class="none">Nothing in ' + TN.CAT_NAME[st.slot] + ' matches “' + esc(q) + '”.</li>';
  }

  /* ---------- grading ---------- */
  function submit() {
    var p = st.p, c = p.cond, v = p.variant, g = st.gold, mine = st.ord, ms = Date.now() - st.t0;
    var used = {}, hit = [], slot = [], extra = [];
    function free(x) { return !used[x.cat + '|' + x.sig]; }
    mine.forEach(function (o) {
      var ex = g.filter(function (x) { return x.cat === o.cat && x.sig === o.sig && free(x); })[0];
      if (ex) { used[ex.cat + '|' + ex.sig] = 1; return hit.push(ex); }
      var sm = g.filter(function (x) { return x.sig === o.sig && free(x); })[0];
      if (sm) { used[sm.cat + '|' + sm.sig] = 1; return slot.push({ g: sm, o: o }); }
      extra.push(o);
    });
    var miss = g.filter(free);
    var cov = g.length ? (hit.length + slot.length * .5) / g.length : 1;
    var prec = mine.length ? (hit.length + slot.length) / mine.length : (g.length ? 0 : 1);
    var dxOk = st.dx && st.dx.id === c.id, vOk = dxOk && (!st.dxv || st.dxv === v.id) && (st.dxv === v.id || (st.dx.v || []).length === 1);
    var hdrHit = HDR.filter(function (f) { return st.hdr[f[0]] === v[f[0]]; });
    var score = Math.round((dxOk ? 22 : 0) + (vOk ? 8 : 0) + hdrHit.length * 3 + cov * 45 + prec * 10);
    score = Math.max(0, Math.min(100, score));

    var crit = miss.filter(function (o) { return o.hi || (v.cond === 'Emergent' && (o.cat === 'T' || o.cat === 'A')); });
    var band = score >= 80 ? 'good' : score >= 55 ? 'mid' : 'bad';
    var h = '<section class="cs-panel"><h2>Debrief</h2>';
    h += '<div class="verdict"><div class="vbox ' + band + '"><b>' + score + '%</b><span>overall</span></div>' +
      '<div class="vbox ' + (cov >= .8 ? 'good' : cov >= .5 ? 'mid' : 'bad') + '"><b>' + Math.round(cov * 100) + '%</b><span>coverage</span></div>' +
      '<div class="vbox ' + (prec >= .8 ? 'good' : prec >= .5 ? 'mid' : 'bad') + '"><b>' + Math.round(prec * 100) + '%</b><span>precision</span></div>' +
      '<div class="vbox"><b>' + hhmmss(ms) + '</b><span>time</span></div></div>';

    h += '<h3>Impression</h3><ul class="dres"><li class="' + (dxOk ? 'ok' : 'bad') + '"><span class="mk">' + (dxOk ? '✔' : '✘') + '</span><span>' +
      (dxOk ? 'Correct: <b>' + esc(c.name) + '</b>' : 'You said <b>' + esc(st.dx ? st.dx.n : '—') + '</b>. The book\'s case is <b>' + esc(c.name) + '</b>') +
      '<span class="sub">' + esc(v.imp) + '</span></span></li>';
    if (dxOk && (st.dx.v || []).length > 1) h += '<li class="' + (vOk ? 'ok' : 'meh') + '"><span class="mk">' + (vOk ? '✔' : '~') + '</span><span>Stratum: <b>' + esc(v.name) + '</b>' + (vOk ? '' : ' — you picked a different stratum, so the acuity and some orders change') + '</span></li>';
    h += '</ul>';
    if (!dxOk) {
      var cm = [];
      c.cc.forEach(function (id) { var x = TN.ui.ccMeta[id]; if (x) (x.cm || []).forEach(function (m) { if (!cm.some(function (y) { return y.n === m.n; })) cm.push(m); }); });
      if (cm.length) h += '<p class="mute small">Can\'t-miss diagnoses for this presentation — work through these before settling on one:</p><div class="chips">' +
        cm.map(function (m) { return m.id && TN.ui.condMeta[m.id] ? '<a class="chip sm" href="#/c/' + m.id + '">' + esc(m.n) + '</a>' : '<span class="chip sm">' + esc(m.n) + '</span>'; }).join('') + '</div>';
    }

    h += '<h3>Disposition line</h3><ul class="dres">' + HDR.map(function (f) {
      var ok = st.hdr[f[0]] === v[f[0]];
      return '<li class="' + (ok ? 'ok' : 'bad') + '"><span class="mk">' + (ok ? '✔' : '✘') + '</span><span>' + f[1] + ': <b>' + esc(v[f[0]]) + '</b>' + (ok ? '' : ' — you put ' + esc(st.hdr[f[0]] || '—')) + '</span></li>';
    }).join('') + '</ul>';

    if (crit.length) h += '<h3>Critical misses</h3><ul class="dres">' + crit.map(function (o) {
      return '<li class="bad"><span class="mk">⚠</span><span><span class="ocat c-' + o.cat + '">' + o.cat + '</span> <b>' + esc(o.t) + '</b>' + (o.why ? '<span class="sub">' + esc(o.why) + '</span>' : '') + '</span></li>';
    }).join('') + '</ul>';

    h += '<h3>Orders you got (' + hit.length + ' of ' + g.length + ')</h3>' + (hit.length ? '<ul class="dres">' + hit.map(function (o) {
      return '<li class="ok"><span class="mk">✔</span><span><span class="ocat c-' + o.cat + '">' + o.cat + '</span> ' + esc(o.t) + '</span></li>';
    }).join('') + '</ul>' : '<p class="mute">None.</p>');

    if (slot.length) h += '<h3>Right order, wrong slot</h3><p class="mute small">Half credit. The slot decides where the nurse reads it, so it matters on a real sheet.</p><ul class="dres">' + slot.map(function (x) {
      return '<li class="meh"><span class="mk">~</span><span>' + esc(x.g.t) + '<span class="sub">You put it in <b>' + x.o.cat + ' · ' + TN.CAT_NAME[x.o.cat] + '</b>; the book has it under <b>' + x.g.cat + ' · ' + TN.CAT_NAME[x.g.cat] + '</b>.</span></span></li>';
    }).join('') + '</ul>';

    var m2 = miss.filter(function (o) { return crit.indexOf(o) < 0; });
    if (m2.length) h += '<h3>Missed</h3><ul class="dres">' + m2.map(function (o) {
      return '<li class="bad"><span class="mk">✘</span><span><span class="ocat c-' + o.cat + '">' + o.cat + '</span> <b>' + esc(o.t) + '</b>' + (o.iff ? ' <i class="mute">(' + esc(o.iff) + ')</i>' : '') + (o.why ? '<span class="sub">' + esc(o.why) + '</span>' : '') + '</span></li>';
    }).join('') + '</ul>';

    if (extra.length) h += '<h3>Not in the book\'s set</h3><p class="mute small">Some of these may still be defensible in real practice; they are simply not in this case\'s set, and over-ordering costs time, money and false positives.</p><ul class="dres">' + extra.map(function (o) {
      return '<li class="meh"><span class="mk">~</span><span><span class="ocat c-' + o.cat + '">' + o.cat + '</span> ' + esc(o.t) + '</span></li>';
    }).join('') + '</ul>';

    h += '<h3>The book\'s full sheet</h3>' + TN.ui.sheetHtml(c, v, TN.compose(v), 'cs-gold');
    h += '<div class="obar"><button class="pri" data-act="cs-next">▶ Next case</button> <button data-act="cs-retry">↺ Retry this case</button> <a class="btn" href="#/c/' + c.id + '/' + v.id + '">Open the full page</a> <a class="btn" href="#/case">Settings</a></div>';
    h += '<p class="mute small">Scope: ' + esc(TN.ui.secName(c.section)) + ' · chapter ' + esc(String(c.ch || '')) + ' · ' + esc(c.source || '') + '</p></section>';
    st.resHtml = h; st.done = true; clearInterval(tick);

    /* remember + feed spaced repetition */
    var key = c.id + '/' + v.id, best = S.get('cs.best', {});
    if (!best[key] || best[key] < score) best[key] = score;
    S.set('cs.best', best);
    var log = S.get('cs.log', []); log.unshift({ c: c.id, v: v.id, s: score, at: Date.now() }); S.set('cs.log', log.slice(0, 50));
    var lt = S.get('lt', {}), DAYS = [0, 1, 3, 7, 14, 30], b = lt[key] || { box: 0 };
    b.box = score >= 80 ? Math.min(b.box + 1, DAYS.length - 1) : score >= 55 ? b.box : 0;
    b.due = Date.now() + DAYS[b.box] * 864e5; lt[key] = b; S.set('lt', lt);
    render();
    var r = $('#csbox .cs-panel'); if (r) r.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  /* ---------- events ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-act],[data-mode],[data-slot],[data-add],[data-rm],[data-dx],[data-dxv],[data-hdr]'); if (!t) return;
    var d = t.dataset;
    if (d.mode) { setCfg({ mode: d.mode }); $$('#cs-mode button').forEach(function (b) { b.classList.toggle('on', b === t); }); return; }
    if (d.act === 'cs-start') { var s = $('#cs-scope'); setCfg({ scope: s ? s.value : 'all' }); location.hash = '#/case/go'; return; }
    if (!st) return;
    if (d.act === 'cs-more') { st.shown += 3; render(); }
    else if (d.slot) {
      st.slot = d.slot; st.query = '';
      var i = $('#cs-oq'); if (i) { i.value = ''; i.placeholder = 'Search ' + TN.CAT_NAME[d.slot] + ' orders…'; i.focus(); }
      refreshLive();
    } else if (d.add) {
      var k = d.add, e2 = PAL.filter(function (x) { return x.cat + '|' + x.sig === k; })[0];
      if (e2 && !st.ord.some(function (o) { return o.cat + '|' + o.sig === k; })) st.ord.push({ cat: e2.cat, sig: e2.sig, t: e2.t });
      refreshLive();
    } else if (d.rm) { st.ord = st.ord.filter(function (o) { return o.cat + '|' + o.sig !== d.rm; }); refreshLive(); }
    else if (d.dx) { st.dx = TN.ui.condMeta[d.dx]; st.dxv = (st.dx.v || []).length === 1 ? st.dx.v[0].id : null; st.dxq = ''; st.focus = null; render(); }
    else if (d.act === 'cs-dxclear') { st.dx = null; st.dxv = null; st.focus = 'dx'; render(); }
    else if (d.dxv) { st.dxv = d.dxv; $$('[data-dxv]').forEach(function (b) { b.classList.toggle('on', b === t); }); }
    else if (d.hdr) { st.hdr[d.hdr] = d.val; $$('[data-hdr="' + d.hdr + '"]').forEach(function (b) { b.classList.toggle('on', b === t); }); refreshLive(); }
    else if (d.act === 'cs-submit') {
      if (!st.dx) return TN.ui.toast('Name an impression first');
      if (Object.keys(st.hdr).length < 5) return TN.ui.toast('Set all five disposition fields');
      submit();
    }
    else if (d.act === 'cs-next' || d.act === 'cs-skip') { clearInterval(tick); nextCase(st.all); }
    else if (d.act === 'cs-retry') { startCase(st.p, st.all); }
  });
  document.addEventListener('input', function (e) {
    if (!st) return;
    if (e.target.id === 'cs-oq') { st.query = e.target.value; drawOrders(); }
    else if (e.target.id === 'cs-dxq') { st.dxq = e.target.value; drawDx(); }
  });
})(typeof window !== 'undefined' ? window : globalThis);
