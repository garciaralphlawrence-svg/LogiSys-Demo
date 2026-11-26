/* Logi-Sys Growth Dashboard · concept prototype (sample data) · Likha Studio */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var fmt = function (n) { return Math.round(n).toLocaleString('en-US'); };
  var pct = function (a, b) { return Math.round((a / b - 1) * 100); };

  /* ---------- sample data ---------- */
  var WEEKS = 18; // 13 shown for 90 days + 5 earlier for comparisons
  var google = [], other = [], demos = [];
  for (var i = 0; i < WEEKS; i++) {
    var t = i / (WEEKS - 1);
    google.push(Math.round(1650 + t * t * 2100 + Math.sin(i * 1.7) * 120));
    other.push(Math.round(1050 + t * 260 + Math.cos(i * 1.3) * 70));
    demos.push(Math.round(12 + t * t * 30 + Math.sin(i * 2.1) * 2.5));
  }
  var CTRY = { PH: ['Philippines', .34, .38], IN: ['India', .22, .2], AE: ['UAE', .12, .12], SG: ['Singapore', .1, .1], US: ['USA', .1, .08], MY: ['Malaysia', .07, .08] };
  var KW = [
    ['freight forwarding software philippines', 1300, [24, 19, 15, 11, 6, 3], 'PH', '/philippines'],
    ['BOC e2m software', 210, [9, 7, 4, 3, 2, 1], 'PH', '/customs-compliance'],
    ['logistics software philippines', 880, [26, 22, 14, 10, 7, 5], 'PH', '/philippines'],
    ['freight forwarding software india', 2900, [12, 11, 9, 9, 7, 6], 'IN', '/india'],
    ['customs brokerage software', 1000, [31, 25, 18, 13, 9, 7], 'all', '/customs-compliance'],
    ['freight software UAE', 390, [33, 27, 21, 14, 10, 8], 'AE', '/uae'],
    ['freight forwarding software', 6600, [41, 33, 23, 17, 12, 9], 'all', '/'],
    ['logistics ERP', 1600, [38, 30, 22, 17, 13, 11], 'all', '/logistics-erp'],
    ['cloud ERP for logistics', 1900, [45, 39, 31, 22, 16, 12], 'all', '/platform'],
    ['freight software singapore', 320, [28, 24, 19, 16, 14, 13], 'SG', '/singapore'],
    ['best freight forwarding software', 1000, [52, 44, 35, 26, 19, 14], 'all', '/blog/best-freight-software'],
    ['freight management system', 2400, [39, 34, 27, 22, 18, 15], 'all', '/freight-forwarding'],
    ['warehouse management system philippines', 720, [60, 51, 40, 29, 22, 18], 'PH', '/warehouse-management'],
    ['freight forwarding software usa', 1700, [70, 58, 46, 35, 27, 21], 'US', '/usa']
  ];
  var LEADS = [
    ['Sea and air forwarder, Pasay', 'PH', 'Freight Forwarding, Customs, LogiTRACK', 'Google: freight forwarding software philippines', 'new'],
    ['Customs broker, Cebu', 'PH', 'Customs Compliance, Invoicing', 'Ask Logi chat', 'booked'],
    ['NVOCC, Chennai', 'IN', 'Freight Station, Accounting', 'Google: freight forwarding software india', 'booked'],
    ['3PL warehouse, Dubai', 'AE', 'Warehouse Management, LogiBRAIN', 'LinkedIn', 'new'],
    ['Forwarder, Davao', 'PH', 'Freight Forwarding, LogiLENS', 'Google: BOC e2m software', 'won'],
    ['Freight forwarder, Singapore', 'SG', 'Freight Forwarding, LogiCONNECT', 'WCA network', 'done'],
    ['Customs broker, Los Angeles', 'US', 'Customs Compliance (USA)', 'Google: customs brokerage software', 'new'],
    ['Trucking and CFS, Port Klang', 'MY', 'Transportation, Freight Station', 'Ask Logi chat', 'booked'],
    ['Forwarder, Clark', 'PH', 'Freight Forwarding, Sales & CRM', 'Google: logistics software philippines', 'booked'],
    ['Consolidator, Mumbai', 'IN', 'Freight Forwarding, E-Sanchit', 'Ask Logi chat', 'done']
  ];
  var STATUS = { new: 'New', booked: 'Demo booked', won: 'Became customer', done: 'Demo done' };
  var SOURCES = [['Google search', 58, '#194380'], ['Ask Logi chat', 17, '#2994d1'], ['Direct', 11, '#7cc4ee'], ['LinkedIn', 8, '#bcd6ee'], ['WCA and partners', 6, '#dbe7f3']];
  var TOPICS = [['Pricing and plans', 312], ['BOC e2m and customs filing', 241], ['Moving from our old system', 188], ['Accounting and invoicing', 164], ['LogiTRACK for our clients', 139], ['Warehouse and CFS', 96], ['How long setup takes', 88]];

  var state = { p: 30, c: 'all' };

  function slice() {
    var n = state.p === 30 ? 5 : 13;
    var sh = state.c === 'all' ? [1, 1] : [CTRY[state.c][1], CTRY[state.c][2]];
    var take = function (arr, k, from) { return arr.slice(from, from + k); };
    var from = WEEKS - n, prevFrom = state.p === 30 ? WEEKS - 10 : 0;
    var g = take(google, n, from).map(function (v) { return v * sh[0]; });
    var o = take(other, n, from).map(function (v) { return v * sh[0]; });
    var d = take(demos, n, from).map(function (v) { return v * sh[1]; });
    var sum = function (a) { return a.reduce(function (x, y) { return x + y; }, 0); };
    var prevScale = state.p === 30 ? 1 : 0.74;
    var pg = sum(take(google, state.p === 30 ? 5 : 13, prevFrom)) * sh[0] * prevScale;
    var po = sum(take(other, state.p === 30 ? 5 : 13, prevFrom)) * sh[0] * prevScale;
    var pd = sum(take(demos, state.p === 30 ? 5 : 13, prevFrom)) * sh[1] * prevScale;
    var visits = sum(g) + sum(o), dem = sum(d);
    return { n: n, g: g, o: o, d: d, visits: visits, google: sum(g), demos: dem, pVisits: pg + po, pGoogle: pg, pDemos: pd, chats: visits * 0.066, leadsChat: dem * 0.17 };
  }
  function kwList() { return KW.filter(function (k) { return state.c === 'all' || k[3] === state.c || k[3] === 'all'; }); }

  /* ---------- helpers ---------- */
  function spark(vals, w, h, color, invert) {
    var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals), r = mx - mn || 1;
    var pts = vals.map(function (v, i) { var y = invert ? (v - mn) / r : 1 - (v - mn) / r; return (i / (vals.length - 1) * (w - 4) + 2).toFixed(1) + ',' + (y * (h - 6) + 3).toFixed(1); });
    return '<svg class="spark" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" aria-hidden="true"><polyline points="' + pts.join(' ') + '" fill="none" stroke="' + color + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>';
  }
  function delta(v) { return '<em class="' + (v >= 0 ? 'up' : 'down') + '">' + (v >= 0 ? '▲ ' : '▼ ') + Math.abs(v) + '% vs previous ' + state.p + ' days</em>'; }

  /* ---------- render ---------- */
  function render() {
    var s = slice(), kws = kwList();
    var first = kws.filter(function (k) { return k[2][5] <= 10; }).length;
    var firstBefore = kws.filter(function (k) { return k[2][state.p === 30 ? 4 : 2] <= 10; }).length;
    var conv = s.demos / s.visits * 100, pconv = s.pDemos / s.pVisits * 100;
    var where = state.c === 'all' ? '' : ' in ' + (state.c === 'PH' || state.c === 'AE' ? 'the ' : '') + CTRY[state.c][0];

    $('#bMain').textContent = 'Demo requests' + where + ' are up ' + pct(s.demos, s.pDemos) + '% (' + fmt(s.demos) + ' in the last ' + state.p + ' days), mostly because logi-sys.com now shows on the first page of Google for ' + first + ' of the ' + kws.length + ' keywords we target.';
    var onePage = kws.filter(function (k) { return k[2][5] <= 10; });
    var best = (onePage.length ? onePage : kws).slice().sort(function (a, b) { return (a[2][0] - a[2][5]) < (b[2][0] - b[2][5]) ? 1 : -1; })[0];
    var next = kws.filter(function (k) { return k[2][5] > 10; }).sort(function (a, b) { return b[1] - a[1]; })[0];
    $('#bList').innerHTML = [
      'Biggest win: <b>“' + best[0] + '”</b> moved from #' + best[2][0] + ' to <b>#' + best[2][5] + '</b>.',
      'Ask Logi answered <b>' + fmt(s.chats) + '</b> questions and brought in <b>' + fmt(s.leadsChat) + '</b> demo requests. Top question: pricing.',
      next ? 'Next target: <b>“' + next[0] + '”</b> (' + fmt(next[1]) + ' searches a month) is at #' + next[2][5] + '. One more article can push it to page one.' : 'All target keywords are on page one. Time to add new ones.'
    ].map(function (x) { return '<li>' + x + '</li>'; }).join('');

    var k = [
      ['Website visitors', fmt(s.visits), pct(s.visits, s.pVisits), s.g.map(function (v, i) { return v + s.o[i]; })],
      ['Visitors from Google', fmt(s.google), pct(s.google, s.pGoogle), s.g],
      ['Demo requests', fmt(s.demos), pct(s.demos, s.pDemos), s.d],
      ['Visit → demo rate', conv.toFixed(2) + '%', Math.round((conv / pconv - 1) * 100), s.d.map(function (v, i) { return v / (s.g[i] + s.o[i]); })]
    ];
    $('#kpis').innerHTML = k.map(function (x) { return '<div class="kpi fade"><small>' + x[0] + '</small><b>' + x[1] + '</b>' + delta(x[2]) + spark(x[3], 200, 34, '#2994d1') + '</div>'; }).join('');

    trafficChart(s);

    var steps = [['Visited the website', s.visits, 1], ['Read a product page', s.visits * 0.48, 0.48], ['Tried a demo tool or Ask Logi', s.visits * 0.14, 0.14], ['Requested a demo', s.demos, Math.max(s.demos / s.visits, 0.04)]];
    $('#funnel').innerHTML = steps.map(function (x, i) { return '<div class="fstep"><i style="width:' + (x[2] * 100) + '%;animation-delay:' + i * 0.08 + 's"></i><div><span>' + x[0] + '</span><b>' + fmt(x[1]) + '</b></div>' + (i ? '<small>' + (x[1] / steps[i - 1][1] * 100).toFixed(1) + '% of the step before</small>' : '') + '</div>'; }).join('') +
      '<div class="fstep" style="background:#f4f9fd;border:1px dashed #2994d1"><div><span>Became a paying customer</span><b style="color:#2994d1;font-size:14px">needs Logi-Sys API</b></div><small>Connect the Logi-Sys API to see which keywords bring revenue.</small></div>';

    $('#kwSum').innerHTML = '<span><b>' + first + '</b>of ' + kws.length + ' on page one</span><span><b>+' + (first - firstBefore) + '</b>this period</span>';
    $('#kwTbl tbody').innerHTML = kws.map(function (x) {
      var now = x[2][5], was = x[2][state.p === 30 ? 4 : 2], ch = was - now;
      var cls = now <= 3 ? 'p1' : now <= 10 ? 'p2' : 'p3';
      return '<tr><td>' + x[0] + '</td><td>' + fmt(x[1]) + '</td><td><span class="pos ' + cls + '">' + now + '</span></td><td class="chg ' + (ch >= 0 ? 'up' : 'down') + '">' + (ch > 0 ? '▲ ' + ch : ch < 0 ? '▼ ' + -ch : '–') + '</td><td>' + spark(x[2], 90, 26, now <= 10 ? '#16a34a' : '#2994d1', true) + '</td><td class="url">' + x[4] + '</td></tr>';
    }).join('');

    var leads = LEADS.filter(function (l) { return state.c === 'all' || l[1] === state.c; });
    $('#leadTbl tbody').innerHTML = leads.length ? leads.map(function (l) { return '<tr><td>' + l[0] + '</td><td>' + CTRY[l[1]][0] + '</td><td>' + l[2] + '</td><td>' + l[3] + '</td><td><span class="tag ' + l[4] + '">' + STATUS[l[4]] + '</span></td></tr>'; }).join('') : '<tr><td colspan="5" class="muted">No demo requests from this country yet.</td></tr>';

    var all = state.c; state.c = 'all'; var sAll = slice(); state.c = all;
    var rows = Object.keys(CTRY).map(function (c) { return [CTRY[c][0], sAll.demos * CTRY[c][2], c]; });
    var mx = rows[0][1];
    $('#ctryBars').innerHTML = rows.map(function (r, i) { return '<div class="bar"' + (state.c !== 'all' && r[2] !== state.c ? ' style="opacity:.35"' : '') + '><span>' + r[0] + '</span><div class="tr"><i style="width:' + (r[1] / mx * 100) + '%;animation-delay:' + i * 0.05 + 's"></i></div><b>' + fmt(r[1]) + '</b></div>'; }).join('');
    $('#ctryNote').textContent = 'Philippines leads with ' + Math.round(CTRY.PH[2] * 100) + '% of all demo requests.';

    var acc = 0, R = 46, C = 2 * Math.PI * R, d = '';
    SOURCES.forEach(function (x) { d += '<circle cx="60" cy="60" r="' + R + '" fill="none" stroke="' + x[2] + '" stroke-width="18" stroke-dasharray="' + (x[1] / 100 * C) + ' ' + C + '" stroke-dashoffset="' + (-acc / 100 * C) + '" transform="rotate(-90 60 60)"/>'; acc += x[1]; });
    $('#donut').innerHTML = d + '<text x="60" y="58" text-anchor="middle" font-size="16" font-weight="600" fill="#0a1830">' + fmt(s.demos) + '</text><text x="60" y="74" text-anchor="middle" font-size="9" fill="#5d6b82">demo requests</text>';
    $('#srcList').innerHTML = SOURCES.map(function (x) { return '<li><i style="background:' + x[2] + '"></i>' + x[0] + '<b>' + x[1] + '%</b></li>'; }).join('');

    var sc = s.chats / 1500;
    $('#topics').innerHTML = TOPICS.map(function (x, i) { return '<div class="bar"><span>' + x[0] + '</span><div class="tr"><i style="width:' + (x[1] / TOPICS[0][1] * 100) + '%;animation-delay:' + i * 0.05 + 's"></i></div><b>' + fmt(x[1] * sc) + '</b></div>'; }).join('');

    var dt = new Date();
    $('#updated').textContent = 'Updated ' + dt.toLocaleDateString('en-PH', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + dt.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' }) + '.';
    window.__dash = { s: s, kws: kws, first: first, next: next, best: best };
  }

  function trafficChart(s) {
    var W = 720, H = 280, pl = 46, pr = 40, pt = 14, pb = 30, n = s.n;
    var tot = s.g.map(function (v, i) { return v + s.o[i]; });
    var maxV = Math.ceil(Math.max.apply(null, tot) / 1000) * 1000 || 1000, maxD = Math.ceil(Math.max.apply(null, s.d) / 10) * 10 || 10;
    var bw = (W - pl - pr) / n, h = '';
    for (var k = 0; k <= 4; k++) {
      var y = H - pb - k / 4 * (H - pb - pt);
      h += '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + y + '" y2="' + y + '" stroke="#eef2f7"/><text x="' + (pl - 8) + '" y="' + (y + 4) + '" font-size="11" fill="#5d6b82" text-anchor="end">' + fmt(maxV * k / 4) + '</text><text x="' + (W - pr + 8) + '" y="' + (y + 4) + '" font-size="11" fill="#2994d1">' + Math.round(maxD * k / 4) + '</text>';
    }
    var end = new Date(); end.setDate(end.getDate() - end.getDay());
    for (var i = 0; i < n; i++) {
      var x = pl + i * bw + bw * 0.18, w = bw * 0.64, hg = s.g[i] / maxV * (H - pb - pt), ho = s.o[i] / maxV * (H - pb - pt), base = H - pb;
      var org = 'transform-origin:' + x + 'px ' + base + 'px;animation:barg .8s ' + (i * 0.035) + 's cubic-bezier(.2,.7,.2,1) both';
      h += '<g style="' + org + '"><rect x="' + x + '" y="' + (base - hg) + '" width="' + w + '" height="' + hg + '" fill="#194380" rx="2"><title>Week ' + (i + 1) + ': ' + fmt(s.g[i]) + ' from Google</title></rect>' +
        '<rect x="' + x + '" y="' + (base - hg - ho) + '" width="' + w + '" height="' + ho + '" fill="#bcd6ee" rx="2"><title>' + fmt(s.o[i]) + ' from other sources</title></rect></g>';
      if (n <= 5 || i % 2 === 0 || i === n - 1) { var wd = new Date(end); wd.setDate(end.getDate() - (n - 1 - i) * 7); h += '<text x="' + (x + w / 2) + '" y="' + (H - 10) + '" font-size="11" fill="#5d6b82" text-anchor="middle">' + wd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + '</text>'; }
    }
    var pts = s.d.map(function (v, i) { return (pl + i * bw + bw / 2) + ',' + (H - pb - v / maxD * (H - pb - pt)); });
    h += '<polyline points="' + pts.join(' ') + '" fill="none" stroke="#2994d1" stroke-width="3" stroke-linejoin="round" pathLength="1" style="stroke-dasharray:1;stroke-dashoffset:1;animation:lineg 1.2s .3s ease forwards"/>';
    s.d.forEach(function (v, i) { h += '<circle cx="' + (pl + i * bw + bw / 2) + '" cy="' + (H - pb - v / maxD * (H - pb - pt)) + '" r="4" fill="#fff" stroke="#2994d1" stroke-width="2"><title>' + fmt(v) + ' demo requests</title></circle>'; });
    h += '<style>@keyframes barg{from{transform:scaleY(0)}}@keyframes lineg{to{stroke-dashoffset:0}}</style>';
    $('#chTraffic').innerHTML = h;
  }

  function gauge(el, v, label) {
    var a = Math.PI * (1 - v / 100), x = 60 + 48 * Math.cos(a), y = 62 - 48 * Math.sin(a);
    el.innerHTML = '<path d="M12 62 A48 48 0 0 1 108 62" fill="none" stroke="#e8eef5" stroke-width="10" stroke-linecap="round"/>' +
      '<path d="M12 62 A48 48 0 0 1 ' + x.toFixed(1) + ' ' + y.toFixed(1) + '" fill="none" stroke="' + (v >= 90 ? '#16a34a' : '#2994d1') + '" stroke-width="10" stroke-linecap="round"/>' +
      '<text x="60" y="58" text-anchor="middle" font-size="22" font-weight="600" fill="#0a1830">' + v + '</text><text x="60" y="69" text-anchor="middle" font-size="7.5" fill="#5d6b82">' + label + '</text>';
  }
  gauge($('#g1'), 96, 'out of 100');
  gauge($('#g2'), 94, 'out of 100');

  /* ---------- ask your dashboard (canned AI answers built from the numbers) ---------- */
  var answers = {
    'Which keyword should we work on next?': function (d) { return d.next ? '“' + d.next[0] + '” has ' + fmt(d.next[1]) + ' searches a month and sits at #' + d.next[2][5] + '. Write one in-depth article that links to <b>' + d.next[4] + '</b>, add a short FAQ to that page, and ask two partner sites to link to it. That usually moves a keyword like this onto page one within 4 to 8 weeks.' : 'Every target keyword is already on page one. Add 5 new ones from what prospects ask Ask Logi, starting with pricing and migration questions.'; },
    'Why did demo requests go up?': function (d) { return 'Three reasons: more Google visitors (' + fmt(d.s.google) + ', up ' + pct(d.s.google, d.s.pGoogle) + '%), the new demo tools keep people on the site longer, and Ask Logi turns questions into demo requests (' + fmt(d.s.leadsChat) + ' this period). The biggest single gain came from “' + d.best[0] + '”, now at #' + d.best[2][5] + '.'; },
    'Which country should sales focus on?': function () { return 'The Philippines brings 38% of demo requests and converts best, mostly from the BOC e2m and Philippines pages. India is second at 20% but takes longer to close. UAE is small but growing fast: 3PL and warehouse requests doubled, so a UAE warehouse landing page is a good next step.'; },
    'What content should we write this month?': function () { return 'Based on Ask Logi questions: 1) “How much does freight forwarding software cost?” (pricing is the top question), 2) “How to move from your old freight system without losing data”, 3) “BOC e2m filing checklist for forwarders”, 4) “LogiTRACK: give your clients live tracking”. Each one targets a keyword we are already close to page one on.'; }
  };
  $$('#askChips button').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('#askChips button').forEach(function (x) { x.classList.toggle('on', x === b); });
      var box = $('#askA'); box.innerHTML = '<span class="muted">Thinking…</span>';
      setTimeout(function () { box.innerHTML = '<div class="fade">' + answers[b.textContent](window.__dash) + '</div>'; }, 450);
    });
  });

  /* ---------- controls ---------- */
  $$('.seg button').forEach(function (b) { b.addEventListener('click', function () { $$('.seg button').forEach(function (x) { x.classList.toggle('on', x === b); }); state.p = +b.dataset.p; render(); $('#askA').innerHTML = '<span class="muted">Pick a question.</span>'; $$('#askChips button').forEach(function (x) { x.classList.remove('on'); }); }); });
  $('#country').addEventListener('change', function (e) { state.c = e.target.value; render(); $('#askA').innerHTML = '<span class="muted">Pick a question.</span>'; $$('#askChips button').forEach(function (x) { x.classList.remove('on'); }); });

  var links = $$('.side nav a');
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id); }); });
  }, { rootMargin: '-30% 0px -60% 0px' });
  links.forEach(function (a) { var t = $(a.getAttribute('href')); if (t) io.observe(t); });

  render();
})();
