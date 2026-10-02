(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var B = window.__BUNDLE__ || { clusters: '', references: '', topics: {} };
  var cfg = window.SITE_CONFIG || {};

  var TEMPLATE = [
    '// Template for a new topic. Lines that start with // are comments.',
    '@topic my-topic-id',
    'cluster: cardiac',
    'name: English name of the condition',
    'name_fa: نام فارسی بیماری',
    'source: B',
    'keywords: words people may search for',
    'refs: aha-cpr-2025',
    '',
    '@guide',
    'اینجا به زبان ساده توضیح بدهید این بیماری چیست و منطق دستورها چیست.',
    '',
    '@variant my-variant-id',
    'name: Short variant name',
    'level: II',
    'source: B',
    'meta: Imp: … · C: II · Diet: NPO · Activity: CBR',
    'refs: aha-cpr-2025',
    '',
    '@scenario',
    'یک سناریوی کوتاه و واقعی به فارسی ساده که با همین نسخه از دستورها جور باشد.',
    '',
    '@why',
    'در یکی دو جمله بگویید چرا این نسخه با نسخه‌های دیگر فرق دارد.',
    '',
    '@orders',
    '- CVS / NPO / CBR',
    '- Amp **Drug 10 mg** IV stat [^aha-cpr-2025]',
    '',
    '@branch',
    'if: the patient is unstable',
    '- order for this case',
    'else: otherwise',
    '- another order',
    ''
  ].join('\n');

  var cl = Parser.parseClusters(B.clusters), rf = Parser.parseRefs(B.references);
  var existing = {}, files = Object.keys(B.topics).sort();
  files.forEach(function (f) { var r = Parser.parseTopic(B.topics[f], f); if (r.topic) existing[r.topic.id] = { file: f, topic: r.topic }; });

  var src = $('#src'), statusEl = $('#status'), pv = $('#pv'), prev = $('#preview'), start = $('#start');
  var currentFile = null; // file name when editing an existing topic

  /* start selector */
  start.innerHTML = '<option value="">➕ بیماری جدید · New condition</option>' + Object.keys(existing).sort().map(function (id) {
    return '<option value="' + id + '">' + Render.esc(existing[id].topic.name) + ' (' + id + ')</option>';
  }).join('');
  $('#reset').addEventListener('click', function () {
    var id = start.value;
    if (id) { src.value = B.topics[existing[id].file]; currentFile = existing[id].file; }
    else { src.value = TEMPLATE; currentFile = null; }
    update();
  });

  function slug() {
    if (cfg.repo) return cfg.repo;
    var h = location.hostname, p = location.pathname.split('/').filter(Boolean);
    if (/\.github\.io$/.test(h)) return h.replace(/\.github\.io$/, '') + '/' + (p[0] || h);
    return '';
  }

  var parsed = null;
  function update() {
    var r = Parser.parseTopic(src.value, 'draft');
    var errors = r.errors.slice();
    parsed = r.topic;
    if (r.topic) {
      var others = Object.keys(existing).filter(function (id) { return id !== r.topic.id; }).map(function (id) { return existing[id].topic; });
      var all = others.concat([r.topic]);
      var ve = Parser.validate(all, cl.clusters, rf.refs).filter(function (e) {
        return e.indexOf('"' + r.topic.id + '"') >= 0 || e.indexOf('topic "' + r.topic.id + '"') >= 0 || /^variant "/.test(e) && r.topic.variants.some(function (v) { return e.indexOf('"' + v.id + '"') >= 0; });
      });
      errors = errors.concat(ve);
    }
    if (errors.length) statusEl.innerHTML = '<div class="errs"><b>خطا · Problems (' + errors.length + ')</b><ul>' + errors.map(function (e) { return '<li>' + Render.esc(e) + '</li>'; }).join('') + '</ul></div>';
    else if (r.topic) statusEl.innerHTML = '<div class="ok">✔ درست است · OK: ' + r.topic.variants.length + ' variant(s)</div>';
    else statusEl.innerHTML = '';
    /* preview selector */
    var keep = pv.value;
    pv.innerHTML = '';
    if (r.topic) {
      pv.innerHTML = '<option value="__topic">Topic page</option>' + r.topic.variants.map(function (v) { return '<option value="' + v.id + '">' + Render.esc(v.n || v.id) + '</option>'; }).join('');
      if (keep && pv.querySelector('option[value="' + keep + '"]')) pv.value = keep;
    }
    drawPreview();
  }
  function drawPreview() {
    if (!parsed) { prev.innerHTML = '<p class="mute">…</p>'; return; }
    var others = Object.keys(existing).filter(function (id) { return id !== parsed.id; }).map(function (id) { return existing[id].topic; });
    var store = Render.makeStore(cl.clusters, others.concat([parsed]), rf.refs);
    var out = pv.value && pv.value !== '__topic' ? Render.renderVariant(store, pv.value) : Render.renderTopic(store, parsed.id);
    prev.innerHTML = out ? out.html : '<p class="mute">…</p>';
    /* links inside the preview should not navigate away */
    prev.querySelectorAll('a[href^="#"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });
    prev.querySelectorAll('.comment').forEach(function (c) { c.remove(); });
  }

  var t = null;
  src.addEventListener('input', function () { clearTimeout(t); t = setTimeout(update, 250); });
  pv.addEventListener('change', drawPreview);

  function fileName() {
    if (currentFile) return currentFile;
    return (parsed && parsed.id ? parsed.id : 'new-topic') + '.md';
  }
  $('#copy').addEventListener('click', function () {
    navigator.clipboard.writeText(src.value).then(function () { flash('کپی شد · Copied'); }, function () { src.select(); document.execCommand('copy'); flash('کپی شد · Copied'); });
  });
  $('#dl').addEventListener('click', function () {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([src.value], { type: 'text/markdown' }));
    a.download = fileName(); a.click();
  });
  $('#gh').addEventListener('click', function () {
    var s = slug();
    if (!s) { flash('آدرس مخزن مشخص نیست؛ config.js را تنظیم کنید. · Repository unknown: set "repo" in config.js'); return; }
    var name = fileName();
    var base = 'https://github.com/' + s;
    if (currentFile) {
      navigator.clipboard && navigator.clipboard.writeText(src.value);
      window.open(base + '/edit/main/content/topics/' + encodeURIComponent(name), '_blank', 'noopener');
      flash('متن کپی شد. در صفحه GitHub همه را انتخاب و Paste کنید، سپس Commit. · Text copied: in GitHub select all, paste, then Commit.');
      return;
    }
    var url = base + '/new/main?filename=' + encodeURIComponent('content/topics/' + name) + '&value=' + encodeURIComponent(src.value);
    if (url.length < 7500) { window.open(url, '_blank', 'noopener'); flash('صفحه GitHub باز شد؛ روی Commit بزنید. · GitHub opened: press “Commit changes”.'); }
    else {
      navigator.clipboard && navigator.clipboard.writeText(src.value);
      window.open(base + '/new/main?filename=' + encodeURIComponent('content/topics/' + name), '_blank', 'noopener');
      flash('متن بلند است و کپی شد. در GitHub Paste کنید و Commit بزنید. · Text is long and was copied: paste it in GitHub, then Commit.');
    }
  });
  function flash(m) { var d = document.createElement('div'); d.className = 'ok'; d.textContent = m; statusEl.prepend(d); setTimeout(function () { d.remove(); }, 6000); }

  $('#theme').addEventListener('click', function () {
    var r = document.documentElement, cur = r.getAttribute('data-theme');
    var dark = cur ? cur === 'dark' : matchMedia('(prefers-color-scheme:dark)').matches;
    r.setAttribute('data-theme', dark ? 'light' : 'dark');
  });

  src.value = TEMPLATE; update();
})();
