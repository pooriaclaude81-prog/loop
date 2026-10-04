/* Shared logic: order composer (fixed block + N-I-L-S-A-T-Co), safety flags, plain-text and CSV export, local storage. */
(function (root) {
  'use strict';
  var TN = root.TN = root.TN || {};

  TN.SEC = {};
  TN.defSec = function (id, data) { TN.SEC[id] = data; if (TN._wait && TN._wait[id]) { TN._wait[id].forEach(function (f) { f(data); }); delete TN._wait[id]; } };
  TN.loadSec = function (id) {
    return new Promise(function (res, rej) {
      if (TN.SEC[id]) return res(TN.SEC[id]);
      TN._wait = TN._wait || {};
      (TN._wait[id] = TN._wait[id] || []).push(res);
      if (TN._wait[id].length > 1) return;
      var s = document.createElement('script');
      s.src = 'dist/sec-' + id + '.js?v=' + (TN.META ? TN.META.version : '');
      s.onerror = function () { delete TN._wait[id]; rej(new Error('Could not load section ' + id)); };
      document.head.appendChild(s);
    });
  };

  var CAT_NAME = { N: 'Nursing', I: 'Imaging', L: 'Lab tests', S: 'Serum', A: 'Antibiotics', T: 'Treatment', Co: 'Consult' };
  TN.CAT_NAME = CAT_NAME;
  TN.CATS = ['N', 'I', 'L', 'S', 'A', 'T', 'Co'];

  var FIXED_WHY = {
    iv: 'Secure access for fluids and drugs.',
    mon: 'Continuous rhythm and SpO2 surveillance to catch early deterioration.',
    o2: 'Treat hypoxemia only (avoid hyperoxia); lower threshold in COPD / asthma.',
    ecg: 'Looks for ischemia, arrhythmia, electrolyte effects. MI suspected: serial ECGs at 0, 30 and 60 min.',
    cxr: 'Looks for pneumonia, edema, pneumothorax, mediastinal and cardiac silhouette changes.',
    lab: 'Baseline for every patient: counts, kidney function and electrolytes.'
  };

  function fluidText(diet) {
    return 'Serum N/S 500 cc – 1 L IV stat (tachycardia / volume depletion), then maintenance' +
      (diet === 'NPO' ? ': Serum 1/3 – 2/3, 1 L TDS' : '');
  }

  TN.fluidText = fluidText;

  /* Compose the full order set of one variant. Returns {header:[[k,v]], items:[{n,cat,t,why,fl,fixed}], text} */
  TN.compose = function (variant) {
    var v = variant, items = [], o = v.o || {};
    function add(cat, t, why, fl, fixed, key) { items.push({ cat: cat, t: t, why: why || '', fl: fl || [], fixed: !!fixed, key: key || '' }); }
    function full(it) { return (it.if ? 'If ' + it.if + ': ' : '') + (it.t === '@fluid' ? fluidText(v.diet) : it.t); }
    function extra(cat) { (o[cat] || []).forEach(function (it) { add(cat, full(it), it.why, it.fl); }); }

    add('N', 'IV line fix', FIXED_WHY.iv, [], true, 'iv');
    add('N', 'Cardiac monitoring and pulse oximetry', FIXED_WHY.mon, [], true, 'mon');
    add('N', v.o2 && v.o2 !== 'std' ? v.o2 : 'O2 therapy: F.M 6–10 L/min or N.C 3–5 L/min if SpO2 < 94% (COPD / asthma: if SpO2 < 92%)', FIXED_WHY.o2, [], true, 'o2');
    if (v.ecg === 'stat') add('N', 'ECG STAT, 0 – 30 – 60 min', FIXED_WHY.ecg, [], true, 'ecg');
    else if (v.ecg === 'once') add('N', 'ECG', FIXED_WHY.ecg, [], true, 'ecg');
    extra('N');
    if (v.cxr === 'PA') add('I', 'CXR (PA)', FIXED_WHY.cxr, [], true, 'cxr');
    else if (v.cxr === 'portable') add('I', 'CXR (portable)', FIXED_WHY.cxr, [], true, 'cxr');
    extra('I');
    var labs = ['CBC', 'BUN', 'Cr', 'Na', 'K'], lfl = [], lwhy = [];
    (o.L || []).forEach(function (it) { labs.push(full(it).replace(/^If (.*?): (.*)$/, '$2 (if $1)')); if (it.fl) lfl = lfl.concat(it.fl); if (it.why) lwhy.push(it.why); });
    add('L', labs.join(', '), FIXED_WHY.lab + (lwhy.length ? ' ' + lwhy.join(' ') : ''), lfl, true, 'lab');
    extra('S'); extra('A'); extra('T'); extra('Co');

    items.forEach(function (it, i) { it.n = i + 1; it.fl = it.fl.concat(TN.autoFlags(it.t)); });
    var header = [['Imp', v.imp], ['Cond', v.cond], ['Act', v.act], ['Diet', v.diet]];
    return { header: header, items: items, text: TN.toText(header, items) };
  };

  TN.autoFlags = function (text) {
    var out = [], d = (TN.META && TN.META.drugs) || [];
    d.forEach(function (r) {
      if (!r._re) r._re = new RegExp(r.re, 'i');
      if (r._re.test(text) && !out.some(function (x) { return x.k === r.k; })) out.push({ k: r.k, v: r.note, auto: 1 });
    });
    return out;
  };

  /* plain copy-ready text; picked = optional Set of item numbers (renumbered) */
  TN.toText = function (header, items, picked) {
    var lines = header.map(function (h) { return h[0] + ': ' + h[1]; });
    lines.push('Please:');
    var n = 0;
    items.forEach(function (it) { if (picked && !picked[it.n]) return; n++; lines.push(n + '. ' + it.t); });
    return lines.join('\n');
  };

  /* ---------- clipboard ---------- */
  TN.copy = function (text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (res, rej) {
      var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy') ? res() : rej(); } catch (e) { rej(e); } document.body.removeChild(ta);
    });
  };

  /* ---------- local storage (never throws) ---------- */
  var mem = {};
  TN.store = {
    get: function (k, d) { try { var s = localStorage.getItem('tn.' + k); return s == null ? (k in mem ? mem[k] : d) : JSON.parse(s); } catch (e) { return k in mem ? mem[k] : d; } },
    set: function (k, v) { mem[k] = v; try { localStorage.setItem('tn.' + k, JSON.stringify(v)); } catch (e) {} },
    keys: function () { try { return Object.keys(localStorage).filter(function (k) { return k.indexOf('tn.') === 0; }).map(function (k) { return k.slice(3); }); } catch (e) { return Object.keys(mem); } },
    del: function (k) { delete mem[k]; try { localStorage.removeItem('tn.' + k); } catch (e) {} }
  };

  /* ---------- Anki CSV (Front, Back, Tags); Anki: import with "Allow HTML in fields" ---------- */
  function h(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  TN.esc = h;
  TN.ankiRows = function (pairs) { // pairs: [{cond, variant, section}]
    return pairs.map(function (p) {
      var c = TN.compose(p.variant), v = p.variant;
      var front = '<b>' + h(v.imp) + '</b> (' + h(p.cond.name) + ')' + (v.sc ? '<br><br><div dir="rtl" style="text-align:right">' + h(v.sc) + '</div>' : '') +
        '<br><br>Write the full order set: Imp / Cond / Act / Diet, then Please 1–n in N-I-L-S-A-T-Co order.';
      var back = c.text.split('\n').map(h).join('<br>');
      if (v.why) back += '<br><br><div dir="rtl" style="text-align:right">' + h(v.why) + '</div>';
      return [front, back, 'tintinalli::' + p.cond.section + '::' + p.cond.id];
    });
  };
  TN.toCsv = function (rows) {
    var q = function (s) { return '"' + String(s).replace(/"/g, '""') + '"'; };
    return '﻿' + rows.map(function (r) { return r.map(q).join(','); }).join('\r\n') + '\r\n';
  };
  TN.download = function (name, text, type) {
    var a = document.createElement('a'), b = new Blob([text], { type: type || 'text/plain;charset=utf-8' });
    a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };

  /* Farsi-friendly mini markdown: "# heading", "- bullet", blank line = paragraph, **bold** */
  TN.md = function (src) {
    var out = [], inList = false, para = [];
    function inline(s) { return h(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>'); }
    function fp() { if (para.length) { out.push('<p dir="auto">' + inline(para.join(' ')) + '</p>'); para = []; } }
    function cl() { if (inList) { out.push('</ul>'); inList = false; } }
    String(src || '').split('\n').forEach(function (l) {
      var m;
      if ((m = l.match(/^#\s+(.*)$/))) { fp(); cl(); out.push('<h4 dir="auto">' + inline(m[1]) + '</h4>'); }
      else if ((m = l.match(/^\s*-\s+(.*)$/))) { fp(); if (!inList) { out.push('<ul>'); inList = true; } out.push('<li dir="auto">' + inline(m[1]) + '</li>'); }
      else if (!l.trim()) { fp(); cl(); } else { cl(); para.push(l.trim()); }
    });
    fp(); cl(); return out.join('');
  };
  TN.list = function (arr) { return arr && arr.length ? '<ul>' + arr.map(function (x) { return '<li dir="auto">' + h(x) + '</li>'; }).join('') + '</ul>' : ''; };
})(typeof window !== 'undefined' ? window : globalThis);
