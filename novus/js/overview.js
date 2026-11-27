/* Overview page: KB blocks, hero console, lanes, flow, port network */
(function () {
  'use strict';
  var N = window.NOVUS, T = window.NovusT;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';

  /* KB-driven blocks (same templates as tools/build.mjs, so they always match the data file) */
  $('#svcGrid').innerHTML = T.servicesHTML(N);
  $('#faqList').innerHTML = T.faqHTML(N);
  $('#portList').innerHTML = T.portsHTML(N);
  $('#contactList').innerHTML = T.contactHTML(N);
  Array.prototype.forEach.call(document.querySelectorAll('#svcGrid [data-ask]'), function (b) {
    b.addEventListener('click', function () { window.NovusOpen && window.NovusOpen(b.getAttribute('data-ask')); });
  });

  /* hero console */
  $('#heroAv').innerHTML = window.NovusIcons.spark;
  $('#heroEngine').innerHTML = window.NovusEngineSwitch.html();
  window.NovusEngineSwitch.wire($('#heroEngine'));
  var hc = new window.NovusChat($('#heroChat'), { id: 'hq', foot: false, placeholder: 'e.g. Magkano LCL from China?', empty: window.NovusEmpty('Ask anything about Novus', 'Does Novus handle it? How much? What documents? Where is my cargo? Ask in English, Tagalog or Taglish.') });
  // rotating placeholder
  var ph = ['e.g. Magkano LCL from China?', 'e.g. Do you handle PEZA shipments?', 'e.g. Track NVF-24117', 'e.g. Anong documents para sa customs?', 'e.g. How long by sea to Japan?'], pi = 0;
  if (!reduce) setInterval(function () { if (document.activeElement !== hc.input) { pi = (pi + 1) % ph.length; hc.input.placeholder = ph[pi]; } }, 3200);

  /* hero lanes (no map tiles: projected ports + arcs) */
  (function lanes() {
    var svg = $('#heroLanes'); if (!svg) return;
    function P(lon, lat) { return [(lon - 96) / (146 - 96) * 800, (42 - lat) / (42 - 0) * 560]; }
    var home = P(121, 14.6);
    var ports = [['SHA', 121.5, 31.2], ['SZX', 114.1, 22.5], ['PUS', 129, 35.1], ['TYO', 139.7, 35.7], ['SIN', 103.8, 1.3], ['SGN', 106.7, 10.8], ['KHH', 120.3, 22.6], ['BKK', 100.5, 13.7], ['CEB', 123.9, 10.3], ['DVO', 125.6, 7.1]];
    var g = '', paths = [];
    ports.forEach(function (p, i) {
      var b = P(p[1], p[2]), mx = (home[0] + b[0]) / 2, my = (home[1] + b[1]) / 2, d = Math.hypot(b[0] - home[0], b[1] - home[1]);
      var c = [mx + (b[1] - home[1]) * 0.18, my - d * 0.22];
      var dstr = 'M' + home[0].toFixed(1) + ' ' + home[1].toFixed(1) + ' Q' + c[0].toFixed(1) + ' ' + c[1].toFixed(1) + ' ' + b[0].toFixed(1) + ' ' + b[1].toFixed(1);
      g += '<path class="lane" id="ln' + i + '" d="' + dstr + '"/>';
      g += '<circle class="port" cx="' + b[0].toFixed(1) + '" cy="' + b[1].toFixed(1) + '" r="2.6"/><text x="' + (b[0] + 7).toFixed(1) + '" y="' + (b[1] + 3.5).toFixed(1) + '">' + p[0] + '</text>';
    });
    g += '<circle class="ring" cx="' + home[0] + '" cy="' + home[1] + '" r="5"/><circle class="home" cx="' + home[0] + '" cy="' + home[1] + '" r="5"/><text x="' + (home[0] + 10) + '" y="' + (home[1] + 4) + '" style="fill:#fff">MNL</text>';
    svg.innerHTML = g;
    if (reduce) return;
    ports.forEach(function (p, i) { paths.push({ el: svg.querySelector('#ln' + i), t: Math.random(), v: 0.0018 + Math.random() * 0.0022, dir: i % 3 === 0 ? -1 : 1 }); });
    paths.forEach(function (o) { o.len = o.el.getTotalLength(); o.dot = document.createElementNS(NS, 'circle'); o.dot.setAttribute('r', '2.2'); o.dot.setAttribute('style', 'fill:var(--accent-2)'); svg.appendChild(o.dot); });
    var visible = true;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(svg);
    (function frame() {
      if (visible) paths.forEach(function (o) {
        o.t = (o.t + o.v) % 1; var tt = o.dir > 0 ? o.t : 1 - o.t;
        var pt = o.el.getPointAtLength(tt * o.len); o.dot.setAttribute('cx', pt.x.toFixed(1)); o.dot.setAttribute('cy', pt.y.toFixed(1));
      });
      requestAnimationFrame(frame);
    })();
  })();

  /* flow: light the steps one by one when visible */
  (function flow() {
    var steps = document.querySelectorAll('.flow-step'), k = 0, timer = null;
    function lightTo(n) { Array.prototype.forEach.call(steps, function (s, i) { s.classList.toggle('lit', i <= n); }); }
    if (reduce) return lightTo(steps.length - 1);
    var io = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting && !timer) { k = -1; timer = setInterval(function () { k++; if (k >= steps.length + 2) k = 0; lightTo(Math.min(k, steps.length - 1)); }, 900); }
      else if (!es[0].isIntersecting && timer) { clearInterval(timer); timer = null; }
    }, { threshold: 0.4 });
    io.observe(document.getElementById('flow'));
  })();

  /* port network diagram */
  (function net() {
    var svg = $('#phMap'); if (!svg) return;
    function P(lon, lat) { return [(lon - 117.5) / 9.5 * 420, (19.5 - lat) / 14 * 520]; }
    var nodes = [
      { id: 'mnl', n: 'Manila', c: 'MICP · South Harbor · NAIA', ll: [120.97, 14.6], dx: 12, dy: 4, hub: true },
      { id: 'sub', n: 'Subic', c: 'Freeport', ll: [120.27, 14.8], dx: -12, dy: 18, anchor: 'end' },
      { id: 'crk', n: 'Clark', c: 'Air · Freeport', ll: [120.55, 15.18], dx: 10, dy: -14 },
      { id: 'ceb', n: 'Cebu', c: 'Sea · Air', ll: [123.9, 10.3], dx: 12, dy: 4 },
      { id: 'dvo', n: 'Davao', c: 'Sea', ll: [125.6, 7.07], dx: -12, dy: 4, anchor: 'end' }
    ];
    var g = '<defs><pattern id="dg" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.3" fill="#d9d3c6"/></pattern><radialGradient id="fadeG" cx="50%" cy="50%" r="55%"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><mask id="fadeM"><rect width="420" height="520" fill="url(#fadeG)"/></mask></defs>';
    g += '<rect width="420" height="520" fill="url(#dg)" mask="url(#fadeM)"/>';
    var m = P(120.97, 14.6);
    // international exits
    g += '<path class="lk" d="M' + m[0] + ' ' + m[1] + ' Q 90 60 40 10"/><text class="c" x="48" y="24">to China, Japan, Korea</text>';
    g += '<path class="lk" d="M' + m[0] + ' ' + m[1] + ' Q 40 300 10 420"/><text class="c" x="18" y="440">to Singapore, Vietnam</text>';
    nodes.forEach(function (nd) {
      if (nd.hub) return; var p = P(nd.ll[0], nd.ll[1]);
      g += '<path class="lk" d="M' + m[0] + ' ' + m[1] + ' Q ' + ((m[0] + p[0]) / 2 + 30) + ' ' + ((m[1] + p[1]) / 2 - 20) + ' ' + p[0] + ' ' + p[1] + '"/>';
    });
    nodes.forEach(function (nd) {
      var p = P(nd.ll[0], nd.ll[1]), a = nd.anchor ? ' text-anchor="' + nd.anchor + '"' : '';
      g += '<circle class="pt' + (nd.hub ? ' hub' : '') + '" cx="' + p[0] + '" cy="' + p[1] + '" r="' + (nd.hub ? 7 : 5) + '"/>';
      g += '<text x="' + (p[0] + nd.dx) + '" y="' + (p[1] + nd.dy) + '"' + a + '>' + nd.n + '</text><text class="c" x="' + (p[0] + nd.dx) + '" y="' + (p[1] + nd.dy + 13) + '"' + a + '>' + nd.c + '</text>';
    });
    svg.innerHTML = g;
  })();
})();

/* hide the floating launcher while the hero console is on screen (it is the same assistant) */
(function () {
  var fab = document.querySelector('.fab'), con = document.getElementById('heroConsole');
  if (!fab || !con || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(function (es) {
    var panelOpen = document.querySelector('.panel') && !document.querySelector('.panel').hidden;
    if (!panelOpen) fab.hidden = es[0].isIntersecting && es[0].intersectionRatio > 0.25;
  }, { threshold: [0, 0.25, 0.5] }).observe(con);
})();
