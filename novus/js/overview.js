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
  $('#accGrid').innerHTML = T.accredHTML(N);
  $('#histList').innerHTML = T.historyHTML(N);
  $('#valsGrid').innerHTML = T.valuesHTML(N);
  $('#contactList').innerHTML = T.contactHTML(N);
  Array.prototype.forEach.call(document.querySelectorAll('#svcGrid [data-ask]'), function (b) {
    b.addEventListener('click', function () { window.NovusOpen && window.NovusOpen(b.getAttribute('data-ask')); });
  });

  /* hero console */
  $('#heroAv').innerHTML = window.NovusIcons.spark;
  $('#heroEngine').innerHTML = window.NovusEngineSwitch.html();
  window.NovusEngineSwitch.wire($('#heroEngine'));
  var hc = new window.NovusChat($('#heroChat'), { id: 'hq', foot: false, placeholder: 'e.g. Nag ca-cater ba kayo ng perishable?', empty: window.NovusEmpty('Ask anything about Novus Freight', 'Does Novus handle your cargo? Who are they? Accredited? Where’s my shipment? Ask in English, Tagalog or Taglish, no browsing needed.') });
  // rotating placeholder
  var ph = ['e.g. Nag ca-cater ba kayo ng perishable?', 'e.g. Do you handle PEZA cargo?', 'e.g. Triangular shipment, kaya nyo?', 'e.g. May wing van ba kayo?', 'e.g. Kwento mo naman about Novus'], pi = 0;
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
