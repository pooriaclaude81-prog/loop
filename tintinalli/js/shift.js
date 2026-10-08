/* Shift board: the patients you are carrying right now, what you ordered, what is
   still cooking and what is overdue. Everything lives in this browser only — there is
   no server. No names: a bed label, age and sex. Not a medical record. */
(function (root) {
  'use strict';
  var TN = root.TN = root.TN || {};
  var SH = TN.Shift = {};
  var esc = TN.esc, S = TN.store;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var MIN = 60000;

  /* ---------- defaults ---------- */
  /* Expected turnaround in minutes. Local service times, NOT from the book — edit in settings. */
  var TAT = {
    'blood gas': 15, abg: 15, vbg: 15, glucose: 5, 'point-of-care': 10, istat: 10,
    lactate: 30, 'pregnancy test': 15, bhcg: 60, 'urine dip': 10, urinalysis: 30, urine: 30,
    cbc: 45, 'basic labs': 45, electrolyte: 60, chemistry: 60, bun: 60, creatinine: 60,
    troponin: 60, 'd-dimer': 60, bnp: 60, lipase: 60, amylase: 60, 'liver': 60, lft: 60,
    coagulation: 45, 'pt/inr': 45, inr: 45, ptt: 45, fibrinogen: 60,
    'type and screen': 45, 'type and crossmatch': 60, crossmatch: 60,
    ammonia: 90, ck: 60, 'creatine kinase': 60, osmolality: 90, tsh: 240, cortisol: 240,
    toxicology: 120, 'drug screen': 120, 'alcohol level': 60, salicylate: 90, acetaminophen: 90,
    'blood culture': 2880, culture: 2880, 'csf': 90, 'lumbar puncture': 90, esr: 60, crp: 60,
    ecg: 10, fast: 5, 'bedside ultrasound': 10, 'ultrasound': 45, doppler: 60, echo: 60,
    cxr: 30, 'chest radiograph': 30, radiograph: 30, 'x-ray': 30, 'xray': 30, kub: 30,
    ct: 90, 'ct head': 45, 'ct angiography': 90, cta: 90, mri: 180, 'nuclear': 240
  };
  var DEFTAT = { lab: 60, img: 60, ecg: 10, other: 30 };
  /* Local quality clocks. These are common ED targets, NOT statements from the book. */
  var CLOCKS = [
    { c: /^stemi$/, v: /fibrinolytic/, t: 'Door-to-needle (fibrinolysis)', m: 30 },
    { c: /^stemi$/, t: 'Door-to-balloon (PCI)', m: 90 },
    { c: /^(nstemi-unstable-angina|chest-pain-undifferentiated|low-probability-acs)$/, t: 'ECG done and read', m: 10 },
    { c: /^(sepsis-adult|pediatric-sepsis|febrile-neutropenia)$/, t: 'Antibiotics given', m: 60 },
    { c: /^(meningitis-adult|pediatric-meningitis|meningococcemia-adult|meningococcemia-peds)$/, t: 'Antibiotics given', m: 30 },
    { c: /^ischemic-stroke$/, t: 'CT head done', m: 25 },
    { c: /^ischemic-stroke$/, t: 'Thrombolysis decision', m: 60 },
    { c: /^status-epilepticus$/, t: 'Second anticonvulsant', m: 20 },
    { c: /^anaphylaxis$/, t: 'Adrenaline given', m: 5 },
    { c: /^(hip-fracture|femoral-shaft-fracture|renal-colic-urolithiasis|sickle-cell-crisis)$/, t: 'Analgesia given', m: 30 },
    { c: /^(major-trauma-adult|major-trauma-peds|trauma-pregnancy)$/, t: 'Primary survey and FAST', m: 15 }
  ];
  /* Reassessment prompts fired when an order is marked given. */
  var REASSESS = [
    { re: /morphine|fentanyl|analgesi|paracetamol|acetaminophen|ketorolac|nsaid|pethidine/i, t: 'Reassess pain score', m: 30 },
    { re: /salbutamol|albuterol|nebuli|ipratropium|bronchodilator/i, t: 'Reassess work of breathing after nebs', m: 20 },
    { re: /n\/s|normal saline|ringer|crystalloid|fluid bolus|serum 1\/3/i, t: 'Recheck BP, HR and urine output after fluids', m: 30 },
    { re: /insulin/i, t: 'Recheck glucose and potassium', m: 60 },
    { re: /naloxone/i, t: 'Watch for re-sedation', m: 30 },
    { re: /antipyretic|ibuprofen/i, t: 'Recheck temperature', m: 60 },
    { re: /blood|prbc|transfus/i, t: 'Recheck Hb and observe for transfusion reaction', m: 60 },
    { re: /sedation|midazolam|ketamine|propofol/i, t: 'Post-sedation observation complete?', m: 30 }
  ];

  function cfg() { return Object.assign({ wipeH: 12, losWarn: 240, tat: {}, showArch: false }, S.get('sh.cfg', {})); }
  function setCfg(o) { S.set('sh.cfg', Object.assign(cfg(), o)); }

  /* ---------- storage ---------- */
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function all() { return S.get('sh.pts', []); }
  function save(a) { S.set('sh.pts', a); }
  function one(id) { var a = all(), i; for (i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; return null; }
  function edit(id, fn) { var a = all(), i; for (i = 0; i < a.length; i++) if (a[i].id === id) { fn(a[i], a); save(a); return a[i]; } return null; }
  function logit(p, t) { p.log = p.log || []; p.log.unshift({ ts: Date.now(), t: t }); p.log = p.log.slice(0, 120); }

  function sweep() {
    var c = cfg(), cut = Date.now() - c.wipeH * 60 * MIN, a = all(), n = 0;
    a.forEach(function (p) { if (!p.arch && p.arrived < cut) { p.arch = 1; n++; } });
    if (n) save(a);
    return n;
  }
  function active() { return all().filter(function (p) { return !p.arch; }); }

  /* ---------- time ---------- */
  function hhmm(ts) { var d = new Date(ts); return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }
  function mins(ms) { return Math.round(ms / MIN); }
  function dur(ms) { var m = Math.abs(mins(ms)); return m < 60 ? m + ' min' : Math.floor(m / 60) + ' h ' + (m % 60 ? (m % 60) + ' min' : '').trim(); }
  function rel(ts) { var d = ts - Date.now(); return d >= 0 ? 'in ' + dur(d) : dur(d) + ' ago'; }

  /* ---------- turnaround ---------- */
  function tatFor(label, kind) {
    var c = cfg(), s = String(label).toLowerCase(), best = 0, hit = null, k;
    var tbl = Object.assign({}, TAT, c.tat || {});
    for (k in tbl) if (s.indexOf(k) >= 0 && k.length > best) { best = k.length; hit = tbl[k]; }
    return hit || DEFTAT[kind] || DEFTAT.other;
  }

  /* ---------- building a patient from an order set ---------- */
  function labParts(t) {
    var head = 'CBC, BUN, Cr, Na, K';
    var rest = t.indexOf(head) === 0 ? t.slice(head.length).replace(/^,\s*/, '') : t;
    var out = t.indexOf(head) === 0 ? [{ label: 'Basic labs (CBC, BUN, Cr, Na, K)' }] : [];
    rest.split(/[,;]/).forEach(function (x) {
      x = x.trim(); if (x.length > 2) out.push({ label: x.charAt(0).toUpperCase() + x.slice(1) });
    });
    return out;
  }
  function timersFrom(t) {
    var out = [], m;
    if (/0\s*[–—-]\s*30\s*[–—-]\s*60/.test(t)) return [['Repeat ECG (30 min)', 30], ['Repeat ECG (60 min)', 60]];
    if ((m = t.match(/\b(?:repeat|recheck|reassess|serial)[^.;]{0,60}?\b(?:at|in|after)\s+(\d+)\s*(?:to\s*\d+\s*)?(min|minute|h|hour)/i)))
      out.push(['Repeat: ' + stem(t), +m[1] * (/^h/i.test(m[2]) ? 60 : 1)]);
    else if ((m = t.match(/\bevery\s+(\d+)\s*(min|minute|h|hour)/i)))
      out.push(['Repeat: ' + stem(t), +m[1] * (/^h/i.test(m[2]) ? 60 : 1)]);
    else if (/\b(repeat|recheck|reassess|serial|titrate)\b/i.test(t)) out.push(['Reassess: ' + stem(t), 30]);
    return out;
  }
  function clip(t) { return t.length > 72 ? t.slice(0, 69) + '…' : t; }
  function cut(t, n) { t = String(t); return t.length > n ? t.slice(0, n - 1) + '…' : t; }
  /* the drug or test an order is about, short enough for a board card */
  function stem(t) {
    var parts = String(t).replace(/^(if|when|in)\b[^:]{0,40}:\s*/i, '').split(/[,;:]| — | – /);
    var s = '', i;
    for (i = 0; i < parts.length; i++) {
      s = parts[i].trim();
      if (s && !/^(alternatively|otherwise|or|then|also|and|plus|followed by)$/i.test(s)) break;
    }
    return s.length > 42 ? s.slice(0, 39) + '…' : s;
  }

  SH.attachSet = function (p, cond, v) {
    var o = TN.compose(v), now = Date.now();
    p.condId = cond.id; p.varId = v.id;
    if (!p.imp) p.imp = v.imp;
    if (!p.cc) { var c0 = TN.ui.ccMeta[(cond.cc || [])[0]]; if (c0) p.cc = c0.n; }
    p.acuity = v.cond || p.acuity;
    o.items.forEach(function (it) {
      if (!p.orders.some(function (x) { return x.t === it.t; }))
        p.orders.push({ id: uid(), cat: it.cat, t: it.t, fl: it.fl || [], state: 'planned', src: cond.id });
      if (it.cat === 'L') labParts(it.t).forEach(function (l) {
        if (!p.pend.some(function (x) { return x.label === l.label; }))
          p.pend.push({ id: uid(), label: l.label, kind: 'lab', due: now + tatFor(l.label, 'lab') * MIN, state: 'await' });
      });
      else if (it.cat === 'I') {
        if (!p.pend.some(function (x) { return x.label === it.t; }))
          p.pend.push({ id: uid(), label: clip(it.t), kind: 'img', due: now + tatFor(it.t, 'img') * MIN, state: 'await' });
      } else if (/^ECG\b/i.test(it.t)) {
        if (!p.pend.some(function (x) { return x.kind === 'ecg'; }))
          p.pend.push({ id: uid(), label: 'ECG', kind: 'ecg', due: now + tatFor('ecg', 'ecg') * MIN, state: 'await' });
      }
      timersFrom(it.t).forEach(function (tm) {
        if (!p.tasks.some(function (x) { return x.t === tm[0]; }))
          p.tasks.push({ id: uid(), t: tm[0], due: now + tm[1] * MIN, done: 0, kind: 'repeat' });
      });
    });
    /* can't-miss safety net and red flags from the chief complaints */
    (cond.cc || []).forEach(function (id) {
      var cc = TN.ui.ccMeta[id]; if (!cc) return;
      (cc.cm || []).forEach(function (m) { if (!p.cm.some(function (x) { return x.n === m.n; })) p.cm.push({ n: m.n, id: m.id || '', done: 0 }); });
      (cc.rf || []).forEach(function (r) { if (p.rf.indexOf(r) < 0) p.rf.push(r); });
    });
    /* local quality clocks */
    CLOCKS.forEach(function (k) {
      if (!k.c.test(cond.id)) return;
      if (k.v && !k.v.test(v.id)) return;
      if (!k.v && k.c.source === '^stemi$' && /fibrinolytic/.test(v.id)) return;
      if (!p.clocks.some(function (x) { return x.t === k.t; })) p.clocks.push({ id: uid(), t: k.t, due: p.arrived + k.m * MIN, m: k.m, done: 0 });
    });
    logit(p, 'Attached order set: ' + cond.name + ' — ' + v.name);
    return p;
  };

  /* ---------- status ---------- */
  function statusOf(p) {
    var now = Date.now(), st = { chase: 0, overdue: 0, unseen: 0, next: 0, nextT: '', los: now - p.arrived };
    p.pend.forEach(function (x) {
      if (x.state === 'await') { if (x.due <= now) st.chase++; if (!st.next || x.due < st.next) { st.next = x.due; st.nextT = x.label; } }
      else if (x.state === 'back') st.unseen++;
    });
    p.tasks.forEach(function (x) { if (!x.done) { if (x.due <= now) st.overdue++; if (!st.next || x.due < st.next) { st.next = x.due; st.nextT = x.t; } } });
    p.clocks.forEach(function (x) { if (!x.done && x.due <= now) st.overdue++; });
    st.rank = st.unseen ? 3 : st.overdue ? 4 : st.chase ? 2 : 1;
    return st;
  }
  SH.badge = function () {
    var n = 0, p;
    active().forEach(function (x) { var s = statusOf(x); n += s.unseen + s.overdue + s.chase; });
    return { n: n, pts: active().length };
  };

  /* ---------- small renderers ---------- */
  function acu(a) { return a === 'Emergent' ? '<span class="tri emerg">Emergent</span>' : a === 'Urgent' ? '<span class="tri urg">Urgent</span>' : ''; }
  function pname(p) { return esc(p.bed || 'Unlabelled') + (p.age ? ' · ' + esc(p.age) + esc(p.sex || '') : ''); }
  function banner() {
    return '<div class="banner" role="note"><b>No patient names.</b> This board lives only in this browser, on this device — it is never sent anywhere. Use a bed or room label. It is a personal scratchpad for your shift, not a medical record, and it does not replace hospital documentation.</div>';
  }

  /* ---------- board ---------- */
  SH.board = function () {
    sweep();
    var a = active(), arch = all().filter(function (p) { return p.arch; }), c = cfg(), now = Date.now();
    var rows = a.map(function (p) { return { p: p, s: statusOf(p) }; })
      .sort(function (x, y) { return y.s.rank - x.s.rank || (x.s.next || 9e15) - (y.s.next || 9e15); });
    var tot = rows.reduce(function (o, r) { o.u += r.s.unseen; o.o += r.s.overdue; o.c += r.s.chase; return o; }, { u: 0, o: 0, c: 0 });

    var h = '<div class="cs-head"><h1 style="margin:0">Shift board <small class="mute" dir="auto">تخت‌های من</small></h1><span class="clock" id="shclock">' + hhmm(now) + '</span></div>';
    h += '<div class="stats"><a class="stat" href="#/shift"><b>' + a.length + '</b><span>patients</span></a>' +
      '<div class="stat' + (tot.u ? ' hot' : '') + '"><b>' + tot.u + '</b><span>results unseen</span></div>' +
      '<div class="stat' + (tot.o ? ' bad' : '') + '"><b>' + tot.o + '</b><span>overdue</span></div>' +
      '<div class="stat' + (tot.c ? ' warn' : '') + '"><b>' + tot.c + '</b><span>to chase</span></div></div>';
    h += '<div class="obar"><button class="pri" data-act="sh-new">＋ New patient</button> <a class="btn" href="#/shift/handover">⇄ Handover</a> <a class="btn" href="#/shift/end">⏻ End shift</a> <a class="btn" href="#/shift/settings">⚙ Settings</a></div>';

    /* what came back */
    var inbox = [];
    a.forEach(function (p) { p.pend.forEach(function (x) { if (x.state === 'back') inbox.push({ p: p, x: x }); }); });
    if (inbox.length) h += '<section class="cs-panel inbox"><h2>📥 Results back, not yet seen (' + inbox.length + ')</h2><ul class="mysheet">' +
      inbox.map(function (r) {
        return '<li><span class="ocat c-L">' + esc(r.p.bed) + '</span><span class="mi"><b>' + esc(r.x.label) + '</b>' + (r.x.val ? ' — ' + esc(r.x.val) : '') + (r.x.abn ? ' <span class="fl fl-hi">ABNORMAL</span>' : '') + '</span>' +
          '<button class="pri" data-seen="' + r.p.id + '|' + r.x.id + '">Seen</button> <a class="btn" href="#/shift/p/' + r.p.id + '">Open</a></li>';
      }).join('') + '</ul></section>';

    /* due now */
    var due = [];
    a.forEach(function (p) {
      p.tasks.forEach(function (t) { if (!t.done && t.due <= now) due.push({ p: p, t: t.t, id: t.id, k: 'task' }); });
      p.clocks.forEach(function (t) { if (!t.done && t.due <= now) due.push({ p: p, t: t.t + ' — target ' + t.m + ' min', id: t.id, k: 'clock' }); });
    });
    if (due.length) h += '<section class="cs-panel overdue"><h2>⏰ Due now (' + due.length + ')</h2><ul class="mysheet">' +
      due.map(function (r) {
        return '<li><span class="ocat c-T">' + esc(r.p.bed) + '</span><span class="mi">' + esc(r.t) + '</span><button class="pri" data-tdone="' + r.p.id + '|' + r.id + '|' + r.k + '">Done</button> <a class="btn" href="#/shift/p/' + r.p.id + '">Open</a></li>';
      }).join('') + '</ul></section>';

    h += '<h2>Patients</h2>';
    if (!a.length) h += '<div class="warn" id="pempty">No patients on the board. Tap <b>New patient</b>, or open any condition and use <b>Add to a patient</b>.</div>';
    else h += '<div class="pboard">' + rows.map(function (r) {
      var p = r.p, s = r.s, lw = s.los > c.losWarn * MIN;
      var lead = s.unseen ? ['hot', s.unseen + ' result(s) back — review'] :
        s.overdue ? ['bad', 'Overdue: ' + esc(firstOverdue(p))] :
          s.chase ? ['warn', s.chase + ' result(s) late — chase'] :
            s.next ? ['', esc(cut(s.nextT, 46)) + ' ' + rel(s.next)] : ['', 'Nothing pending'];
      return '<a class="pcard ' + lead[0] + '" href="#/shift/p/' + p.id + '">' +
        '<div class="ph"><b>' + pname(p) + '</b>' + acu(p.acuity) + '<span class="los' + (lw ? ' warn' : '') + '">' + dur(s.los) + '</span></div>' +
        '<div class="pcc mute">' + esc(p.cc || '—') + '</div>' +
        '<div class="pimp">' + (p.imp ? esc(clip(p.imp)) : '<i class="mute">no impression yet</i>') + '</div>' +
        '<div class="plead">' + lead[1] + '</div>' +
        '<div class="pmini">' + miniCounts(p) + '</div></a>';
    }).join('') + '</div>';

    if (arch.length) h += '<details class="dsec"><summary><h2>Archived (' + arch.length + ')</h2></summary><ul class="mysheet">' +
      arch.map(function (p) { return '<li><span class="mi">' + pname(p) + ' · ' + esc(p.imp || p.cc || '') + '</span><button data-unarch="' + p.id + '">Restore</button> <button class="danger" data-del="' + p.id + '">Delete</button></li>'; }).join('') +
      '</ul></details>';
    h += banner();
    return { html: h, title: 'Shift board', after: tickClock };
  };
  function firstOverdue(p) {
    var now = Date.now(), r = '';
    p.tasks.forEach(function (t) { if (!r && !t.done && t.due <= now) r = t.t; });
    p.clocks.forEach(function (t) { if (!r && !t.done && t.due <= now) r = t.t; });
    return cut(r || 'task', 46);
  }
  function miniCounts(p) {
    var o = p.orders.filter(function (x) { return x.state === 'planned'; }).length,
      w = p.pend.filter(function (x) { return x.state === 'await'; }).length,
      t = p.tasks.filter(function (x) { return !x.done; }).length,
      b = (p.dispo && p.dispo.blockers || []).length;
    return [o ? '<span>' + o + ' to give</span>' : '', w ? '<span>' + w + ' awaited</span>' : '', t ? '<span>' + t + ' task(s)</span>' : '', b ? '<span>' + b + ' blocker(s)</span>' : ''].join('');
  }
  var ticker = null;
  function tickClock() {
    clearInterval(ticker);
    ticker = setInterval(function () {
      var e = $('#shclock'); if (!e) return clearInterval(ticker);
      e.textContent = hhmm(Date.now());
      SH.paintBadge();
    }, 30000);
  }

  /* ---------- new patient ---------- */
  SH.newPatient = function () {
    var M = TN.META;
    var h = '<p><a href="#/shift">← Board</a></p><h1>New patient</h1>' + banner();
    h += '<section class="cs-panel"><form id="npf" onsubmit="return false"><div class="dgrid">' +
      '<div><div class="flab">Bed or room <b class="req">*</b></div><input name="bed" autocomplete="off" placeholder="e.g. 7, Resus 2, Fast-track A"></div>' +
      '<div><div class="flab">Age</div><input name="age" inputmode="numeric" placeholder="61"></div>' +
      '<div><div class="flab">Sex</div><div class="seg" id="npsex"><button type="button" data-sex="M">M</button><button type="button" data-sex="F">F</button></div></div>' +
      '<div><div class="flab">Acuity</div><div class="seg" id="npacu"><button type="button" data-acu="Urgent">Urgent</button><button type="button" data-acu="Emergent">Emergent</button></div></div>' +
      '</div><div class="flab" style="margin-top:10px">Chief complaint</div><select name="cc"><option value="">—</option>' +
      M.cc.map(function (c) { return '<option value="' + esc(c.n) + '">' + esc(c.n) + ' · ' + esc(c.fa) + '</option>'; }).join('') + '</select>' +
      '<div class="dgrid" style="margin-top:10px">' +
      '<div><div class="flab">Allergies</div><input name="alg" autocomplete="off" placeholder="penicillin…"></div>' +
      '<div><div class="flab">Weight (kg)</div><input name="wt" inputmode="decimal"></div>' +
      '<div><div class="flab">Creatinine / eGFR</div><input name="cr" autocomplete="off" placeholder="1.4 / eGFR 45"></div>' +
      '</div><div class="obar"><button class="pri" data-act="sh-save">Add to the board</button> <a class="btn" href="#/shift">Cancel</a></div></form></section>';
    return { html: h, title: 'New patient', after: function () { var b = $('[name=bed]'); if (b) b.focus(); } };
  };
  function blank() {
    return { id: uid(), bed: '', age: '', sex: '', cc: '', imp: '', condId: '', varId: '', acuity: 'Urgent', arrived: Date.now(), alg: '', wt: '', cr: '', orders: [], pend: [], tasks: [], cm: [], rf: [], clocks: [], dispo: { plan: '', blockers: [] }, log: [], note: '' };
  }
  var npSex = '', npAcu = 'Urgent';
  function savePatient(next) {
    var f = $('#npf'); if (!f) return;
    var p = blank();
    p.bed = f.bed.value.trim(); p.age = f.age.value.trim(); p.sex = npSex; p.acuity = npAcu;
    p.cc = f.cc.value; p.alg = f.alg.value.trim(); p.wt = f.wt.value.trim(); p.cr = f.cr.value.trim();
    if (!p.bed) return TN.ui.toast('A bed or room label is needed');
    logit(p, 'Added to the board');
    var a = all(); a.push(p); save(a);
    npSex = ''; npAcu = 'Urgent';
    location.hash = next || '#/shift/p/' + p.id;
  }

  /* ---------- attach an order set ---------- */
  SH.attachView = function (cid, vid) {
    var a = active();
    return {
      title: 'Add to a patient',
      html: '<p><a href="#/c/' + cid + (vid ? '/' + vid : '') + '">← Back to the order set</a></p><h1>Add to a patient</h1><div id="atbox"><div class="skel"></div></div>',
      after: function () {
        TN.ui.getCond(cid).then(function (cond) {
          if (!cond) { $('#atbox').innerHTML = '<div class="warn">Condition not found.</div>'; return; }
          var v = cond.variants.filter(function (x) { return x.id === vid; })[0] || cond.variants[0];
          var o = TN.compose(v);
          var h = '<section class="cs-panel"><h2>' + esc(cond.name) + '</h2><p class="hint">' + esc(v.name) + ' · ' + o.items.length + ' orders. Adding it writes the order checklist, a tracker for every lab and image with an expected-back time, any repeat timers in the text, and the can\'t-miss list for this complaint.</p></section>';
          h += '<section class="cs-panel"><h2>Which patient?</h2>';
          h += a.length ? '<ul class="mysheet">' + a.map(function (p) {
            return '<li><span class="mi"><b>' + pname(p) + '</b> <span class="mute">' + esc(p.cc || '') + (p.imp ? ' · ' + esc(clip(p.imp)) : '') + '</span></span><button class="pri" data-attach="' + p.id + '|' + cid + '|' + v.id + '">Add here</button></li>';
          }).join('') + '</ul>' : '<p class="mute">No patients on the board yet.</p>';
          h += '<div class="obar"><button data-act="sh-new">＋ New patient instead</button> <a class="btn" href="#/shift">Board</a></div></section>';
          $('#atbox').innerHTML = h;
        });
      }
    };
  };
  function doAttach(pid, cid, vid) {
    TN.ui.getCond(cid).then(function (cond) {
      var v = cond.variants.filter(function (x) { return x.id === vid; })[0] || cond.variants[0];
      edit(pid, function (p) { SH.attachSet(p, cond, v); });
      TN.ui.toast('Added to ' + (one(pid) || {}).bed);
      location.hash = '#/shift/p/' + pid;
    });
  }

  /* ---------- patient view ---------- */
  var confirmHi = '';
  SH.patient = function (id) {
    var p = one(id); if (!p) return null;
    var s = statusOf(p), c = cfg(), now = Date.now();
    var h = '<p><a href="#/shift">← Board</a></p>';
    h += '<div class="ctitle"><h1>' + pname(p) + ' ' + acu(p.acuity) + '</h1>' +
      '<div class="cbar"><span class="badge st-draft">' + dur(s.los) + ' in the department</span>' +
      (p.alg ? ' <span class="fl fl-ci">ALLERGY</span> <span class="flnote">' + esc(p.alg) + '</span>' : '') +
      (p.wt ? ' <span class="flnote">' + esc(p.wt) + ' kg</span>' : '') +
      (p.cr ? ' <span class="fl fl-renal">RENAL</span> <span class="flnote">' + esc(p.cr) + '</span>' : '') + '</div></div>';

    h += '<div class="jump">' + [['ord', 'Orders'], ['wait', 'Waiting'], ['task', 'Tasks'], ['dsp', 'Dispo']].map(function (j) {
      return '<button data-jump="sh-' + j[0] + '">' + j[1] + '</button>'; }).join('') + '</div>';

    /* snapshot */
    h += '<details class="cs-panel"><summary><h2>Snapshot</h2></summary><div class="dgrid">' +
      '<div><div class="flab">Chief complaint</div><input data-fld="cc" value="' + esc(p.cc) + '"></div>' +
      '<div style="flex:3 1 260px"><div class="flab">Working impression</div><input data-fld="imp" value="' + esc(p.imp) + '" placeholder="what you think this is"></div>' +
      '</div><div class="dgrid" style="margin-top:8px">' +
      '<div><div class="flab">Allergies</div><input data-fld="alg" value="' + esc(p.alg) + '"></div>' +
      '<div><div class="flab">Weight (kg)</div><input data-fld="wt" value="' + esc(p.wt) + '"></div>' +
      '<div><div class="flab">Creatinine / eGFR</div><input data-fld="cr" value="' + esc(p.cr) + '"></div>' +
      '<div><div class="flab">Acuity</div><div class="seg">' + ['Urgent', 'Emergent'].map(function (x) { return '<button type="button" data-pacu="' + x + '" class="' + (p.acuity === x ? 'on' : '') + '">' + x + '</button>'; }).join('') + '</div></div>' +
      '</div>' +
      (p.condId ? '<p class="mute small" style="margin-top:8px">Order set: <a href="#/c/' + p.condId + '/' + p.varId + '">' + esc((TN.ui.condMeta[p.condId] || {}).n || p.condId) + '</a></p>' : '') +
      '</details>';

    /* quality clocks */
    if (p.clocks.length) h += '<details class="cs-panel" open><summary><h2>⏱ Clock targets <small class="mute">local targets, not from the book</small></h2></summary><ul class="mysheet">' +
      p.clocks.map(function (k) {
        var late = !k.done && k.due <= now;
        return '<li class="' + (k.done ? 'fixed' : '') + '"><span class="mi"><b>' + esc(k.t) + '</b> <span class="mute">target ' + k.m + ' min from arrival — ' + (k.done ? 'done at ' + hhmm(k.at) : (late ? '<b class="red">' + rel(k.due) + '</b>' : rel(k.due))) + '</span></span>' +
          (k.done ? '' : '<button class="pri" data-tdone="' + p.id + '|' + k.id + '|clock">Met</button>') + '</li>';
      }).join('') + '</ul></details>';

    /* orders */
    h += '<details class="cs-panel" id="sh-ord" open><summary><h2>Orders <small class="mute">' + p.orders.filter(function (x) { return x.state === 'given'; }).length + ' / ' + p.orders.length + ' given</small></h2></summary>';
    if (!p.orders.length) h += '<p class="mute">Nothing yet. Open a condition and use <b>Add to a patient</b>, or add a single order below.</p>';
    else {
      var last = '';
      h += '<ul class="mysheet">' + p.orders.map(function (o) {
        var g = '';
        if (o.cat !== last) { g = '<li class="ogrp2"><span class="gl gl-' + o.cat + '">' + o.cat + '</span>' + TN.CAT_NAME[o.cat] + '</li>'; last = o.cat; }
        var hi = (o.fl || []).some(function (f) { return f.k === 'hi'; });
        var ci = (o.fl || []).filter(function (f) { return f.k === 'ci'; })[0];
        var clash = false;
        if (p.alg) {
          var words = p.alg.split(/[,;/\s]+/).filter(function (w) { return w.length > 3; });
          if (words.length) { var rx = new RegExp(words.join('|'), 'i'); clash = rx.test(o.t) || (ci && rx.test(ci.v || '')); }
        }
        return g + '<li class="' + (o.state === 'given' ? 'fixed' : '') + '"><span class="mi">' + (o.state === 'given' ? '✓ ' : '') + esc(o.t) +
          (hi ? ' <span class="fl fl-hi">HIGH-ALERT</span>' : '') + (ci ? ' <span class="fl fl-ci">AVOID IF</span> <span class="flnote">' + esc(ci.v) + '</span>' : '') +
          (clash ? '<span class="sub red"><b>Check: this clashes with the recorded allergy “' + esc(p.alg) + '”.</b></span>' : '') +
          (o.state === 'given' ? '<span class="sub">given ' + hhmm(o.at) + '</span>' : '') + '</span>' +
          (o.state === 'given' ? '<button data-ungive="' + p.id + '|' + o.id + '">Undo</button>'
            : '<button class="' + (confirmHi === o.id ? 'danger' : 'pri') + '" data-give="' + p.id + '|' + o.id + '">' + (confirmHi === o.id ? 'Tap again to confirm' : 'Given') + '</button>') +
          '<button class="gho" data-ordrm="' + p.id + '|' + o.id + '" aria-label="Remove">✕</button></li>';
      }).join('') + '</ul>';
    }
    h += '<div class="pick"><input id="sh-ord" placeholder="Add a single order…" autocomplete="off"><div class="seg" id="sh-ordcat">' +
      TN.CATS.map(function (k) { return '<button type="button" data-ocat="' + k + '" class="' + (k === 'T' ? 'on' : '') + '">' + k + '</button>'; }).join('') +
      '</div><button class="pri" data-act="sh-addord">Add</button></div></details>';

    /* pending */
    h += '<details class="cs-panel" id="sh-wait" open><summary><h2>Waiting on <small class="mute">' + p.pend.filter(function (x) { return x.state !== 'seen'; }).length + ' open</small></h2></summary>';
    h += p.pend.length ? '<ul class="mysheet">' + p.pend.map(function (x) {
      var late = x.state === 'await' && x.due <= now;
      var cls = x.state === 'seen' ? 'fixed' : x.state === 'back' ? 'hotrow' : late ? 'warnrow' : '';
      return '<li class="' + cls + '"><span class="ocat c-' + (x.kind === 'img' ? 'I' : x.kind === 'ecg' ? 'N' : 'L') + '">' + (x.kind === 'img' ? 'I' : x.kind === 'ecg' ? 'E' : 'L') + '</span>' +
        '<span class="mi"><b>' + esc(x.label) + '</b>' + (x.val ? ' — ' + esc(x.val) : '') + (x.abn ? ' <span class="fl fl-hi">ABNORMAL</span>' : '') +
        '<span class="sub">' + (x.state === 'await' ? (late ? '<b class="red">late by ' + dur(now - x.due) + ' — chase it</b>' : 'expected ' + hhmm(x.due) + ' (' + rel(x.due) + ')') : x.state === 'back' ? 'back ' + hhmm(x.at) + ' — not yet reviewed' : 'seen ' + hhmm(x.at)) + '</span></span>' +
        (x.state === 'await' ? '<button class="pri" data-back="' + p.id + '|' + x.id + '">Back</button>' : x.state === 'back' ? '<button class="pri" data-seen="' + p.id + '|' + x.id + '">Seen</button>' : '') +
        '<button class="gho" data-pendrm="' + p.id + '|' + x.id + '" aria-label="Remove">✕</button></li>';
    }).join('') + '</ul>' : '<p class="mute">Nothing awaited.</p>';
    h += '<div class="pick"><input id="sh-pend" placeholder="Also waiting on…" autocomplete="off"><input id="sh-pmin" inputmode="numeric" style="max-width:96px" placeholder="min"><button class="pri" data-act="sh-addpend">Add</button></div></details>';

    /* tasks */
    h += '<details class="cs-panel" id="sh-task" open><summary><h2>Tasks and timers <small class="mute">' + p.tasks.filter(function (x) { return !x.done; }).length + ' open</small></h2></summary>';
    h += p.tasks.length ? '<ul class="mysheet">' + p.tasks.slice().sort(function (a2, b2) { return (a2.done - b2.done) || a2.due - b2.due; }).map(function (t) {
      var late = !t.done && t.due <= now;
      return '<li class="' + (t.done ? 'fixed' : late ? 'warnrow' : '') + '"><span class="mi">' + (t.done ? '✓ ' : '') + esc(t.t) +
        '<span class="sub">' + (t.done ? 'done ' + hhmm(t.at) : (late ? '<b class="red">due ' + rel(t.due) + '</b>' : 'due ' + hhmm(t.due) + ' (' + rel(t.due) + ')')) + '</span></span>' +
        (t.done ? '' : '<button class="pri" data-tdone="' + p.id + '|' + t.id + '|task">Done</button>') +
        '<button class="gho" data-taskrm="' + p.id + '|' + t.id + '" aria-label="Remove">✕</button></li>';
    }).join('') + '</ul>' : '<p class="mute">No tasks.</p>';
    h += '<div class="pick"><input id="sh-task" placeholder="Remind me to…" autocomplete="off"><input id="sh-tmin" inputmode="numeric" style="max-width:96px" placeholder="min" value="30"><button class="pri" data-act="sh-addtask">Add</button></div>' +
      '<div class="chips" style="margin-top:8px">' + [['Reassess', 30], ['Recheck obs', 60], ['Chase result', 20], ['Call consult', 10], ['Repeat ECG', 30], ['Recheck pain', 30]].map(function (q) {
        return '<button class="chip sm" data-quick="' + p.id + '|' + esc(q[0]) + '|' + q[1] + '">+ ' + q[0] + ' ' + q[1] + 'm</button>';
      }).join('') + '</div></details>';

    /* can't miss */
    if (p.cm.length) h += '<details class="cs-panel"><summary><h2>⚠ Can\'t miss — ' + p.cm.filter(function (x) { return x.done; }).length + ' / ' + p.cm.length + ' excluded</h2></summary><p class="hint">From the chief complaint. Tick what you have actively ruled out.</p><ul class="mysheet">' +
      p.cm.map(function (m, i) {
        return '<li class="' + (m.done ? 'fixed' : '') + '"><label class="mi" style="display:flex;gap:9px;align-items:flex-start;cursor:pointer"><input type="checkbox" data-cm="' + p.id + '|' + i + '"' + (m.done ? ' checked' : '') + '><span>' + (m.id ? '<a href="#/c/' + m.id + '">' + esc(m.n) + '</a>' : esc(m.n)) + '</span></label></li>';
      }).join('') + '</ul>' + (p.rf.length ? '<details class="dsec"><summary><h3 style="margin:0;display:inline">Red flags to watch (' + p.rf.length + ')</h3></summary><ul>' + p.rf.map(function (r) { return '<li dir="auto">' + esc(r) + '</li>'; }).join('') + '</ul></details>' : '') + '</details>';

    /* disposition */
    var dp = p.dispo || { plan: '', blockers: [] };
    h += '<details class="cs-panel" id="sh-dsp"' + (dp.plan || dp.blockers.length ? ' open' : '') + '><summary><h2>Disposition' + (dp.plan ? ' <small class="mute">' + esc(dp.plan) + '</small>' : '') + '</h2></summary><div class="seg">' +
      ['Admit', 'Discharge', 'Observe', 'Transfer', 'Theatre'].map(function (x) { return '<button type="button" data-dispo="' + p.id + '|' + x + '" class="' + (dp.plan === x ? 'on' : '') + '">' + x + '</button>'; }).join('') + '</div>';
    h += '<div class="flab" style="margin-top:10px">Blocking discharge or admission</div>' +
      (dp.blockers.length ? '<div class="chosen">' + dp.blockers.map(function (b, i) { return '<span class="tagx">' + esc(b) + '<button data-blkrm="' + p.id + '|' + i + '" aria-label="Remove">✕</button></span>'; }).join('') + '</div>' : '<p class="mute small">Nothing listed.</p>');
    h += '<div class="pick"><input id="sh-blk" placeholder="waiting on…" autocomplete="off"><button class="pri" data-act="sh-addblk">Add</button></div>' +
      '<div class="chips" style="margin-top:8px">' + ['bed', 'CT', 'labs', 'consult reply', 'senior review', 'transport', 'family'].map(function (b) { return '<button class="chip sm" data-qblk="' + p.id + '|' + b + '">+ ' + b + '</button>'; }).join('') + '</div></details>';

    /* notes + timeline */
    h += '<details class="cs-panel"' + (p.note ? ' open' : '') + '><summary><h2>Notes</h2></summary><textarea data-fld="note" rows="3" placeholder="Short working notes — no identifying details">' + esc(p.note) + '</textarea></details>';
    h += '<details class="dsec"><summary><h2>Timeline (' + (p.log || []).length + ')</h2></summary><ul class="mysheet">' +
      (p.log || []).map(function (l) { return '<li class="fixed"><b>' + hhmm(l.ts) + '</b><span class="mi">' + esc(l.t) + '</span></li>'; }).join('') + '</ul></details>';

    h += '<div class="obar"><a class="btn pri" href="#/shift">← Back to the board</a> <button data-act="sh-copy1">⧉ Copy handover line</button> <button class="danger" data-del="' + p.id + '">Remove this patient</button></div>';
    return { html: h, title: p.bed + ' · shift' };
  };

  /* ---------- handover ---------- */
  function sbar(p) {
    var giv = p.orders.filter(function (o) { return o.state === 'given'; }).map(function (o) { return clip(o.t); });
    var wait = p.pend.filter(function (x) { return x.state === 'await'; }).map(function (x) { return x.label + ' ~' + hhmm(x.due); });
    var back = p.pend.filter(function (x) { return x.state === 'back'; }).map(function (x) { return x.label + (x.val ? ' = ' + x.val : '') + (x.abn ? ' (abnormal)' : ''); });
    var todo = p.tasks.filter(function (t) { return !t.done; }).map(function (t) { return t.t + ' ' + hhmm(t.due); });
    var blk = (p.dispo && p.dispo.blockers) || [];
    var L = [];
    L.push(pname(p) + ' · ' + (p.cc || '—') + ' · here ' + dur(Date.now() - p.arrived) + (p.acuity ? ' · ' + p.acuity : ''));
    L.push('Imp: ' + (p.imp || 'not settled'));
    if (p.alg) L.push('Allergy: ' + p.alg);
    if (giv.length) L.push('Given: ' + giv.join('; '));
    if (back.length) L.push('Back: ' + back.join('; '));
    if (wait.length) L.push('Awaited: ' + wait.join('; '));
    if (todo.length) L.push('To do: ' + todo.join('; '));
    L.push('Plan: ' + ((p.dispo && p.dispo.plan) || 'undecided') + (blk.length ? ' — waiting on ' + blk.join(', ') : ''));
    if (p.note) L.push('Note: ' + p.note);
    return L;
  }
  SH.handoverText = function () {
    var a = active();
    return 'Shift handover · ' + hhmm(Date.now()) + ' · ' + a.length + ' patient(s)\n(No identifiers. Verify everything against the chart.)\n\n' +
      a.map(function (p) { return sbar(p).join('\n'); }).join('\n\n') + '\n';
  };
  SH.handover = function () {
    var a = active();
    var h = '<p><a href="#/shift">← Board</a></p><h1>Handover <small class="mute" dir="auto">تحویل شیفت</small></h1>';
    h += '<div class="obar"><button class="pri" data-act="sh-copyall">⧉ Copy all</button> <a class="btn" href="#/shift/print">🖶 Print sheet</a></div>';
    h += a.length ? a.map(function (p) {
      var L = sbar(p);
      return '<section class="cs-panel"><h2>' + esc(L[0]) + '</h2><ul class="hoff">' + L.slice(1).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
        '<div class="obar"><button data-copy1="' + p.id + '">⧉ Copy</button> <a class="btn" href="#/shift/p/' + p.id + '">Open</a></div></section>';
    }).join('') : '<div class="warn">No patients on the board.</div>';
    h += banner();
    return { html: h, title: 'Handover' };
  };
  SH.print = function () {
    var a = active();
    var h = '<p class="noprint"><a href="#/shift/handover">← Back</a> <button class="pri" onclick="window.print()">🖶 Print</button></p><div class="psheet">';
    h += '<h2 style="margin:0 0 6px">Shift handover — ' + hhmm(Date.now()) + '</h2><p class="pfoot">No patient identifiers. Personal working sheet, not a medical record. Verify against the chart.</p>';
    h += '<table class="ptab"><thead><tr><th>Bed</th><th>Impression / complaint</th><th>Given</th><th>Awaited</th><th>Plan / blockers</th></tr></thead><tbody>' +
      a.map(function (p) {
        return '<tr><td>' + esc(p.bed) + (p.age ? '<br>' + esc(p.age) + esc(p.sex) : '') + '</td>' +
          '<td>' + esc(p.imp || '—') + '<br><i>' + esc(p.cc || '') + '</i></td>' +
          '<td>' + p.orders.filter(function (o) { return o.state === 'given'; }).map(function (o) { return esc(clip(o.t)); }).join('<br>') + '</td>' +
          '<td>' + p.pend.filter(function (x) { return x.state !== 'seen'; }).map(function (x) { return esc(x.label) + (x.state === 'back' ? ' <b>(back)</b>' : ''); }).join('<br>') + '</td>' +
          '<td>' + esc((p.dispo && p.dispo.plan) || '—') + ((p.dispo && p.dispo.blockers || []).length ? '<br><i>waiting: ' + esc(p.dispo.blockers.join(', ')) + '</i>' : '') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
    return { html: h, title: 'Handover sheet' };
  };

  /* ---------- end of shift ---------- */
  SH.end = function () {
    var a = all(), act = active();
    var los = act.map(function (p) { return Date.now() - p.arrived; }).sort(function (x, y) { return x - y; });
    var med = los.length ? dur(los[Math.floor(los.length / 2)]) : '—';
    var dis = {}; a.forEach(function (p) { var d = (p.dispo && p.dispo.plan) || 'undecided'; dis[d] = (dis[d] || 0) + 1; });
    var h = '<p><a href="#/shift">← Board</a></p><h1>End of shift</h1>';
    h += '<div class="stats"><div class="stat"><b>' + a.length + '</b><span>patients on the board</span></div>' +
      '<div class="stat"><b>' + med + '</b><span>median time here</span></div>' +
      '<div class="stat"><b>' + act.reduce(function (n, p) { return n + p.orders.filter(function (o) { return o.state === 'given'; }).length; }, 0) + '</b><span>orders given</span></div></div>';
    h += '<section class="cs-panel"><h2>Dispositions</h2><ul class="mysheet">' + Object.keys(dis).map(function (k) { return '<li><span class="mi">' + esc(k) + '</span><b>' + dis[k] + '</b></li>'; }).join('') + '</ul></section>';
    h += '<section class="cs-panel"><h2>Before you wipe</h2><div class="obar"><button data-act="sh-copyall">⧉ Copy the handover</button> <a class="btn" href="#/shift/print">🖶 Print it</a> <button data-act="sh-export">⤓ Export a backup file</button></div>' +
      '<p class="mute small">The export is a plain JSON file saved to this device. It is the only way to move a board between your own phone and laptop; there is no sync.</p></section>';
    h += '<section class="cs-panel"><h2 class="red">Erase the board</h2><p>This deletes every patient, order, result and task from this device. It cannot be undone.</p>' +
      '<div class="obar"><button class="danger" data-act="sh-wipe">Erase everything</button></div></section>';
    return { html: h, title: 'End of shift' };
  };

  /* ---------- settings ---------- */
  SH.settings = function () {
    var c = cfg();
    var rows = [['lab', 'Labs, default'], ['img', 'Imaging, default'], ['ecg', 'ECG'], ['cbc', 'CBC'], ['troponin', 'Troponin'], ['lactate', 'Lactate'], ['blood gas', 'Blood gas'], ['cxr', 'CXR'], ['ct', 'CT'], ['ultrasound', 'Ultrasound'], ['blood culture', 'Blood culture']];
    var h = '<p><a href="#/shift">← Board</a></p><h1>Shift settings</h1>';
    h += '<section class="cs-panel"><h2>Expected turnaround</h2><p class="hint">Minutes until a result should be back. These are service times for your department, not statements from the book. Set them once and the board will chase the right things.</p><div class="dgrid">' +
      rows.map(function (r) {
        var v = (c.tat && c.tat[r[0]] != null) ? c.tat[r[0]] : (DEFTAT[r[0]] != null ? DEFTAT[r[0]] : TAT[r[0]]);
        return '<div><div class="flab">' + r[1] + '</div><input data-tat="' + r[0] + '" inputmode="numeric" value="' + v + '"></div>';
      }).join('') + '</div></section>';
    h += '<section class="cs-panel"><h2>Board</h2><div class="dgrid">' +
      '<div><div class="flab">Warn when a patient has been here (min)</div><input data-cfg="losWarn" inputmode="numeric" value="' + c.losWarn + '"></div>' +
      '<div><div class="flab">Auto-archive patients after (hours)</div><input data-cfg="wipeH" inputmode="numeric" value="' + c.wipeH + '"></div>' +
      '</div><div class="obar"><button class="pri" data-act="sh-savecfg">Save</button></div></section>';
    h += '<section class="cs-panel"><h2>Backup</h2><div class="obar"><button data-act="sh-export">⤓ Export the board</button> <label class="btn">⤒ Import <input type="file" id="shimp" accept="application/json" hidden></label></div>' +
      '<p class="mute small">Everything is stored in this browser only. Clearing site data, or using a different browser or device, starts an empty board.</p></section>';
    h += '<section class="cs-panel"><h2>What the alarms can and cannot do</h2><p class="mute small">This is a static site with no server, so it cannot wake your phone. Overdue items are sorted to the top of the board and counted on the header button whenever the app is open. Treat it as a checklist you glance at, not a pager.</p></section>';
    return { html: h, title: 'Shift settings' };
  };

  /* ---------- header badge ---------- */
  SH.paintBadge = function () {
    var b = $('#shbtn'), n = $('#shn'); if (!b) return;
    var s = SH.badge();
    b.hidden = !s.pts;
    if (!s.pts) return;
    n.textContent = s.n || s.pts;
    b.classList.toggle('hot', s.n > 0);
    b.setAttribute('aria-label', s.pts + ' patients on the shift board, ' + s.n + ' items needing attention');
  };

  /* ---------- events ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-jump],[data-act],[data-sex],[data-acu],[data-pacu],[data-attach],[data-give],[data-ungive],[data-ordrm],[data-back],[data-seen],[data-pendrm],[data-tdone],[data-taskrm],[data-quick],[data-dispo],[data-blkrm],[data-qblk],[data-del],[data-unarch],[data-copy1],[data-ocat]');
    if (!t) return;
    var d = t.dataset, a2, p, i;
    function sp(v) { return String(v).split('|'); }
    function re() { if (/^#\/shift/.test(location.hash)) TN.ui.rerender(); SH.paintBadge(); }

    if (d.jump) { var el = document.getElementById(d.jump); if (el) { el.open = true; el.scrollIntoView({ block: 'start', behavior: 'smooth' }); } return; }
    if (d.act === 'sh-new') { location.hash = '#/shift/new'; return; }
    if (d.sex) { npSex = d.sex; $$('#npsex button').forEach(function (b) { b.classList.toggle('on', b === t); }); return; }
    if (d.acu) { npAcu = d.acu; $$('#npacu button').forEach(function (b) { b.classList.toggle('on', b === t); }); return; }
    if (d.act === 'sh-save') return savePatient();
    if (d.ocat) { $$('#sh-ordcat button').forEach(function (b) { b.classList.toggle('on', b === t); }); return; }
    if (d.attach) { a2 = sp(d.attach); return doAttach(a2[0], a2[1], a2[2]); }

    if (d.pacu) { a2 = sp(d.pacu); edit(a2[0], function (x) { x.acuity = a2[1]; }); return re(); }
    if (d.give) {
      a2 = sp(d.give); p = one(a2[0]); var o = p.orders.filter(function (x) { return x.id === a2[1]; })[0];
      if ((o.fl || []).some(function (f) { return f.k === 'hi'; }) && confirmHi !== o.id) { confirmHi = o.id; return re(); }
      confirmHi = '';
      edit(a2[0], function (x) {
        var oo = x.orders.filter(function (y) { return y.id === a2[1]; })[0];
        oo.state = 'given'; oo.at = Date.now(); logit(x, 'Given: ' + oo.t);
        REASSESS.forEach(function (r) {
          if (r.re.test(oo.t) && !x.tasks.some(function (y) { return y.t === r.t; }))
            x.tasks.push({ id: uid(), t: r.t, due: Date.now() + r.m * MIN, done: 0, kind: 'reassess' });
        });
        x.clocks.forEach(function (k) {
          if (!k.done && /antibiotic|adrenaline|analgesia|anticonvulsant/i.test(k.t) &&
            new RegExp(k.t.split(' ')[0], 'i').test(oo.t)) { k.done = 1; k.at = Date.now(); }
        });
      });
      return re();
    }
    if (d.ungive) { a2 = sp(d.ungive); edit(a2[0], function (x) { var o2 = x.orders.filter(function (y) { return y.id === a2[1]; })[0]; o2.state = 'planned'; delete o2.at; }); return re(); }
    if (d.ordrm) { a2 = sp(d.ordrm); edit(a2[0], function (x) { x.orders = x.orders.filter(function (y) { return y.id !== a2[1]; }); }); return re(); }
    if (d.back) {
      a2 = sp(d.back);
      var val = prompt('Result for this test (optional — no identifiers):', '') || '';
      edit(a2[0], function (x) {
        var y = x.pend.filter(function (z) { return z.id === a2[1]; })[0];
        y.state = 'back'; y.at = Date.now(); y.val = val.trim();
        y.abn = /\*|abn|high|low|positive|crit/i.test(val) ? 1 : 0;
        logit(x, 'Back: ' + y.label + (y.val ? ' = ' + y.val : ''));
        x.clocks.forEach(function (k) { if (!k.done && /CT head/i.test(k.t) && /ct/i.test(y.label)) { k.done = 1; k.at = Date.now(); } });
      });
      return re();
    }
    if (d.seen) { a2 = sp(d.seen); edit(a2[0], function (x) { var y = x.pend.filter(function (z) { return z.id === a2[1]; })[0]; y.state = 'seen'; y.at = Date.now(); }); return re(); }
    if (d.pendrm) { a2 = sp(d.pendrm); edit(a2[0], function (x) { x.pend = x.pend.filter(function (y) { return y.id !== a2[1]; }); }); return re(); }
    if (d.tdone) {
      a2 = sp(d.tdone);
      edit(a2[0], function (x) {
        var arr = a2[2] === 'clock' ? x.clocks : x.tasks, y = arr.filter(function (z) { return z.id === a2[1]; })[0];
        if (y) { y.done = 1; y.at = Date.now(); logit(x, 'Done: ' + y.t); }
      });
      return re();
    }
    if (d.taskrm) { a2 = sp(d.taskrm); edit(a2[0], function (x) { x.tasks = x.tasks.filter(function (y) { return y.id !== a2[1]; }); }); return re(); }
    if (d.quick) { a2 = sp(d.quick); edit(a2[0], function (x) { x.tasks.push({ id: uid(), t: a2[1], due: Date.now() + (+a2[2]) * MIN, done: 0, kind: 'quick' }); }); return re(); }
    if (d.dispo) { a2 = sp(d.dispo); edit(a2[0], function (x) { x.dispo = x.dispo || { blockers: [] }; x.dispo.plan = x.dispo.plan === a2[1] ? '' : a2[1]; x.dispo.at = Date.now(); logit(x, 'Plan: ' + x.dispo.plan); }); return re(); }
    if (d.qblk) { a2 = sp(d.qblk); edit(a2[0], function (x) { x.dispo = x.dispo || { blockers: [] }; if (x.dispo.blockers.indexOf(a2[1]) < 0) x.dispo.blockers.push(a2[1]); }); return re(); }
    if (d.blkrm) { a2 = sp(d.blkrm); edit(a2[0], function (x) { x.dispo.blockers.splice(+a2[1], 1); }); return re(); }
    if (d.del) {
      if (!confirm('Remove this patient from the board? This cannot be undone.')) return;
      save(all().filter(function (x) { return x.id !== d.del; }));
      location.hash = '#/shift'; return;
    }
    if (d.unarch) { edit(d.unarch, function (x) { delete x.arch; x.arrived = Date.now(); }); return re(); }
    if (d.copy1) { p = one(d.copy1); return TN.copy(sbar(p).join('\n')).then(function () { TN.ui.toast('Copied'); }); }

    if (d.act === 'sh-copy1') { p = one(location.hash.split('/')[3]); if (p) TN.copy(sbar(p).join('\n')).then(function () { TN.ui.toast('Handover line copied'); }); return; }
    if (d.act === 'sh-copyall') return TN.copy(SH.handoverText()).then(function () { TN.ui.toast('Handover copied'); }, function () { TN.ui.toast('Copy failed'); });
    if (d.act === 'sh-addord') {
      var inp = $('#sh-ord'), cat = ($('#sh-ordcat .on') || {}).dataset;
      if (!inp.value.trim()) return;
      edit(location.hash.split('/')[3], function (x) { x.orders.push({ id: uid(), cat: (cat && cat.ocat) || 'T', t: inp.value.trim(), fl: [], state: 'planned' }); });
      return re();
    }
    if (d.act === 'sh-addpend') {
      var pi = $('#sh-pend'), pm = $('#sh-pmin');
      if (!pi.value.trim()) return;
      var lbl = pi.value.trim(), m = parseInt(pm.value, 10);
      edit(location.hash.split('/')[3], function (x) { x.pend.push({ id: uid(), label: lbl, kind: /ct|x-ray|xray|cxr|ultrasound|mri|radiograph/i.test(lbl) ? 'img' : 'lab', due: Date.now() + (m > 0 ? m : tatFor(lbl, 'lab')) * MIN, state: 'await' }); });
      return re();
    }
    if (d.act === 'sh-addtask') {
      var ti = $('#sh-task'), tm = parseInt($('#sh-tmin').value, 10);
      if (!ti.value.trim()) return;
      var tt = ti.value.trim();
      edit(location.hash.split('/')[3], function (x) { x.tasks.push({ id: uid(), t: tt, due: Date.now() + (tm > 0 ? tm : 30) * MIN, done: 0, kind: 'manual' }); });
      return re();
    }
    if (d.act === 'sh-addblk') {
      var bi = $('#sh-blk'); if (!bi.value.trim()) return;
      var bv = bi.value.trim();
      edit(location.hash.split('/')[3], function (x) { x.dispo = x.dispo || { blockers: [] }; x.dispo.blockers.push(bv); });
      return re();
    }
    if (d.act === 'sh-savecfg') {
      var tat = {};
      $$('[data-tat]').forEach(function (el) { var v = parseInt(el.value, 10); if (v > 0) tat[el.dataset.tat] = v; });
      var o2 = { tat: tat };
      $$('[data-cfg]').forEach(function (el) { var v = parseInt(el.value, 10); if (v > 0) o2[el.dataset.cfg] = v; });
      setCfg(o2); TN.ui.toast('Saved'); return;
    }
    if (d.act === 'sh-export') {
      TN.download('shift-board-' + new Date().toISOString().slice(0, 10) + '.json',
        JSON.stringify({ v: 1, pts: all(), cfg: cfg() }, null, 1), 'application/json');
      return;
    }
    if (d.act === 'sh-wipe') {
      if (!confirm('Erase the whole board? Every patient, order and result on this device will be deleted.')) return;
      if (!confirm('Really erase? There is no undo and no backup unless you exported one.')) return;
      S.del('sh.pts'); TN.ui.toast('Board erased'); location.hash = '#/shift'; SH.paintBadge(); return;
    }
  });

  document.addEventListener('change', function (e) {
    if (e.target.id === 'shimp') {
      var fr = new FileReader();
      fr.onload = function () {
        try {
          var o = JSON.parse(fr.result);
          if (!o.pts) throw 0;
          if (!confirm('Replace the current board with ' + o.pts.length + ' patient(s) from this file?')) return;
          save(o.pts); if (o.cfg) S.set('sh.cfg', o.cfg);
          TN.ui.toast('Board imported'); location.hash = '#/shift';
        } catch (x) { TN.ui.toast('Not a valid board file'); }
      };
      fr.readAsText(e.target.files[0]); return;
    }
    if (e.target.dataset && e.target.dataset.cm) {
      var a3 = String(e.target.dataset.cm).split('|');
      var p2 = edit(a3[0], function (x) { x.cm[+a3[1]].done = e.target.checked ? 1 : 0; });
      var det = e.target.closest('details.cs-panel'), hh = det && det.querySelector('summary h2');
      if (hh && p2) hh.textContent = '⚠ Can\'t miss — ' + p2.cm.filter(function (x) { return x.done; }).length + ' / ' + p2.cm.length + ' excluded';
      var li = e.target.closest('li'); if (li) li.classList.toggle('fixed', e.target.checked);
      SH.paintBadge();
    }
  });
  document.addEventListener('input', function (e) {
    var f = e.target.dataset && e.target.dataset.fld; if (!f) return;
    var id = location.hash.split('/')[3]; if (!id) return;
    edit(id, function (x) { x[f] = e.target.value; });
  });
})(typeof window !== 'undefined' ? window : globalThis);
