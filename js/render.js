/* Pure HTML renderers. window.Render in the browser. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Render = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var CIRC = '①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮';
  var SRC = { A: 'A · Beesat sheet', B: 'B · Isfahan booklet', AB: 'A+B consensus' };
  var SRCS = { A: 'A', B: 'B', AB: 'A+B' };

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- store ---------- */
  function makeStore(clusters, topics, refs) {
    var s = { clusters: clusters, topics: topics, refs: refs || {}, byId: {}, topicById: {}, clusterById: {}, topicOf: {} };
    clusters.forEach(function (c) { s.clusterById[c.id] = c; });
    topics.forEach(function (t) { s.topicById[t.id] = t; t.variants.forEach(function (v) { s.byId[v.id] = v; s.topicOf[v.id] = t; }); });
    return s;
  }

  /* ---------- inline formatting ---------- */
  function newCtx(store) { return { store: store, keys: [], idx: {} }; }
  function cite(ctx, key) {
    if (!(key in ctx.idx)) { ctx.keys.push(key); ctx.idx[key] = ctx.keys.length; }
    return ctx.idx[key];
  }
  function badge(src) { return '<span class="badge b-' + src + '" title="' + SRC[src] + '">' + SRCS[src] + '</span>'; }
  var INL = { A: badge('A'), B: badge('B'), AB: badge('AB') };

  function fmt(s, ctx) {
    s = esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      .replace(/\[\[([a-z0-9\-]+)\|(.+?)\]\]/g, function (m, id, l) { return '<a href="#/v/' + id + '">' + l + '</a>'; })
      .replace(/@(AB|A|B)(?![A-Za-z0-9_])/g, function (m, t) { return INL[t]; });
    if (ctx) {
      s = s.replace(/\[\^([a-z0-9\-]+)\]/gi, function (m, k) {
        var n = cite(ctx, k);
        var known = ctx.store.refs[k];
        return '<sup class="ref' + (known ? '' : ' bad') + '"><a href="#ref-' + n + '" title="' + esc(known || 'unknown reference') + '">[' + n + ']</a></sup>';
      });
    }
    return s;
  }

  function dirOf(t) {
    var fa = (String(t).match(/[\u0600-\u06FF]/g) || []).length, la = (String(t).match(/[A-Za-z]/g) || []).length;
    return fa >= la * 0.3 && fa > 0 ? 'rtl' : 'ltr';
  }
  /* multi-line Farsi/English text -> paragraphs + bullets */
  function block(text, ctx) {
    if (!text) return '';
    var out = '', list = false;
    String(text).split(/\n\s*\n/).forEach(function (para) {
      var lines = para.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
      var i = 0, buf = [];
      function flushP() { if (buf.length) { out += '<p dir="' + dirOf(buf.join(' ')) + '">' + fmt(buf.join(' '), ctx) + '</p>'; buf = []; } }
      for (; i < lines.length; i++) {
        var l = lines[i];
        if (/^#\s+/.test(l)) { flushP(); if (list) { out += '</ul>'; list = false; } out += '<h4 dir="' + dirOf(l) + '">' + fmt(l.replace(/^#\s+/, ''), ctx) + '</h4>'; }
        else if (/^-\s+/.test(l)) { flushP(); if (!list) { out += '<ul dir="' + dirOf(para) + '">'; list = true; } out += '<li>' + fmt(l.replace(/^-\s+/, ''), ctx) + '</li>'; }
        else { if (list) { out += '</ul>'; list = false; } buf.push(l); }
      }
      flushP(); if (list) { out += '</ul>'; list = false; }
    });
    return out;
  }

  function lvCls(l) { return !l ? '' : (/^I(?!I)/.test(l) && !/-/.test(l) ? 'l1' : (/^II/.test(l) || /^I-/.test(l) ? 'l2' : 'l3')); }
  function lvBadge(l) {
    if (!l) return '';
    var c = lvCls(l);
    return '<span class="badge b-L' + (c === 'l1' ? 1 : c === 'l2' ? 2 : 3) + '" title="Triage level used in the sheets (I = resuscitation room, II = urgent, III = less urgent)">Level ' + esc(l) + '</span>';
  }

  /* ---------- order rows ---------- */
  function rows(items, ctx, defSrc) {
    var n = 0, h = '<div class="orders">';
    items.forEach(function (it) {
      if (it.indexOf('## ') === 0) { h += '<div class="sub">' + fmt(it.slice(3), ctx) + '</div>'; return; }
      n++;
      h += '<label class="row"><input type="checkbox"><span class="num">' + n + '</span><span class="txt">' + fmt(it, ctx) + '</span></label>';
    });
    return h + '</div>';
  }
  function goLinks(store, go) {
    if (!go || !go.length) return '';
    return '<div class="go">→ ' + go.map(function (id) {
      var v = store.byId[id];
      return v ? '<a href="#/v/' + id + '">' + esc(store.topicOf[id].name + ' — ' + v.n) + '</a>' : '<b>?' + esc(id) + '</b>';
    }).join(' · ') + '</div>';
  }
  function branches(store, list, ctx, defSrc) {
    return list.map(function (b) {
      var h = '<div class="branch">';
      if (b.c) h += '<div class="if"><i>IF</i>' + fmt(b.c, ctx) + '</div>';
      else if (b.t) h += '<div class="plain">' + fmt(b.t, ctx) + '</div>';
      if (b.d && b.d.length) h += rows(b.d, ctx, defSrc);
      if (b.e && b.e.length) h += '<div class="else"><i>OTHERWISE</i>' + (b.ec ? fmt(b.ec, ctx) : '') + '</div>' + rows(b.e, ctx, defSrc);
      h += goLinks(store, b.go) + '</div>';
      return h;
    }).join('');
  }

  /* ---------- index ---------- */
  function renderIndex(store, q) {
    q = (q || '').trim().toLowerCase();
    var h = '', total = 0, nv = 0;
    store.topics.forEach(function (t) { total++; nv += t.variants.length; });
    if (!q) {
      h += '<h1>دستورات اورژانس · Emergency Orders</h1>';
      h += '<div class="warn"><div dir="rtl"><b>فقط برای مطالعه و مرور.</b> جایگزین قضاوت بالینی یا پروتکل بیمارستان نیست. هر مورد دارای شماره مرجع را با راهنمای بالینی ذکرشده تطبیق دهید.</div><div dir="ltr" class="mute" style="font-size:.88rem">Reference aid only. Verify numbered-reference items against the cited guideline.</div></div>';
      h += '<p class="mute" dir="rtl">' + total + ' موضوع · ' + nv + ' نسخه دستور · ' + store.clusters.length + ' دسته</p>';
      /* at a glance */
      h += '<section class="glance" id="glance"><h2>فهرست سریع · At a glance</h2><div class="gl-grid">';
      store.clusters.forEach(function (c) {
        var ts = store.topics.filter(function (t) { return t.cluster === c.id; });
        if (!ts.length) return;
        h += '<div class="gl-col"><h3><a href="#c-' + c.id + '" data-jump="' + c.id + '">' + esc(c.name) + (c.nameFa ? '<span class="fa-sub"> ' + esc(c.nameFa) + '</span>' : '') + '</a></h3><ul>';
        ts.forEach(function (t) {
          h += '<li><a href="#/t/' + t.id + '">' + esc(t.name) + (t.nameFa ? '<span class="fa-sub">' + esc(t.nameFa) + '</span>' : '') + '</a></li>';
        });
        h += '</ul></div>';
      });
      h += '</div></section>';
      h += '<details class="legend-box"><summary>راهنمای علامت‌ها · Legend</summary><div class="legend"><span>' + badge('A') + ' برگه بعثت (Beesat)</span><span>' + badge('B') + ' کتابچه اصفهان ۱۳۹۸</span><span>' + badge('AB') + ' هر دو منبع</span><span><sup class="ref"><a>[n]</a></sup> مورد افزوده‌شده از مرجع (شماره = فهرست مراجع پایین صفحه)</span><span>' + lvBadge('I') + ' احیا · ' + lvBadge('II') + ' فوری · ' + lvBadge('III') + ' کم‌اورژانس‌تر</span></div></details>';
      h += '<h2 class="detailh">فهرست کامل با نسخه‌ها · Full list with variants</h2>';
    }
    var shown = 0;
    store.clusters.forEach(function (c) {
      var ts = store.topics.filter(function (t) { return t.cluster === c.id; }).filter(function (t) {
        if (!q) return true;
        var hay = (t.name + ' ' + t.nameFa + ' ' + (t.kw || '') + ' ' + t.variants.map(function (v) { return v.n + ' ' + (v.meta || ''); }).join(' ')).toLowerCase();
        return q.split(/\s+/).every(function (w) { return hay.indexOf(w) >= 0; });
      });
      if (!ts.length) return;
      h += '<section class="cluster" id="c-' + c.id + '"><h2>' + esc(c.name) + (c.nameFa ? ' <span class="fa-sub">' + esc(c.nameFa) + '</span>' : '') + '</h2>';
      ts.forEach(function (t) {
        shown++;
        h += '<div class="topic"><h3><a href="#/t/' + t.id + '">' + esc(t.name) + '</a>' + (t.nameFa ? ' <span class="fa-sub">' + esc(t.nameFa) + '</span>' : '') + ' ' + badge(t.src) + '</h3><div class="chips">';
        t.variants.forEach(function (v, i) {
          h += '<a class="chip ' + lvCls(v.lv) + '" href="#/v/' + v.id + '"><span class="n">' + (CIRC.charAt(i) || (i + 1)) + '</span>' + esc(v.n) + '</a>';
        });
        h += '</div></div>';
      });
      h += '</section>';
    });
    if (!shown) h += '<div class="empty">موردی پیدا نشد · No topic matches “' + esc(q) + '”.</div>';
    return h;
  }

  /* ---------- guide + comment ---------- */
  function guideBox(store, t, v, ctx) {
    var inner = '';
    if (v && v.why) inner += '<h3 dir="auto">این نسخه از دستورها · This variant</h3>' + block(v.why, ctx);
    if (t.guide) inner += '<h3 dir="auto">بیماری و منطق دستورها · The condition and the logic</h3>' + block(t.guide, ctx);
    if (!inner) return '';
    return '<details class="study"><summary>📚 راهنمای مطالعه · Study guide</summary><div class="study-body">' + inner + '</div></details>';
  }
  function commentBox(pageId, title) {
    return '<section class="comment" data-page="' + esc(pageId) + '" data-title="' + esc(title) + '"><h3>💬 نظر یا اصلاحیه · Feedback</h3>' +
      '<p class="mute" dir="rtl">اگر چیزی در این صفحه نادرست، مبهم یا ناقص است بنویسید. نظرها ذخیره می‌شود و بعداً بررسی و اصلاح می‌شود.</p><p class="mute" dir="ltr" style="font-size:.85rem">If anything on this page looks wrong or unclear, tell us.</p>' +
      '<textarea rows="3" dir="auto" placeholder="نظر شما… / Your comment…" aria-label="Comment"></textarea>' +
      '<div class="crow"><input type="text" dir="auto" placeholder="نام (اختیاری) / Name (optional)" aria-label="Name"><button type="button" data-send>ارسال · Send</button></div>' +
      '<div class="cmsg" role="status"></div></section>';
  }
  function refList(store, ctx, extraKeys) {
    (extraKeys || []).forEach(function (k) { cite(ctx, k); });
    if (!ctx.keys.length) return '';
    return '<section class="refs-box"><h2>مراجع · References</h2><ol class="refs">' + ctx.keys.map(function (k, i) {
      var c = store.refs[k];
      return '<li id="ref-' + (i + 1) + '">' + (c ? linkDoi(esc(c)) : '<b>' + esc(k) + '</b> (reference not found in content/references.md)') + '</li>';
    }).join('') + '</ol></section>';
  }
  function linkDoi(s) {
    return s.replace(/(doi:\s*)(10\.\d{4,9}\/[^\s<]+)/gi, function (m, p, d) { return p + '<a href="https://doi.org/' + d.replace(/[.,;]$/, '') + '" target="_blank" rel="noopener">' + d + '</a>'; });
  }

  /* ---------- topic page ---------- */
  function renderTopic(store, id) {
    var t = store.topicById[id]; if (!t) return null;
    var c = store.clusterById[t.cluster] || { id: '', name: '' };
    var ctx = newCtx(store);
    var h = '<div class="crumb"><a href="#/">فهرست · Contents</a> / <a href="#c-' + c.id + '" data-jump="' + c.id + '">' + esc(c.name) + '</a></div>';
    h += '<h1>' + esc(t.name) + ' ' + badge(t.src) + '</h1>';
    if (t.nameFa) h += '<p class="fa-title" dir="rtl">' + esc(t.nameFa) + '</p>';
    h += '<h2>کدام نسخه به بیمار شما می‌خورد؟ · Which variant matches your patient?</h2>';
    t.variants.forEach(function (v, i) {
      h += '<div class="topiccard"><h3><a href="#/v/' + v.id + '">' + (CIRC.charAt(i) || (i + 1)) + ' ' + esc(v.n) + '</a> ' + badge(v.src || t.src) + ' ' + lvBadge(v.lv) + '</h3><div class="sc-mini" dir="auto">' + fmt(v.sc || '', null) + '</div></div>';
    });
    var g = guideBox(store, t, null, ctx);
    var rl = refList(store, ctx, t.refs);
    return { html: h + rl + g + commentBox('topic:' + t.id, t.name), title: t.name + ' · Emergency Orders' };
  }

  /* ---------- variant page ---------- */
  function renderVariant(store, id) {
    var v = store.byId[id]; if (!v) return null;
    var t = store.topicOf[id], c = store.clusterById[t.cluster] || { id: '', name: '' };
    var src = v.src || t.src, ctx = newCtx(store);
    var idx = t.variants.indexOf(v);
    var h = '<div class="crumb"><a href="#/">فهرست · Contents</a> / <a href="#c-' + c.id + '" data-jump="' + c.id + '">' + esc(c.name) + '</a> / <a href="#/t/' + t.id + '">' + esc(t.name) + '</a></div>';
    h += '<h1>' + esc(t.name) + ' — ' + esc(v.n) + '</h1><div class="hbadges">' + badge(src) + ' ' + lvBadge(v.lv) + '</div>';
    if (v.meta) h += '<div class="meta">' + fmt(v.meta, ctx) + '</div>';
    if (t.variants.length > 1) {
      h += '<div class="tabs">' + t.variants.map(function (x, j) { return '<a class="' + (x === v ? 'on' : '') + '" href="#/v/' + x.id + '">' + (CIRC.charAt(j) || (j + 1)) + ' ' + esc(x.n) + '</a>'; }).join('') + '</div>';
    }
    if (v.sc) h += '<div class="scenario"><b class="h">سناریو · Scenario</b><div dir="auto">' + block(v.sc, ctx) + '</div></div>';
    var body = '';
    if (v.o.length) body += '<h2>دستورات · Orders</h2>' + rows(v.o, ctx, src);
    if (v.br.length) body += '<h2>اگر … · If / otherwise</h2>' + branches(store, v.br, ctx, src);
    if (v.fa.length) body += '<details class="fa"><summary>یادداشت‌های فارسی منبع · Persian notes from the sources</summary><ul>' + v.fa.map(function (d) { return '<li>' + fmt(d, ctx) + '</li>'; }).join('') + '</ul></details>';
    var g = guideBox(store, t, v, ctx);
    var rl = refList(store, ctx, (v.refs || []).concat(t.refs || []));
    var nav = '';
    if (t.variants.length > 1) {
      var p = t.variants[idx - 1], n = t.variants[idx + 1];
      nav = '<div class="nav2">' + (p ? '<a href="#/v/' + p.id + '">← ' + esc(p.n) + '</a>' : '<span></span>') + (n ? '<a class="r" href="#/v/' + n.id + '">' + esc(n.n) + ' →</a>' : '<span></span>') + '</div>';
    }
    return { html: h + body + nav + rl + g + commentBox(v.id, t.name + ' — ' + v.n), title: t.name + ' — ' + v.n };
  }

  return { dirOf: dirOf, esc: esc, fmt: fmt, block: block, makeStore: makeStore, newCtx: newCtx, renderIndex: renderIndex, renderTopic: renderTopic, renderVariant: renderVariant, badge: badge, lvBadge: lvBadge };
});
