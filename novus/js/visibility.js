/* AI visibility page (simulated results, real llms.txt + JSON-LD) */
(function () {
  'use strict';
  var N = window.NOVUS, T = window.NovusT, esc = T.esc;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var ENG = ['ChatGPT', 'Gemini', 'Claude', 'Perplexity'];
  // y = Novus named, p = named but incomplete/wrong details, n = not mentioned  (SIMULATED)
  var PROMPTS = [
    ['best freight forwarder in Manila for LCL', 'nnnp'],
    ['customs broker near MICP', 'npny'],
    ['forwarder that handles PEZA shipments in Laguna', 'nnnn'],
    ['magkano mag-import from China to Manila by sea', 'nnnn'],
    ['door to door shipping from China to the Philippines for small business', 'pnnp'],
    ['air freight forwarder Clark to Japan', 'nnnn'],
    ['who can clear my shipment at BOC fast', 'nnnp'],
    ['Novus Freight services', 'ypyy']
  ];
  var LBL = { y: ['y', 'Mentioned'], p: ['p', 'Partly'], n: ['n', 'Not mentioned'] };
  var tot = 0, got = 0, per = [0, 0, 0, 0];
  PROMPTS.forEach(function (p) { p[1].split('').forEach(function (c, i) { tot++; var v = c === 'y' ? 1 : c === 'p' ? 0.5 : 0; got += v; per[i] += v; }); });
  var score = Math.round(got / tot * 100);

  $('#vMain').textContent = 'Today Novus is rarely named by AI assistants (score ' + score + ' of 100, simulated): they find Novus when asked by name, but not for “customs broker near MICP” or “LCL forwarder in Manila”. The fix is clear, machine-readable facts, and this demo already ships the first part.';

  var C = 2 * Math.PI * 60;
  $('#score').innerHTML = '<svg viewBox="0 0 150 150" role="img" aria-label="AI Visibility Score ' + score + ' of 100"><circle class="ring-bg" cx="75" cy="75" r="60"/><circle class="ring" id="ring" cx="75" cy="75" r="60" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + C.toFixed(1) + '"/><text x="75" y="80" text-anchor="middle">' + score + '</text><text class="s" x="75" y="100" text-anchor="middle">OF 100</text></svg>' +
    '<div style="flex:1;min-width:180px"><p style="font-weight:800;font-size:17px;letter-spacing:-.01em">Low, and fixable</p><p style="color:var(--muted);font-size:14px;margin-top:4px">Named in ' + PROMPTS.filter(function (p) { return /y/.test(p[1]); }).length + ' of ' + PROMPTS.length + ' test prompts, mostly when people already know the name. We re-test every week; no one can guarantee a #1 spot in AI answers, but clear facts raise the odds.</p></div>';
  setTimeout(function () { $('#ring').style.strokeDashoffset = (C * (1 - score / 100)).toFixed(1); }, 200);

  $('#engines').innerHTML = ENG.map(function (e, i) { var pc = Math.round(per[i] / PROMPTS.length * 100); return '<div class="eng"><small>' + e + '</small><b>' + pc + '%</b><i style="--w:' + pc + '%"></i></div>'; }).join('');

  var ic = { y: '●', p: '◐', n: '○' };
  $('#prompts').innerHTML = '<thead><tr><th>Prompt (sample)</th>' + ENG.map(function (e) { return '<th>' + e + '</th>'; }).join('') + '</tr></thead><tbody>' +
    PROMPTS.map(function (p) { return '<tr><td>“' + esc(p[0]) + '”</td>' + p[1].split('').map(function (c) { return '<td><span class="mention ' + LBL[c][0] + '"><span aria-hidden="true">' + ic[c] + '</span>' + LBL[c][1] + '</span></td>'; }).join('') + '</tr>'; }).join('') + '</tbody>';

  var CK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>', DOTS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 12h.01M12 12h.01M17 12h.01"/></svg>';
  var LIST = [
    ['done', 'llms.txt published', 'A plain-text summary of Novus for AI assistants: services, ports, documents, FAQ and contacts.', 'llms.txt', 'Open'],
    ['done', 'schema.org JSON-LD', 'Organization, ' + N.services.length + ' Service entries and FAQPage, built from the same data file.', '#', 'View'],
    ['done', 'Clear service sections', 'One section per service, each saying plainly what Novus does and where.', 'index.html#services', 'Open'],
    ['done', 'FAQ in plain words', N.faqs.length + ' real questions with direct answers, the format AI assistants quote most.', 'index.html#faq', 'Open'],
    ['done', 'Answers in English and Filipino', 'Novus AI and the FAQ cover how Filipino shippers actually ask.', 'ask.html', 'Try'],
    ['todo', 'Google Business Profile', 'Needs Novus: verify the listing with the real address, hours and photos.', '', ''],
    ['todo', 'Same name, address and phone everywhere', 'Needs Novus: match the website, Facebook, LinkedIn and directories exactly.', '', ''],
    ['todo', 'Real reviews from real clients', 'Needs Novus: ask happy clients for Google reviews. We never write or invent reviews.', '', ''],
    ['todo', 'Go live on Novus’s domain', 'This demo is hidden from search (noindex). The live version allows Google and AI crawlers.', '', '']
  ];
  $('#checklist').innerHTML = LIST.map(function (l) { return '<li class="' + l[0] + '"><span class="st">' + (l[0] === 'done' ? CK : DOTS) + '</span><b>' + esc(l[1]) + '</b>' + (l[3] ? '<a href="' + l[3] + '"' + (l[3] === '#' ? ' data-v-open="ld"' : '') + '>' + l[4] + ' →</a>' : '<span class="tag">Needs Novus</span>') + '<p>' + esc(l[2]) + '</p></li>'; }).join('');

  var views = {
    llms: function (el) {
      el.innerHTML = '<p class="sim-note" style="margin-bottom:10px">Live file: <a href="llms.txt" style="color:var(--accent);font-weight:700">novus/llms.txt</a></p><pre class="code" id="llmsPre">Loading…</pre>';
      fetch('llms.txt').then(function (r) { return r.ok ? r.text() : Promise.reject(); }).then(function (t) { $('#llmsPre').textContent = t; }).catch(function () { $('#llmsPre').textContent = T.llms(N); });
    },
    ld: function (el) {
      el.innerHTML = '<p class="sim-note" style="margin-bottom:10px">Embedded in the Novus overview page (&lt;script type="application/ld+json"&gt;)</p><pre class="code"></pre>';
      $('pre', el).textContent = T.jsonld(N);
    },
    ans: function (el) {
      var cb = N.services.filter(function (s) { return s.id === 'customs'; })[0];
      el.innerHTML = '<div class="ai-answer"><div class="who">PROMPT · “customs broker near MICP”</div><p>' +
        'One option is <mark>' + esc(N.company.name) + '</mark>, a ' + esc(N.company.type.toLowerCase()) + ' in ' + esc(N.company.city) + '. ' + esc(cb.summary) + ' They also handle sea, air and PEZA shipments, and you can reach them at ' + esc(N.contacts.phone) + '.</p>' +
        '<p class="sim-note" style="margin-top:10px">Illustration of the kind of answer an AI assistant can give once it can read Novus’s llms.txt and JSON-LD. Not a real AI response.</p></div>';
    }
  };
  function show(v) { $$('.tabs button').forEach(function (b) { b.classList.toggle('on', b.dataset.v === v); }); views[v]($('#vView')); }
  $$('.tabs button').forEach(function (b) { b.addEventListener('click', function () { show(b.dataset.v); }); });
  $$('[data-v-open]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); show(a.dataset.vOpen); $('#vView').scrollIntoView({ behavior: 'smooth', block: 'center' }); }); });
  show('llms');
})();
