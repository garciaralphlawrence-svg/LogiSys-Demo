/* AI visibility page: real before/after check of nfiph.com, simulated prompt results,
   and the real llms.txt + JSON-LD generated from the Novus data file */
(function () {
  'use strict';
  var N = window.NOVUS, T = window.NovusT, esc = T.esc, co = N.company;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var ENG = ['ChatGPT', 'Gemini', 'Claude', 'Perplexity'];
  // y = Novus named, p = named with missing/wrong details, n = not mentioned  (SIMULATED until the weekly test runs for real)
  var PROMPTS = [
    ['customs broker in Binondo Manila', 'nnnp'],
    ['NVOCC LCL consolidation Philippines', 'nnnn'],
    ['PEZA customs clearance Manila', 'nnnn'],
    ['triangular shipment forwarder Philippines', 'nnnn'],
    ['trucking wing van Manila', 'nnnn'],
    ['perishable cargo customs clearance Philippines', 'nnnn'],
    ['freight forwarder with WCA membership in Manila', 'nnnp'],
    ['Novus Freight Inc. services', 'pnpy']
  ];
  var LBL = { y: ['y', 'Mentioned'], p: ['p', 'Partly'], n: ['n', 'Not mentioned'] };
  var tot = 0, got = 0, per = [0, 0, 0, 0];
  PROMPTS.forEach(function (p) { p[1].split('').forEach(function (c, i) { tot++; var v = c === 'y' ? 1 : c === 'p' ? 0.5 : 0; got += v; per[i] += v; }); });
  var score = Math.round(got / tot * 100);

  $('#vMain').textContent = 'Right now AI assistants can barely read nfiph.com: the page they download is an empty shell, so Novus rarely comes up for searches like “customs broker in Binondo” or “PEZA customs clearance Manila”. This demo fixes that with clear, machine-readable facts built from Novus’s own information.';

  /* before / after (true statements about the live site, checked 27 Nov 2026) */
  var rawHtml = '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <title>Novus Freight Inc. - Global Logistics Solutions</title>\n    <meta name="description" content="Novus Freight Inc. provides reliable logistics solutions ...">\n    <script type="module" src="/assets/index-DTq9U9WI.js"></script>\n  </head>\n  <body>\n    <div id="root"></div>\n  </body>\n</html>';
  $('#ba').innerHTML =
    '<div class="ba-col before"><h3>Before · nfiph.com today</h3><ul>' +
    '<li>Built as a JavaScript-only app (Lovable). The HTML a crawler downloads is an empty <code>&lt;div id="root"&gt;</code> plus a title and one-line description.</li>' +
    '<li>Services, history, accreditations and contacts only appear after JavaScript runs, which many AI crawlers and bots don’t do.</li>' +
    '<li>No schema.org structured data (no Organization, LocalBusiness, Service or FAQ markup).</li>' +
    '<li>No llms.txt.</li></ul>' +
    '<pre class="code" id="rawPre"></pre></div>' +
    '<div class="ba-col after"><h3>After · this platform</h3><ul>' +
    '<li>Every service line, cargo type, the company history, values, networks and accreditations are plain HTML in the page.</li>' +
    '<li>JSON-LD for Organization + LocalBusiness (Binondo address, phones, emails), ' + N.services.length + ' Services and an FAQPage.</li>' +
    '<li>An llms.txt that summarises Novus for AI assistants.</li>' +
    '<li>All of it generated from one data file, so it stays in sync with Novus AI.</li></ul>' +
    '<p style="margin-top:12px;font-size:13px;color:var(--muted)">See the generated files in “How an AI reads Novus” below.</p></div>';
  $('#rawPre').textContent = rawHtml;

  var C = 2 * Math.PI * 60;
  $('#score').innerHTML = '<svg viewBox="0 0 150 150" role="img" aria-label="AI Visibility Score ' + score + ' of 100"><circle class="ring-bg" cx="75" cy="75" r="60"/><circle class="ring" id="ring" cx="75" cy="75" r="60" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + C.toFixed(1) + '"/><text x="75" y="80" text-anchor="middle">' + score + '</text><text class="s" x="75" y="100" text-anchor="middle">OF 100</text></svg>' +
    '<div style="flex:1;min-width:180px"><p style="font-weight:800;font-size:17px;letter-spacing:-.01em">Very low, and fixable</p><p style="color:var(--muted);font-size:14px;margin-top:4px">Simulated: Novus is mostly found only when people already type its name. The live version re-tests these prompts every week. Nobody can guarantee a top spot in AI answers, but readable facts are the first requirement.</p></div>';
  setTimeout(function () { $('#ring').style.strokeDashoffset = (C * (1 - score / 100)).toFixed(1); }, 200);
  (function () { var tx = $('#score text'), t0 = null; if (!tx || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return; tx.textContent = '0'; requestAnimationFrame(function st(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 1400); tx.textContent = Math.round(score * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(st); }); })();

  $('#engines').innerHTML = ENG.map(function (e, i) { var pc = Math.round(per[i] / PROMPTS.length * 100); return '<div class="eng"><small>' + e + '</small><b>' + pc + '%</b><i style="--w:' + pc + '%"></i></div>'; }).join('');

  var ic = { y: '●', p: '◐', n: '○' };
  $('#prompts').innerHTML = '<thead><tr><th>Prompt (based on Novus’s real services)</th>' + ENG.map(function (e) { return '<th>' + e + '</th>'; }).join('') + '</tr></thead><tbody>' +
    PROMPTS.map(function (p) { return '<tr><td>“' + esc(p[0]) + '”</td>' + p[1].split('').map(function (c) { return '<td><span class="mention ' + LBL[c][0] + '"><span aria-hidden="true">' + ic[c] + '</span>' + LBL[c][1] + '</span></td>'; }).join('') + '</tr>'; }).join('') + '</tbody>';

  var CK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>', DOTS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 12h.01M12 12h.01M17 12h.01"/></svg>';
  var LIST = [
    ['done', 'llms.txt published', 'A plain-text summary of Novus Freight Inc. for AI assistants: services, history, networks, accreditations and contacts.', 'llms.txt', 'Open'],
    ['done', 'schema.org JSON-LD', 'Organization + LocalBusiness (Binondo address), ' + N.services.length + ' Service entries and an FAQPage.', '#', 'View'],
    ['done', 'Services readable without JavaScript', 'Every service line and cargo type from nfiph.com, as plain HTML.', 'index.html#services', 'Open'],
    ['done', 'Company story, values and accreditations', 'History since 2017, mission, vision, WCA World, JC Trans, All World Shipping, PEZA and more.', 'index.html#about', 'Open'],
    ['done', 'Answers in English and Filipino', 'Novus AI and the FAQ cover how Filipino shippers actually ask.', 'ask.html', 'Try'],
    ['todo', 'Move it to nfiph.com', 'Needs Novus: publish these pages (or pre-render the current site) on the real domain. This demo is hidden from search (noindex).', '', ''],
    ['todo', 'Google Business Profile', 'Needs Novus: verify the Binondo listing with the same name, address and phone numbers.', '', ''],
    ['todo', 'Same name, address and phone everywhere', 'Needs Novus: match nfiph.com, Facebook, LinkedIn and network directories (WCA, JC Trans) exactly.', '', ''],
    ['todo', 'Real reviews from real clients', 'Needs Novus: ask happy clients for Google reviews. We never write or invent reviews.', '', '']
  ];
  $('#checklist').innerHTML = LIST.map(function (l) { return '<li class="' + l[0] + '"><span class="st">' + (l[0] === 'done' ? CK : DOTS) + '</span><b>' + esc(l[1]) + '</b>' + (l[3] ? '<a href="' + l[3] + '"' + (l[3] === '#' ? ' data-v-open="ld"' : '') + '>' + l[4] + ' →</a>' : '<span class="tag">Needs Novus</span>') + '<p>' + esc(l[2]) + '</p></li>'; }).join('');

  var views = {
    llms: function (el) {
      el.innerHTML = '<p class="sim-note" style="margin-bottom:10px">Live file: <a href="llms.txt" style="color:var(--accent);font-weight:700">novus/llms.txt</a></p><pre class="code" id="llmsPre">Loading…</pre>';
      fetch('llms.txt').then(function (r) { return r.ok ? r.text() : Promise.reject(); }).then(function (t) { $('#llmsPre').textContent = t; }).catch(function () { $('#llmsPre').textContent = T.llms(N); });
    },
    ld: function (el) {
      el.innerHTML = '<p class="sim-note" style="margin-bottom:10px">Embedded in the overview page (&lt;script type="application/ld+json"&gt;)</p><pre class="code"></pre>';
      $('pre', el).textContent = T.jsonld(N);
    },
    ans: function (el) {
      el.innerHTML = '<div class="ai-answer"><div class="who">PROMPT · “PEZA customs clearance Manila”</div><p>' +
        'One option is <mark>' + esc(co.name) + '</mark> in Binondo, Manila. It started in 2017 as a customs brokerage founded by two Licensed Customs Brokers, clears PEZA, perishable, breakbulk and project cargoes under CIF, CFR, DDP and DDU, and lists PEZA among its accreditations. Contact: ' + esc(N.contacts.phone) + ', ' + esc(N.contacts.email) + '.</p>' +
        '<p class="sim-note" style="margin-top:10px">Illustration of the answer an AI assistant can give once it can read Novus’s llms.txt and JSON-LD. Not a real AI response.</p></div>';
    }
  };
  function show(v) { $$('.tabs button').forEach(function (b) { b.classList.toggle('on', b.dataset.v === v); }); views[v]($('#vView')); }
  $$('.tabs button').forEach(function (b) { b.addEventListener('click', function () { show(b.dataset.v); }); });
  $$('[data-v-open]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); show(a.dataset.vOpen); $('#vView').scrollIntoView({ behavior: 'smooth', block: 'center' }); }); });
  show('llms');
})();

/* before / after reveal slider: what a crawler gets from nfiph.com vs this platform */
(function () {
  'use strict';
  var N = window.NOVUS, esc = window.NovusT.esc, host = document.getElementById('bas');
  if (!host) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var raw = '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <title>Novus Freight Inc. - Global Logistics Solutions</title>\n    <script type="module" src="/assets/index-DTq9U9WI.js"></script>\n  </head>\n  <body>\n    <div id="root"></div>\n  </body>\n</html>';
  var lines = N.services.reduce(function (a, s) { return a + s.lines.length; }, 0);
  host.innerHTML =
    '<div class="bas-top"><span class="b">Before · nfiph.com, as a crawler downloads it</span><span class="a">After · this platform</span></div>' +
    '<div class="bas-frame">' +
      '<div class="bas-layer bas-before"><pre></pre><div class="empty"><b>An empty page</b><small>Services, history and contacts are not in it</small></div></div>' +
      '<div class="bas-layer bas-after"><h4>Readable without JavaScript</h4><div class="facts">' +
        '<div><span>Company</span><b>' + esc(N.company.name) + '</b></div>' +
        '<div><span>Since</span><b>2017</b></div>' +
        '<div><span>Office</span><b>Binondo, Manila</b></div>' +
        '<div><span>Phone</span><b>' + esc(N.contacts.phone) + '</b></div>' +
        '<div><span>Services</span><b>' + N.services.length + ' with ' + lines + ' service lines</b></div>' +
        '<div><span>Accreditations</span><b>' + N.company.accreditations.length + ' local + ' + N.company.networks.length + ' networks</b></div>' +
        '<div><span>Structured data</span><b>JSON-LD</b></div>' +
        '<div><span>For AI assistants</span><b>llms.txt</b></div>' +
      '</div><ul class="svcs">' + N.services.map(function (s) { return '<li>' + esc(s.name) + '</li>'; }).join('') + '</ul></div>' +
      '<span class="bas-handle"></span>' +
      '<input class="bas-range" type="range" min="0" max="100" value="50" aria-label="Compare before and after">' +
    '</div><p class="bas-note">Drag to compare. Left: the real HTML nfiph.com sends today (checked 27 Nov 2026). Right: the facts this platform puts in the page.</p>';
  host.querySelector('pre').textContent = raw;
  var after = host.querySelector('.bas-after'), handle = host.querySelector('.bas-handle'), range = host.querySelector('.bas-range');
  function set(v) { after.style.clipPath = 'inset(0 0 0 ' + v + '%)'; handle.style.left = v + '%'; range.value = v; }
  range.addEventListener('input', function () { set(+range.value); });
  set(50);
  if (reduce || !('IntersectionObserver' in window)) return;
  set(96);
  var io = new IntersectionObserver(function (es) {
    if (!es[0].isIntersecting) return; io.disconnect();
    var t0 = null;
    (function step(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 1600), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; set(96 - 46 * e); if (k < 1) requestAnimationFrame(step); })(performance.now());
    setTimeout(function () { if (+range.value > 60) set(50); }, 2400);
  }, { threshold: 0.4 });
  io.observe(host);
})();
