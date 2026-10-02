/* Parser for the plain-text topic format. Works in the browser (window.Parser) and in Node (require). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Parser = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var LEVELS = ['I', 'II', 'III', 'I-II', 'II-III', 'IV'];
  var SOURCES = ['A', 'B', 'AB'];
  var TOPIC_KEYS = ['cluster', 'name', 'name_fa', 'source', 'keywords', 'refs'];
  var VARIANT_KEYS = ['name', 'level', 'source', 'meta', 'refs'];

  function splitList(s) {
    return (s || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
  }

  /* parse one topic file -> {topic, errors[]} */
  function parseTopic(text, fileName) {
    var errors = [];
    var err = function (line, msg) { errors.push((fileName ? fileName + ': ' : '') + (line ? 'line ' + line + ': ' : '') + msg); };
    var lines = String(text).replace(/\r\n?/g, '\n').split('\n');
    var topic = null, v = null, sec = null, br = null, elseMode = false, lastItem = null;
    var buf = null; // text buffer for guide/scenario/why

    function flushBuf() {
      if (!buf) return;
      var t = buf.lines.join('\n').replace(/^\s+|\s+$/g, '');
      if (buf.kind === 'guide') topic.guide = t;
      else if (buf.kind === 'scenario') v.sc = t;
      else if (buf.kind === 'why') v.why = t;
      buf = null;
    }

    for (var i = 0; i < lines.length; i++) {
      var raw = lines[i], ln = i + 1;
      if (/^\s*\/\//.test(raw)) continue; // comment line
      var m = raw.match(/^@(\w+)\s*(.*)$/);
      if (m) {
        flushBuf();
        var name = m[1].toLowerCase(), arg = m[2].trim();
        lastItem = null;
        if (name === 'topic') {
          if (topic) err(ln, 'a file can hold only one @topic');
          topic = { id: arg, cluster: '', name: '', nameFa: '', src: '', kw: '', refs: [], guide: '', variants: [] };
          v = null; sec = 'topichead';
        } else if (name === 'variant') {
          if (!topic) { err(ln, '@variant before @topic'); continue; }
          v = { id: arg, topic: topic.id, n: '', lv: '', src: '', meta: '', refs: [], sc: '', why: '', o: [], br: [], fa: [] };
          topic.variants.push(v); sec = 'varhead';
        } else if (name === 'guide') {
          if (!topic) { err(ln, '@guide before @topic'); continue; }
          sec = 'guide'; buf = { kind: 'guide', lines: [] };
        } else if (name === 'scenario' || name === 'why') {
          if (!v) { err(ln, '@' + name + ' must be inside a @variant'); continue; }
          sec = name; buf = { kind: name, lines: [] };
        } else if (name === 'orders') {
          if (!v) { err(ln, '@orders must be inside a @variant'); continue; }
          sec = 'orders';
        } else if (name === 'branch') {
          if (!v) { err(ln, '@branch must be inside a @variant'); continue; }
          br = { c: '', t: '', d: [], e: [], ec: '', go: [] }; elseMode = false;
          v.br.push(br); sec = 'branch';
        } else if (name === 'notes') {
          if (!v) { err(ln, '@notes must be inside a @variant'); continue; }
          sec = 'notes';
        } else {
          err(ln, 'unknown section @' + name);
        }
        continue;
      }
      if (buf) { buf.lines.push(raw); continue; }
      if (!raw.trim()) continue;

      if (sec === 'topichead' || sec === 'varhead') {
        var kv = raw.match(/^([a-z_]+)\s*:\s*(.*)$/i);
        if (!kv) { err(ln, 'expected "key: value" but found: ' + raw.slice(0, 40)); continue; }
        var k = kv[1].toLowerCase(), val = kv[2].trim();
        if (sec === 'topichead') {
          if (TOPIC_KEYS.indexOf(k) < 0) { err(ln, 'unknown topic key "' + k + '"'); continue; }
          if (k === 'cluster') topic.cluster = val;
          else if (k === 'name') topic.name = val;
          else if (k === 'name_fa') topic.nameFa = val;
          else if (k === 'source') topic.src = val.toUpperCase();
          else if (k === 'keywords') topic.kw = val;
          else if (k === 'refs') topic.refs = splitList(val);
        } else {
          if (VARIANT_KEYS.indexOf(k) < 0) { err(ln, 'unknown variant key "' + k + '"'); continue; }
          if (k === 'name') v.n = val;
          else if (k === 'level') v.lv = val.toUpperCase();
          else if (k === 'source') v.src = val.toUpperCase();
          else if (k === 'meta') v.meta = val;
          else if (k === 'refs') v.refs = splitList(val);
        }
        continue;
      }
      if (sec === 'orders') {
        if (/^--\s+/.test(raw)) { v.o.push('## ' + raw.replace(/^--\s+/, '').trim()); lastItem = null; }
        else if (/^-\s+/.test(raw)) { v.o.push(raw.replace(/^-\s+/, '').trim()); lastItem = { arr: v.o }; }
        else if (/^\s+\S/.test(raw) && lastItem) { var a = lastItem.arr; a[a.length - 1] += ' ' + raw.trim(); }
        else err(ln, 'order lines must start with "- " (or "-- " for a sub-heading)');
        continue;
      }
      if (sec === 'branch') {
        var bm = raw.match(/^(if|title|else|go)\s*:\s*(.*)$/i);
        if (bm) {
          var bk = bm[1].toLowerCase(), bv = bm[2].trim();
          if (bk === 'if') br.c = bv;
          else if (bk === 'title') br.t = bv;
          else if (bk === 'else') { elseMode = true; br.ec = bv; }
          else if (bk === 'go') br.go = splitList(bv);
          lastItem = null;
        } else if (/^--\s+/.test(raw)) {
          (elseMode ? br.e : br.d).push('## ' + raw.replace(/^--\s+/, '').trim()); lastItem = null;
        } else if (/^-\s+/.test(raw)) {
          var arr = elseMode ? br.e : br.d;
          arr.push(raw.replace(/^-\s+/, '').trim()); lastItem = { arr: arr };
        } else if (/^\s+\S/.test(raw) && lastItem) { var a2 = lastItem.arr; a2[a2.length - 1] += ' ' + raw.trim(); }
        else err(ln, 'inside @branch use if:, title:, else:, go: or "- " order lines');
        continue;
      }
      if (sec === 'notes') {
        if (/^-\s+/.test(raw)) { v.fa.push(raw.replace(/^-\s+/, '').trim()); lastItem = { arr: v.fa }; }
        else if (/^\s+\S/.test(raw) && lastItem) { v.fa[v.fa.length - 1] += ' ' + raw.trim(); }
        else err(ln, 'notes lines must start with "- "');
        continue;
      }
      err(ln, 'text outside any section: ' + raw.slice(0, 40));
    }
    flushBuf();
    if (!topic) { errors.push((fileName ? fileName + ': ' : '') + 'no @topic found'); return { topic: null, errors: errors }; }
    return { topic: topic, errors: errors };
  }

  /* parse "key | text" reference library */
  function parseRefs(text) {
    var out = {}, errors = [];
    String(text || '').replace(/\r\n?/g, '\n').split('\n').forEach(function (l, i) {
      if (!l.trim() || /^\s*\/\//.test(l)) return;
      var m = l.match(/^([a-z0-9\-]+)\s*\|\s*(.+)$/i);
      if (!m) { errors.push('references: line ' + (i + 1) + ': expected "key | citation"'); return; }
      out[m[1]] = m[2].trim();
    });
    return { refs: out, errors: errors };
  }

  /* parse "id | name | name_fa" cluster list */
  function parseClusters(text) {
    var out = [], errors = [];
    String(text || '').replace(/\r\n?/g, '\n').split('\n').forEach(function (l, i) {
      if (!l.trim() || /^\s*\/\//.test(l)) return;
      var p = l.split('|').map(function (x) { return x.trim(); });
      if (p.length < 2 || !/^[a-z0-9\-]+$/.test(p[0])) { errors.push('clusters: line ' + (i + 1) + ': expected "id | English name | نام فارسی"'); return; }
      out.push({ id: p[0], name: p[1], nameFa: p[2] || '' });
    });
    return { clusters: out, errors: errors };
  }

  /* collect every [^key] used in a topic */
  function collectRefKeys(topic) {
    var keys = {};
    function scan(s) { String(s || '').replace(/\[\^([a-z0-9\-]+)\]/gi, function (m, k) { keys[k] = 1; return m; }); }
    scan(topic.guide);
    (topic.refs || []).forEach(function (k) { keys[k] = 1; });
    topic.variants.forEach(function (v) {
      scan(v.sc); scan(v.why); scan(v.meta); (v.refs || []).forEach(function (k) { keys[k] = 1; });
      v.o.forEach(scan); v.fa.forEach(scan);
      v.br.forEach(function (b) { scan(b.c); scan(b.t); scan(b.ec); b.d.forEach(scan); b.e.forEach(scan); });
    });
    return Object.keys(keys);
  }

  /* validate a whole data set; returns array of error strings */
  function validate(topics, clusters, refs) {
    var errors = [], ids = {}, tids = {}, cids = {};
    clusters.forEach(function (c) { cids[c.id] = 1; });
    topics.forEach(function (t) {
      var w = 'topic "' + t.id + '": ';
      if (!/^[a-z0-9\-]+$/.test(t.id)) errors.push(w + 'id must be lowercase letters, digits and dashes');
      if (tids[t.id]) errors.push(w + 'duplicate topic id'); tids[t.id] = 1;
      if (!cids[t.cluster]) errors.push(w + 'unknown cluster "' + t.cluster + '" (see content/clusters.txt)');
      if (!t.name) errors.push(w + 'missing name');
      if (SOURCES.indexOf(t.src) < 0) errors.push(w + 'source must be A, B or AB');
      if (!t.variants.length) errors.push(w + 'has no @variant');
      t.variants.forEach(function (v) {
        var vw = 'variant "' + v.id + '": ';
        if (!/^[a-z0-9\-]+$/.test(v.id)) errors.push(vw + 'id must be lowercase letters, digits and dashes');
        if (ids[v.id]) errors.push(vw + 'duplicate variant id'); ids[v.id] = 1;
        if (!v.n) errors.push(vw + 'missing name');
        if (v.lv && LEVELS.indexOf(v.lv) < 0) errors.push(vw + 'level must be one of ' + LEVELS.join(', '));
        if (v.src && SOURCES.indexOf(v.src) < 0) errors.push(vw + 'source must be A, B or AB');
        if (!v.sc) errors.push(vw + 'missing @scenario');
      });
    });
    topics.forEach(function (t) {
      collectRefKeys(t).forEach(function (k) { if (!refs[k]) errors.push('topic "' + t.id + '": reference key "' + k + '" is not in content/references.md'); });
      t.variants.forEach(function (v) {
        var strs = [];
        (function walk(x) { if (typeof x === 'string') strs.push(x); else if (Array.isArray(x)) x.forEach(walk); else if (x && typeof x === 'object') Object.keys(x).forEach(function (k) { walk(x[k]); }); })(v);
        strs.forEach(function (s) { String(s).replace(/\[\[([a-z0-9\-]+)\|/g, function (m, id) { if (!ids[id]) errors.push('variant "' + v.id + '": link [[' + id + '|…]] points to a missing page'); return m; }); });
        v.br.forEach(function (b) { b.go.forEach(function (id) { if (!ids[id]) errors.push('variant "' + v.id + '": go: ' + id + ' points to a missing page'); }); });
      });
    });
    return errors;
  }

  return { parseTopic: parseTopic, parseRefs: parseRefs, parseClusters: parseClusters, validate: validate, collectRefKeys: collectRefKeys, LEVELS: LEVELS };
});
