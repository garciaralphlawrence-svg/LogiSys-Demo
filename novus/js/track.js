/* Track page */
(function () {
  'use strict';
  var N = window.NOVUS, U = window.NovusUtil, esc = window.NovusT.esc;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var out = $('#trackOut'), input = $('#trackNo');
  var TIP = {
    booked: 'Space is confirmed. Nothing for you to do yet; Novus will tell you once it departs.',
    transit: 'Your cargo is on its way. Novus prepares the customs entry while it travels, so clearance starts the day it arrives.',
    arrived: 'Your cargo is at the port. Novus is lodging the customs entry now.',
    customs: 'This is the Bureau of Customs step. Assessment is done; once duties are confirmed paid, BOC releases the cargo and Novus dispatches the truck. No action needed unless the team calls you.',
    released: 'BOC has released your cargo and the truck is on the way. Please have someone ready to receive and sign.',
    delivered: 'Delivered and signed for. The proof of delivery is in your Novus records.'
  };

  $('#samples').insertAdjacentHTML('beforeend', N.shipments.map(function (s) { return '<button class="chip" type="button" data-no="' + esc(s.no) + '">' + esc(s.no) + '</button>'; }).join(''));
  Array.prototype.forEach.call(document.querySelectorAll('[data-no]'), function (b) { b.addEventListener('click', function () { input.value = b.dataset.no; show(b.dataset.no); }); });

  function show(raw) {
    var m = String(raw).toUpperCase().match(/NVF[\s-]?(\d{4,6})/), no = m ? 'NVF-' + m[1] : String(raw).toUpperCase().trim();
    var sh = N.shipments.filter(function (s) { return s.no === no; })[0];
    try { history.replaceState(null, '', 'track.html?no=' + encodeURIComponent(no)); } catch (e) { }
    if (!sh) {
      out.innerHTML = '<div class="card empty-state" style="margin-top:28px"><h2 style="color:var(--text);font-size:20px">We couldn’t find ' + esc(no || 'that number') + '</h2><p style="margin-top:6px">Check the number on your Novus booking confirmation (it starts with NVF-), or ask the team.</p><div style="margin-top:16px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap"><button class="btn sm" type="button" data-ask="Talk to a person">Talk to a person</button></div></div>';
      bindAsk(); return;
    }
    var st = U.stageState(sh), events = sh.events;
    var now = events.filter(function (e) { return e[3] === 'now'; })[0] || events[events.length - 1];
    var nxt = events.filter(function (e) { return e[3] === 'next'; })[0];
    var doneCount = st.filter(function (x) { return x === 'done' || x === 'skip'; }).length + (sh.stage === 'delivered' ? 0 : 0.5);
    var pct = Math.min(1, doneCount / 6);
    var pill = sh.stage === 'delivered' ? 'ok' : sh.stage === 'customs' ? 'warn' : 'acc';
    out.innerHTML =
      '<div class="tr-grid">' +
      '<div class="card reveal in" style="padding:26px">' +
      '<div class="tr-head"><div><small style="color:var(--muted);font-weight:700">' + esc(sh.direction) + ' · ' + esc(sh.mode) + '</small><h2>' + esc(sh.no) + '</h2></div><span class="pill ' + pill + '"><span class="dot"></span>' + esc(now[0]) + '</span></div>' +
      '<div class="tr-route"><div><small>From</small><b>' + esc(sh.origin) + '</b></div>' +
      '<svg viewBox="0 0 200 60" aria-hidden="true"><path class="base" d="M6 50 Q100 -10 194 50"/><path class="prog-l" id="progL" d="M6 50 Q100 -10 194 50"/><circle cx="6" cy="50" r="5" style="fill:var(--ink)"/><circle cx="194" cy="50" r="5" style="fill:' + (pct >= 1 ? 'var(--accent)' : 'var(--line)') + '"/><circle id="progDot" r="6" style="fill:var(--accent)"/></svg>' +
      '<div class="r2"><small>To</small><b>' + esc(sh.destination) + '</b></div></div>' +
      '<div class="pipe">' + U.STAGES.map(function (s, i) { var x = st[i] === 'skip' ? 'done' : st[i]; return '<div class="' + x + '"><i></i><span>' + s + '</span></div>'; }).join('') + '</div>' +
      '<dl class="kv" style="margin-top:22px"><dt>Latest</dt><dd>' + esc(now[2]) + (now[1] ? ' · ' + esc(now[1]) : '') + '</dd><dt>Next</dt><dd>' + (nxt ? esc(nxt[2]) : 'Completed') + '</dd><dt>ETA</dt><dd>' + esc(sh.eta) + '</dd><dt>Vessel / flight</dt><dd>' + esc(sh.vessel) + '</dd><dt>Container / AWB</dt><dd class="mono">' + esc(sh.container) + '</dd><dt>Consignee</dt><dd>' + esc(sh.consignee) + '</dd></dl>' +
      '</div>' +
      '<div style="display:grid;gap:20px;align-content:start">' +
      '<div class="card tr-ai"><span class="ai-tag">' + window.NovusIcons.spark.replace('<svg', '<svg style="width:14px;height:14px"') + 'Novus AI, in plain words</span><p>' + esc(TIP[sh.stage]) + '</p><div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap"><button class="btn sm" type="button" data-ask="Track ' + esc(sh.no) + '">Ask about this shipment</button><button class="btn sm ghost" type="button" style="color:#fff" data-ask="Talk to a person">Talk to a person</button></div></div>' +
      '<div class="card"><h3 style="font-size:15px;font-weight:800;margin-bottom:14px">Timeline</h3><ol class="tl">' +
      events.map(function (e) { var boc = e[0] === 'Customs' || (e[0] === 'Released' && /BOC|cleared|released/i.test(e[2])); return '<li class="' + e[3] + '"><i></i><b>' + esc(e[0]) + (boc && e[0] === 'Customs' ? ' <span class="tag" style="background:var(--accent-soft);color:var(--accent)">BOC</span>' : '') + (e[1] ? ' <time>' + esc(e[1]) + '</time>' : '') + '</b><p>' + esc(e[2]) + '</p></li>'; }).join('') +
      '</ol></div></div></div>';
    // animate progress along the arc
    var path = $('#progL'), dot = $('#progDot'), len = path.getTotalLength(), target = pct;
    path.style.strokeDasharray = len; path.style.strokeDashoffset = len;
    var t0 = null, reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    function step(ts) {
      if (!t0) t0 = ts; var k = reduce ? 1 : Math.min(1, (ts - t0) / 1300), e = 1 - Math.pow(1 - k, 3), v = target * e;
      path.style.strokeDashoffset = len * (1 - v);
      var p = path.getPointAtLength(len * v); dot.setAttribute('cx', p.x); dot.setAttribute('cy', p.y);
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    bindAsk();
  }
  function bindAsk() {
    Array.prototype.forEach.call(out.querySelectorAll('[data-ask]'), function (b) { b.addEventListener('click', function () { window.NovusOpen && window.NovusOpen(b.getAttribute('data-ask')); }); });
  }
  $('#trackForm').addEventListener('submit', function (e) { e.preventDefault(); if (input.value.trim()) show(input.value); });
  var pre = new URLSearchParams(location.search).get('no');
  input.value = pre || N.shipments[0].no;
  show(input.value);
})();
