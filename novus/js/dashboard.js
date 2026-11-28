/* Novus operations dashboard (sample data shaped like an ERP export) */
(function () {
  'use strict';
  var esc = window.NovusT.esc, STAGES = window.NovusUtil.STAGES;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';
  var seed = 7; function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  function money(n) { return n >= 1e6 ? '₱' + (n / 1e6).toFixed(2) + 'M' : '₱' + Math.round(n / 1000) + 'k'; }

  /* ---------- sample dataset (as if read from Novus’s ERP) ---------- */
  var D = {
    30: {
      kpi: [['Active shipments', 142, '', '+9 vs last 30d', 'up'], ['On time', 94.2, '%', '+1.6 pts', 'up'], ['In customs', 23, '', '3 on hold', 'down'], ['Revenue this month', 8420000, 'peso', '+12%', 'up'], ['Quotes pending', 31, '', '9 older than 3 days', 'down'], ['Avg clearance', 2.8, ' days', '−0.4 days', 'up']],
      stages: [28, 47, 12, 23, 9, 186],
      lanes: [['Shanghai → Manila · FCL', 38], ['Shenzhen → Manila · LCL', 31], ['Manila → Cebu · Domestic', 22], ['Busan → Manila · LCL', 18], ['Clark ↔ Tokyo · Air', 14], ['Singapore → Manila · LCL', 11]],
      cust: [['Customer A · PEZA locator, Laguna', 1420000], ['Customer B · retail chain, Metro Manila', 1110000], ['Customer C · perishables importer, Valenzuela', 860000], ['Customer D · machinery, Cavite', 640000], ['Customer E · online seller, Pasig', 380000]],
      funnel: [['Quote requests', 214], ['Quoted', 188], ['Accepted', 71], ['Booked', 64]],
      asked: 412, gaps: 12,
      top: [['Do you handle perishable cargo?', 46], ['Where is my shipment? (tracking)', 41], ['Do you clear PEZA cargo?', 37], ['How much is LCL from China?', 33], ['Can you handle triangular shipments?', 19], ['Are you accredited? (PEZA, CAB…)', 15]],
      gap: [['May warehousing ba kayo?', 6], ['What are your office hours?', 4], ['Do you offer cargo insurance?', 3], ['May branch ba kayo sa Cebu?', 2]],
      src: [['Novus AI chat', 34], ['Google search', 26], ['Facebook', 15], ['Referrals', 13], ['AI assistants (ChatGPT, Gemini…)', 7], ['Phone / walk-in', 5]]
    },
    90: {
      kpi: [['Active shipments', 142, '', '+21 vs prior 90d', 'up'], ['On time', 92.8, '%', '+0.9 pts', 'up'], ['In customs', 23, '', '3 on hold', 'down'], ['Revenue (90 days)', 24900000, 'peso', '+8%', 'up'], ['Quotes pending', 31, '', '9 older than 3 days', 'down'], ['Avg clearance', 3.1, ' days', '−0.2 days', 'up']],
      stages: [28, 47, 12, 23, 9, 541],
      lanes: [['Shanghai → Manila · FCL', 104], ['Shenzhen → Manila · LCL', 92], ['Manila → Cebu · Domestic', 70], ['Busan → Manila · LCL', 49], ['Clark ↔ Tokyo · Air', 41], ['Singapore → Manila · LCL', 36]],
      cust: [['Customer A · PEZA locator, Laguna', 4210000], ['Customer B · retail chain, Metro Manila', 3380000], ['Customer C · perishables importer, Valenzuela', 2470000], ['Customer D · machinery, Cavite', 1960000], ['Customer E · online seller, Pasig', 1020000]],
      funnel: [['Quote requests', 598], ['Quoted', 531], ['Accepted', 197], ['Booked', 181]],
      asked: 1184, gaps: 29,
      top: [['Do you handle perishable cargo?', 129], ['Where is my shipment? (tracking)', 118], ['Do you clear PEZA cargo?', 104], ['How much is LCL from China?', 97], ['Can you handle triangular shipments?', 52], ['Are you accredited? (PEZA, CAB…)', 44]],
      gap: [['May warehousing ba kayo?', 15], ['What are your office hours?', 11], ['Do you offer cargo insurance?', 8], ['May branch ba kayo sa Cebu?', 6]],
      src: [['Novus AI chat', 31], ['Google search', 28], ['Facebook', 16], ['Referrals', 14], ['AI assistants (ChatGPT, Gemini…)', 6], ['Phone / walk-in', 5]]
    }
  };
  var ALERTS = [
    ['bad', 'Red lane', 'NVF-24121 · physical exam at MICP', 'BOC scheduled the exam for 28 Nov. A Novus broker will attend; client informed.'],
    ['warn', 'On hold', 'NVF-24109 · FDA permit missing', 'Entry on hold until the client sends the permit. Reminder sent this morning.'],
    ['warn', 'Free time', '3 containers near demurrage', 'Free time at MICP ends in 2 days. Pull-out trucks should be booked today.'],
    ['ok', 'Green lane', 'NVF-24117 · duties computed', 'Waiting for payment confirmation, then release and delivery to Valenzuela.']
  ];
  var CUSTS = ['Customer A', 'Customer B', 'Customer C', 'Customer D', 'Customer E', 'Customer F'];
  var LANES = ['Shanghai → MICP', 'Shenzhen → MICP', 'Manila → Cebu', 'Busan → South Harbor', 'Clark → Tokyo', 'Singapore → MICP'];
  var NOTE = {
    'Booked': ['Booking confirmed', 'Waiting for cargo at origin', 'Space confirmed, sails Mon'],
    'In transit': ['On the water', 'Transshipment in Kaohsiung', 'Departed origin'],
    'Arrived': ['Discharged, entry being prepared', 'At CFS for devanning', 'Arrived, awaiting documents'],
    'Customs': ['Lodged in e2m', 'Assessment (green lane)', 'Yellow lane document check', 'Waiting for duty payment'],
    'Released': ['Gate pass out', 'Truck dispatched', 'Bonded truck to ecozone'],
    'Delivered': ['Signed for', 'POD uploaded', 'Delivered, invoice sent']
  };

  var period = 30;
  $('#dUpd').textContent = 'Synced from Novus’s system at 9:15 AM (sample)';

  function spark(up) {
    var pts = [], v = 50; for (var i = 0; i < 14; i++) { v += (rnd() - (up ? 0.38 : 0.6)) * 14; v = Math.max(8, Math.min(92, v)); pts.push(v); }
    return '<svg viewBox="0 0 140 30" preserveAspectRatio="none" aria-hidden="true"><polyline fill="none" stroke="' + (up ? 'var(--ok)' : 'var(--accent)') + '" stroke-width="2" stroke-linejoin="round" points="' + pts.map(function (p, i) { return (i * 140 / 13).toFixed(1) + ',' + (30 - p * 0.28).toFixed(1); }).join(' ') + '"/></svg>';
  }
  function countUp(el, to, fmt) {
    if (reduce) { el.textContent = fmt(to); return; }
    var t0 = null; requestAnimationFrame(function step(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 1100), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(to * e); if (k < 1) requestAnimationFrame(step); });
  }

  function render() {
    var d = D[period]; seed = period;
    /* briefing */
    var held = 3, stale = 9;
    $('#bMain').textContent = 'Novus is on track: ' + d.kpi[0][1] + ' shipments moving and ' + d.kpi[1][1] + '% on time. Today, the thing to watch is customs: ' + held + ' entries need a person, and ' + stale + ' quotes are waiting more than 3 days.';
    $('#bList').innerHTML =
      '<li><b>Customs:</b> one red-lane exam at MICP on 28 Nov and one entry on hold for an FDA permit. Book pull-out trucks for 3 containers before free time ends.</li>' +
      '<li><b>Sales:</b> ' + d.funnel[2][1] + ' of ' + d.funnel[0][1] + ' quotes accepted. Follow up the ' + stale + ' oldest today; Shanghai FCL is the busiest lane.</li>' +
      '<li><b>Novus AI:</b> answered ' + d.asked.toLocaleString() + ' client questions. ' + d.gaps + ' it couldn’t answer are listed as content gaps below.</li>';
    /* KPIs */
    $('#kpis').innerHTML = d.kpi.map(function (k, i) { return '<div class="kpi"><small>' + k[0] + '</small><b data-k="' + i + '">0</b><em class="' + k[4] + '">' + k[3] + '</em>' + spark(k[4] === 'up') + '</div>'; }).join('');
    d.kpi.forEach(function (k, i) {
      var el = $('[data-k="' + i + '"]'), dec = String(k[1]).indexOf('.') > -1;
      countUp(el, k[1], function (v) { return k[2] === 'peso' ? money(v) : (dec ? v.toFixed(1) : Math.round(v)) + k[2]; });
    });
    /* stages */
    var max = Math.max.apply(null, d.stages.slice(0, 5));
    $('#stages').innerHTML = STAGES.map(function (s, i) { return '<button class="stage' + (i === 3 ? ' on' : '') + '" data-s="' + i + '"><small>' + s + (i === 5 ? ' (period)' : '') + '</small><b>' + d.stages[i] + '</b><i style="transform:scaleX(' + (i === 5 ? 1 : d.stages[i] / max).toFixed(2) + ')"></i></button>'; }).join('');
    $$('.stage').forEach(function (b) { b.addEventListener('click', function () { $$('.stage').forEach(function (x) { x.classList.toggle('on', x === b); }); table(+b.dataset.s); }); });
    table(3);
    /* bars */
    function bars(el, rows, fmt, acc) {
      var m = rows[0][1];
      el.innerHTML = rows.map(function (r) { return '<div class="bar-row' + (acc ? ' hl' : '') + '"><b title="' + esc(r[0]) + '">' + esc(r[0]) + '</b><span>' + fmt(r[1]) + '</span><div class="track"><i data-w="' + (r[1] / m * 100).toFixed(1) + '"></i></div></div>'; }).join('');
      requestAnimationFrame(function () { setTimeout(function () { $$('i[data-w]', el).forEach(function (i) { i.style.width = i.dataset.w + '%'; }); }, 60); });
    }
    bars($('#lanesBars'), d.lanes, function (v) { return v + ' shipments'; });
    bars($('#custBars'), d.cust, money, true);
    /* funnel */
    var f0 = d.funnel[0][1], cols = ['var(--ink)', 'var(--ink-3)', '#3a4b6b', 'var(--accent)'];
    $('#funnel').innerHTML = d.funnel.map(function (r, i) { return '<div style="width:' + (r[1] / f0 * 100).toFixed(1) + '%;background:' + cols[i] + '"><span>' + r[0] + '</span><span>' + r[1] + '</span></div>'; }).join('');
    $('#funnelNote').textContent = 'Win rate ' + Math.round(d.funnel[3][1] / d.funnel[0][1] * 100) + '% · quotes that started in Novus AI convert best (sample).';
    /* asked */
    askedTab(document.querySelector('#asked .tabs .on').dataset.t);
    /* donut */
    var colors = ['var(--accent)', 'var(--ink)', '#3b5b8c', '#8aa0bf', '#14965f', '#cfc9bd'], tot = 0, acc = 0, C = 2 * Math.PI * 52;
    d.src.forEach(function (s) { tot += s[1]; });
    var arcs = d.src.map(function (s, i) { var len = s[1] / tot * C, a = '<circle r="52" cx="70" cy="70" fill="none" stroke="' + colors[i] + '" stroke-width="20" stroke-dasharray="' + len.toFixed(2) + ' ' + (C - len).toFixed(2) + '" stroke-dashoffset="' + (-acc).toFixed(2) + '" transform="rotate(-90 70 70)"/>'; acc += len; return a; }).join('');
    $('#donut').innerHTML = '<svg viewBox="0 0 140 140" role="img" aria-label="Lead sources">' + arcs + '<text x="70" y="68" text-anchor="middle" style="font:800 20px var(--font);fill:var(--text)">' + d.funnel[0][1] + '</text><text x="70" y="84" text-anchor="middle" style="font:600 9px var(--font);fill:var(--muted)">quote requests</text></svg>' +
      '<ul class="legend">' + d.src.map(function (s, i) { return '<li><span class="sw" style="background:' + colors[i] + '"></span>' + esc(s[0]) + '<em>' + s[1] + '%</em></li>'; }).join('') + '</ul>';
  }

  function table(i) {
    var s = STAGES[i], n = Math.min(6, D[period].stages[i]), rows = '';
    seed = 31 + i;
    for (var k = 0; k < n; k++) {
      var no = 'NVF-24' + (100 + Math.floor(rnd() * 60)), lane = LANES[Math.floor(rnd() * LANES.length)];
      var cust = CUSTS[Math.floor(rnd() * CUSTS.length)], note = NOTE[s][k % NOTE[s].length], days = 1 + Math.floor(rnd() * 5);
      if (i === 3 && k === 0) { no = 'NVF-24117'; lane = 'Shanghai → MICP'; note = 'Waiting for duty payment'; cust = 'Customer C'; }
      rows += '<tr><td class="mono">' + no + '</td><td>' + cust + '</td><td>' + lane + '</td><td>' + note + '</td><td>' + days + ' day' + (days > 1 ? 's' : '') + '</td></tr>';
    }
    $('#stageTbl').innerHTML = '<thead><tr><th>Shipment</th><th>Customer</th><th>Lane</th><th>Status</th><th>In stage</th></tr></thead><tbody>' + rows + '</tbody>';
  }

  function askedTab(t) {
    var d = D[period], html = '';
    if (t === 'top') {
      var live = [];
      try { live = JSON.parse(localStorage.getItem('novus.asked.v1') || '[]').slice(-3).reverse(); } catch (e) { }
      html += live.map(function (q) { return '<li class="live"><span><span class="pill acc" style="margin-right:6px">Live</span>' + esc(q.q) + '</span><em>just now</em></li>'; }).join('');
      html += d.top.map(function (q) { return '<li><span>' + esc(q[0]) + '</span><em>' + q[1] + '×</em></li>'; }).join('');
    } else {
      var liveG = [];
      try { liveG = JSON.parse(localStorage.getItem('novus.asked.v1') || '[]').filter(function (q) { return q.gap; }).slice(-2).reverse(); } catch (e) { }
      html += liveG.map(function (q) { return '<li class="gap"><span><span class="pill acc" style="margin-right:6px">Live</span>' + esc(q.q) + '</span><button class="btn sm dark" type="button" data-fix>Add answer</button></li>'; }).join('');
      html += d.gap.map(function (q) { return '<li class="gap"><span>' + esc(q[0]) + ' <em>· ' + q[1] + '×</em></span><button class="btn sm dark" type="button" data-fix>Add answer</button></li>'; }).join('');
      html += '<li style="background:none;padding:6px 2px;color:var(--muted);font-size:12.5px">Each answer you add goes into the Novus knowledge base, so Novus AI, the website FAQ and llms.txt all learn it at once.</li>';
    }
    $('#qlist').innerHTML = html;
    $$('[data-fix]').forEach(function (b) { b.addEventListener('click', function () { b.outerHTML = '<span class="pill ok">Drafted for review</span>'; }); });
  }
  $$('#asked .tabs button').forEach(function (b) { b.addEventListener('click', function () { $$('#asked .tabs button').forEach(function (x) { x.classList.toggle('on', x === b); }); askedTab(b.dataset.t); }); });
  $$('.seg button').forEach(function (b) { b.addEventListener('click', function () { $$('.seg button').forEach(function (x) { x.classList.toggle('on', x === b); }); period = +b.dataset.p; render(); }); });

  /* lane view (drawn SVG, no map tiles) */
  (function lanes() {
    var svg = $('#lanes');
    function P(lon, lat) { return [(lon - 98) / (142 - 98) * 640, (38 - lat) / 38 * 360]; }
    var home = P(121, 14.6), g = '';
    for (var x = 8; x < 640; x += 16) for (var y = 8; y < 360; y += 16) g += '<circle class="grid-dot" cx="' + x + '" cy="' + y + '" r="1"/>';
    var L = [['Shanghai', 'SHA', 121.5, 31.2, 38], ['Shenzhen', 'SZX', 114.1, 22.5, 31], ['Busan', 'PUS', 129, 35.1, 18], ['Tokyo', 'TYO', 139.7, 35.7, 14], ['Singapore', 'SIN', 103.8, 1.3, 11], ['Cebu', 'CEB', 123.9, 10.3, 22], ['Ho Chi Minh', 'SGN', 106.7, 10.8, 7]];
    var paths = [];
    L.forEach(function (l, i) {
      var b = P(l[2], l[3]), mx = (home[0] + b[0]) / 2, my = (home[1] + b[1]) / 2, dd = Math.hypot(b[0] - home[0], b[1] - home[1]);
      var c = [mx + (b[1] - home[1]) * 0.25, my - dd * 0.25];
      var dstr = 'M' + b[0].toFixed(1) + ' ' + b[1].toFixed(1) + ' Q' + c[0].toFixed(1) + ' ' + c[1].toFixed(1) + ' ' + home[0].toFixed(1) + ' ' + home[1].toFixed(1);
      g += '<path class="ln" id="dl' + i + '" d="' + dstr + '" stroke-width="' + (1 + l[4] / 9).toFixed(1) + '"/>';
      var lx = b[0] + (b[0] > 560 ? -8 : 8), anc = b[0] > 560 ? 'end' : 'start';
      g += '<circle class="nd" cx="' + b[0].toFixed(1) + '" cy="' + b[1].toFixed(1) + '" r="3.5"/><text x="' + lx.toFixed(1) + '" y="' + (b[1] - 4).toFixed(1) + '" text-anchor="' + anc + '">' + l[0] + '</text><text class="n" x="' + lx.toFixed(1) + '" y="' + (b[1] + 9).toFixed(1) + '" text-anchor="' + anc + '">' + l[4] + ' active</text>';
      paths.push({ i: i, n: Math.max(1, Math.round(l[4] / 9)) });
    });
    g += '<circle cx="' + home[0] + '" cy="' + home[1] + '" r="14" fill="rgba(96,165,250,.22)"/><circle class="nd hub" cx="' + home[0] + '" cy="' + home[1] + '" r="6"/><text x="' + (home[0] + 12) + '" y="' + (home[1] + 4) + '" style="fill:#fff;font-weight:800">Manila</text>';
    svg.innerHTML = g;
    var dots = [];
    paths.forEach(function (p) {
      var el = svg.querySelector('#dl' + p.i), len = el.getTotalLength();
      for (var k = 0; k < p.n; k++) { var c = document.createElementNS(NS, 'circle'); c.setAttribute('r', '2.4'); c.setAttribute('class', 'pk'); svg.appendChild(c); dots.push({ el: el, len: len, c: c, t: (k / p.n + rnd() * 0.2) % 1, v: 0.0012 + rnd() * 0.0012 }); }
    });
    function place() { dots.forEach(function (o) { var pt = o.el.getPointAtLength(o.t * o.len); o.c.setAttribute('cx', pt.x.toFixed(1)); o.c.setAttribute('cy', pt.y.toFixed(1)); }); }
    place();
    if (reduce) return;
    var vis = true; if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }).observe(svg);
    (function frame() { if (vis) { dots.forEach(function (o) { o.t = (o.t + o.v) % 1; }); place(); } requestAnimationFrame(frame); })();
  })();

  $('#alerts').innerHTML = ALERTS.map(function (a) { return '<li><span class="pill ' + a[0] + '"><span class="dot"></span>' + a[1] + '</span><b>' + esc(a[2]) + '</b><p>' + esc(a[3]) + '</p></li>'; }).join('');
  render();
})();
