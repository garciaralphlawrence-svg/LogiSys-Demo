/* Logi-Sys concept prototype · Likha Studio */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var peso = function (n) { return '₱' + Math.round(n).toLocaleString('en-PH'); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  /* ---------- NAV ---------- */
  var nav = $('#nav'), lastY = 0;
  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle('solid', y > window.innerHeight * 0.75);
    nav.classList.toggle('hide', y > lastY && y > 400 && !mnav.classList.contains('open'));
    lastY = y;
  }
  var burger = $('#burger'), mnav = $('#mnav');
  burger.addEventListener('click', function () {
    var open = mnav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
    nav.classList.add('solid');
  });
  $$('#mnav a').forEach(function (a) { a.addEventListener('click', function () { mnav.classList.remove('open'); burger.setAttribute('aria-expanded', false); }); });
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- SMOOTH SCROLL + REVEALS ---------- */
  var lenis = null;
  if (hasGsap && !reduce) {
    gsap.registerPlugin(ScrollTrigger);
    if (window.Lenis) {
      lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
    if (window.SplitText) {
      gsap.registerPlugin(SplitText);
      $$('.split').forEach(function (el) { gsap.set(el, { autoAlpha: 0 }); });
      setTimeout(function () { $$('.split').forEach(function (el) { if (getComputedStyle(el).visibility === 'hidden') gsap.set(el, { autoAlpha: 1 }); }); }, 4000);
      (document.fonts ? document.fonts.ready : Promise.resolve()).then(function () { $$('.split').forEach(function (el) {
        gsap.set(el, { autoAlpha: 1 });
        var st = new SplitText(el, { type: 'lines', linesClass: 'ln' });
        st.lines.forEach(function (l) { var m = document.createElement('span'); m.className = 'ln-mask'; l.parentNode.insertBefore(m, l); m.appendChild(l); });
        gsap.fromTo(st.lines, { yPercent: 110 }, { yPercent: 0, duration: 1.05, ease: 'power4.out', stagger: 0.09, delay: el.closest('.hero') ? 0.15 : 0,
          scrollTrigger: el.closest('.hero') ? null : { trigger: el, start: 'top 88%', once: true } });
      }); ScrollTrigger.refresh(); });
    }
    $$('.reveal').forEach(function (el) {
      var inHero = el.closest('.hero');
      gsap.fromTo(el, { y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'power3.out', delay: inHero ? 0.55 : 0,
        scrollTrigger: inHero ? null : { trigger: el, start: 'top 92%', once: true } });
    });
    $$('.parallax').forEach(function (img) {
      gsap.fromTo(img, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: img.parentNode, scrub: true } });
    });
    var mq = $('#mq');
    mq.innerHTML += mq.innerHTML;
    var mqTween = gsap.to(mq, { xPercent: -50, ease: 'none', duration: 40, repeat: -1 });
    ScrollTrigger.create({ onUpdate: function (s) { mqTween.timeScale(1 + Math.min(Math.abs(s.getVelocity()) / 400, 5)); gsap.to(mqTween, { timeScale: 1, duration: 1, overwrite: true, delay: 0.1 }); } });
    // safety: never leave anything hidden
    setTimeout(function () { $$('.reveal').forEach(function (el) { if (getComputedStyle(el).visibility === 'hidden' && el.getBoundingClientRect().top < window.innerHeight) gsap.set(el, { autoAlpha: 1, y: 0 }); }); }, 6000);
  }
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href'); if (id.length < 2) return;
      var t = $(id); if (!t) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(t, { offset: -70 }); else t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* ---------- HERO ROUTE CANVAS ---------- */
  var ports = {
    MNL: [121, 14.6, 'Manila'], CEB: [123.9, 10.3, 'Cebu'], DVO: [125.6, 7.1, 'Davao'], SIN: [103.8, 1.3, 'Singapore'],
    SHA: [121.5, 31.2, 'Shanghai'], HKG: [114.2, 22.3, 'Hong Kong'], TYO: [139.7, 35.7, 'Tokyo'], PUS: [129, 35.1, 'Busan'],
    DXB: [55.3, 25.3, 'Dubai'], BOM: [72.8, 19, 'Mumbai'], LAX: [198, 33, 'Los Angeles'], SYD: [151.2, -33.9, 'Sydney'], JKT: [106.8, -6.2, 'Jakarta']
  };
  var lanes = [['SHA', 'MNL'], ['MNL', 'LAX'], ['SIN', 'MNL'], ['HKG', 'CEB'], ['MNL', 'TYO'], ['DXB', 'MNL'], ['DXB', 'SIN'], ['BOM', 'SIN'], ['PUS', 'MNL'], ['CEB', 'TYO'], ['DVO', 'SYD'], ['TYO', 'LAX'], ['MNL', 'DVO'], ['JKT', 'CEB']];
  (function routes() {
    var cv = $('#routes'), ctx = cv.getContext('2d'), W, H, dpr, pts = {}, packets = [], grid = [];
    function proj(lon, lat) {
      var mob = W < 760;
      var x0 = mob ? W * -0.1 : Math.max(W * 0.5, 760), x1 = mob ? W * 1.02 : W * 0.93;
      var x = x0 + (lon - 50) / 160 * (x1 - x0);
      var y = H * 0.5 - (lat - 12) / 70 * H * 0.95;
      return [x, y];
    }
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      Object.keys(ports).forEach(function (k) { pts[k] = proj(ports[k][0], ports[k][1]); });
      grid = []; var s = W < 760 ? 26 : 30;
      for (var x = s / 2; x < W; x += s) for (var y = s / 2; y < H; y += s) grid.push([x, y, Math.random()]);
    }
    function ctrl(a, b) { var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, d = Math.hypot(b[0] - a[0], b[1] - a[1]); return [mx, my - d * 0.28]; }
    function qp(a, c, b, t) { var u = 1 - t; return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]; }
    lanes.forEach(function (l, i) { packets.push({ l: l, t: Math.random(), v: 0.0012 + Math.random() * 0.0016 }); if (i % 2) packets.push({ l: l, t: Math.random(), v: 0.001 + Math.random() * 0.0012 }); });
    var t0 = performance.now();
    function draw(now) {
      var time = (now - t0) / 1000;
      ctx.clearRect(0, 0, W, H);
      var mob = W < 760;
      ctx.globalAlpha = mob ? 0.5 : 1;
      for (var i = 0; i < grid.length; i++) { var g = grid[i]; ctx.fillStyle = 'rgba(124,196,238,' + (0.05 + 0.05 * Math.sin(time * 0.6 + g[2] * 6)) + ')'; ctx.fillRect(g[0], g[1], 1.4, 1.4); }
      lanes.forEach(function (l) {
        var a = pts[l[0]], b = pts[l[1]], c = ctrl(a, b);
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(c[0], c[1], b[0], b[1]);
        ctx.strokeStyle = 'rgba(41,148,209,.28)'; ctx.lineWidth = 1; ctx.stroke();
      });
      packets.forEach(function (p) {
        if (!reduce) p.t += p.v; if (p.t > 1) p.t = 0;
        var a = pts[p.l[0]], b = pts[p.l[1]], c = ctrl(a, b);
        for (var k = 0; k < 14; k++) {
          var tt = p.t - k * 0.008; if (tt < 0) break;
          var q = qp(a, c, b, tt);
          ctx.fillStyle = 'rgba(124,196,238,' + (0.9 - k * 0.065) + ')';
          ctx.beginPath(); ctx.arc(q[0], q[1], Math.max(0.6, 2.2 - k * 0.13), 0, 6.283); ctx.fill();
        }
      });
      Object.keys(pts).forEach(function (k, i) {
        var p = pts[k], pulse = (time * 0.5 + i * 0.13) % 1;
        ctx.strokeStyle = 'rgba(124,196,238,' + (0.5 * (1 - pulse)) + ')';
        ctx.beginPath(); ctx.arc(p[0], p[1], 3 + pulse * 14, 0, 6.283); ctx.stroke();
        ctx.fillStyle = k === 'MNL' || k === 'CEB' || k === 'DVO' ? '#3ddc84' : '#fff';
        ctx.beginPath(); ctx.arc(p[0], p[1], 3, 0, 6.283); ctx.fill();
        if (!mob) { ctx.fillStyle = 'rgba(196,212,234,.75)'; ctx.font = '500 11px Poppins, sans-serif'; ctx.fillText(ports[k][2], p[0] + 8, p[1] + 4); }
      });
      ctx.globalAlpha = 1;
      if (!reduce) requestAnimationFrame(draw);
    }
    size(); window.addEventListener('resize', size);
    requestAnimationFrame(draw);
  })();

  /* ---------- TICKER ---------- */
  (function ticker() {
    var ev = [['LSMNL2611024', 'Discharged at Manila South Harbor', 'on time'], ['176-55120934', 'Departed Mactan-Cebu (CEB)', 'on time'], ['LSDVO2611311', 'Customs cleared · BOC e2m', 'cleared'],
      ['LSSIN2611187', 'Loaded on vessel at Singapore', 'on time'], ['LSMNL2611090', 'Invoice sent to consignee', 'billed'], ['LSCEB2611042', 'Gate-in at Cebu Port', 'on time'],
      ['297-11834560', 'Arrived Tokyo Narita (NRT)', 'arrived'], ['LSMNL2611101', 'Delivered to warehouse, Laguna', 'delivered']];
    var h = ev.map(function (e) { return '<span><b>' + e[0] + '</b>' + e[1] + '<em>' + e[2] + '</em></span>'; }).join('');
    $('#tkRow').innerHTML = h + h;
  })();

  /* ---------- STAT COUNTERS ---------- */
  (function counters() {
    var els = $$('[data-count]');
    function run(el) {
      var to = +el.dataset.count, st = null;
      if (reduce) { el.textContent = to; return; }
      requestAnimationFrame(function step(t) { if (!st) st = t; var p = Math.min((t - st) / 1400, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); });
    }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } }); }, { threshold: 0.4 });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- PLATFORM PILLARS ---------- */
  var screens = [
    ['Operations · Job board', '<div class="wgrid"><div><small>Open jobs</small><b>148</b></div><div><small>Arriving this week</small><b>37</b></div><div><small>Needs documents</small><b>9</b></div></div>' +
      '<table class="wtable"><tr><th>Job</th><th>Lane</th><th>Mode</th><th>Status</th></tr>' +
      '<tr><td class="mono">IMP-24871</td><td>Shanghai → Manila</td><td>Sea FCL</td><td><span class="tag blue">At sea</span></td></tr>' +
      '<tr><td class="mono">EXP-24869</td><td>Cebu → Tokyo</td><td>Air</td><td><span class="tag ok">Departed</span></td></tr>' +
      '<tr><td class="mono">IMP-24866</td><td>Singapore → Davao</td><td>Sea LCL</td><td><span class="tag warn">Docs missing</span></td></tr>' +
      '<tr><td class="mono">IMP-24860</td><td>Busan → Manila</td><td>Sea FCL</td><td><span class="tag ok">Cleared</span></td></tr>' +
      '<tr><td class="mono">EXP-24857</td><td>Manila → Los Angeles</td><td>Sea FCL</td><td><span class="tag blue">Booked</span></td></tr></table>'],
    ['Financial Control · Profit by job', '<div class="wgrid"><div><small>Billed this month</small><b>₱8.4M</b></div><div><small>Collected</small><b>₱6.9M</b></div><div><small>Overdue</small><b>₱410K</b></div></div>' +
      '<div class="bars"><div><span>IMP-24871</span><i style="width:88%"></i><b>₱62K</b></div><div><span>EXP-24869</span><i style="width:64%"></i><b>₱45K</b></div><div><span>IMP-24860</span><i style="width:52%"></i><b>₱37K</b></div><div><span>EXP-24857</span><i style="width:41%"></i><b>₱29K</b></div><div><span>IMP-24866</span><i style="width:18%"></i><b>₱13K</b></div></div>'],
    ['Intelligence · AI assistant', '<div class="wgrid"><div><small>Documents read by AI today</small><b>212</b></div><div><small>Jobs created from documents</small><b>64</b></div><div><small>Typing saved</small><b>31 hrs</b></div></div>' +
      '<table class="wtable"><tr><th>Document</th><th>Read as</th><th>Result</th></tr><tr><td>Pre-alert_COSCO.pdf</td><td>Import job</td><td><span class="tag ok">Job created</span></td></tr><tr><td>Invoice_PortTrucking.pdf</td><td>Vendor bill</td><td><span class="tag ok">Bill booked</span></td></tr><tr><td>BL_ONE_88213.pdf</td><td>Bill of lading</td><td><span class="tag warn">Check consignee</span></td></tr></table>'],
    ['Integration · Connected partners', '<div class="flow"><span class="node">Shipping lines</span><span class="ln"></span><span class="node">Airlines</span><span class="ln"></span><span class="node hub">Logi-Sys</span><span class="ln"></span><span class="node">BOC e2m</span><span class="ln"></span><span class="node">WCA network</span><span class="ln"></span><span class="node">Banks</span><span class="ln"></span><span class="node">Customer portal</span></div>' +
      '<table class="wtable"><tr><th>Connection</th><th>Last sync</th><th>Status</th></tr><tr><td>Carrier schedules</td><td>2 min ago</td><td><span class="tag ok">Live</span></td></tr><tr><td>Customs manifest filing</td><td>14 min ago</td><td><span class="tag ok">Live</span></td></tr><tr><td>WIN for WCA members</td><td>1 hr ago</td><td><span class="tag ok">Live</span></td></tr></table>'],
    ['Governance · Access and audit', '<div class="wgrid"><div><small>Companies</small><b>3</b></div><div><small>Branches</small><b>7</b></div><div><small>Currencies</small><b>PHP · USD · SGD</b></div></div>' +
      '<table class="wtable"><tr><th>Who</th><th>What</th><th>When</th></tr><tr><td>Ops Manager, Cebu</td><td>Approved credit note CN-0412</td><td>09:42</td></tr><tr><td>Billing, Manila</td><td>Edited invoice INV-88213</td><td>09:15</td></tr><tr><td>Admin</td><td>Gave Davao staff read-only access</td><td>08:57</td></tr></table>']
  ];
  function showPillar(i) {
    $$('.pl').forEach(function (b, k) { b.classList.toggle('on', k === i); b.setAttribute('aria-selected', k === i); });
    $('#winTitle').textContent = screens[i][0];
    var body = $('#winBody'); body.innerHTML = '<div class="wfade">' + screens[i][1] + '</div>';
  }
  var pillarAuto = null, pIdx = 0;
  $$('.pl').forEach(function (b) { b.addEventListener('click', function () { clearInterval(pillarAuto); pIdx = +b.dataset.p; showPillar(pIdx); }); });
  showPillar(0);
  var pio = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      clearInterval(pillarAuto);
      if (e.isIntersecting && !reduce) pillarAuto = setInterval(function () { pIdx = (pIdx + 1) % 5; showPillar(pIdx); }, 4200);
    });
  }, { threshold: 0.3 });
  pio.observe($('.pillars'));

  /* ---------- AI TABS ---------- */
  $$('.at').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('.at').forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b); });
      $$('.ai-pane').forEach(function (p) { p.classList.toggle('on', p.id === 'pane-' + b.dataset.t); });
      if (b.dataset.t === 'brain') drawChart();
      if (hasGsap) ScrollTrigger.refresh();
    });
  });

  /* ---------- LogiLENS ---------- */
  var docs = [
    'PRE-ALERT / ARRIVAL NOTICE\nFrom: COSCO Shipping Lines (Shanghai)\n\nHB/L No: SHAMNL2611024\nMB/L No: COSU6382917450\nShipper: Ningbo Bright Home Appliances Co., Ltd.\nConsignee: Manila Bay Trading Corp., Pasay City\nNotify Party: Same as consignee\nPort of Loading: Shanghai, China\nPort of Discharge: Manila South Harbor, Philippines\nVessel / Voyage: COSCO HARMONY V.112E\nETD: 2026-11-18\nETA: 2026-11-27\nContainer: CSNU7712045 / 40HC\nContainer: TGHU8820317 / 40HC\nPackages: 1,240 cartons\nGross Weight: 18,450.00 KGS\nMeasurement: 128.6 CBM\nCommodity: Household electric fans and rice cookers\nIncoterm: FOB Shanghai\nFreight: Collect',
    'AIR WAYBILL\nAWB No: 176-55120934\nShipper: Visayan Dried Mango Exports Inc., Mandaue City, Cebu\nConsignee: Tokyo Fine Foods K.K., Minato-ku, Tokyo\nAirport of Departure: Mactan-Cebu International (CEB)\nAirport of Destination: Tokyo Narita (NRT)\nFlight: PR 434 / 2026-11-26\nPieces: 86\nGross Weight: 1,032 KG\nChargeable Weight: 1,105 KG\nVolume: 6.63 CBM\nNature of Goods: Dried mangoes, food grade, non-hazardous\nIncoterm: CIF Tokyo',
    'INVOICE\nVendor: Port Area Trucking Services, Inc.\nInvoice No: PATS-2026-11-0877\nInvoice Date: 2026-11-24\nBill To: Logi-Sys Demo Forwarders Phils.\nJob Ref: IMP-24871\nDescription: Trucking 2 x 40HC Manila South Harbor to Laguna warehouse\nAmount: 28,500.00\nCurrency: PHP\nVAT: 3,420.00\nTotal Due: 31,920.00\nDue Date: 2026-12-24'
  ];
  var F = [
    ['kind', 'Document type'],
    ['ref', 'BL / AWB / Invoice no.', /^(?:h\.?b\/?l|bill of lading|b\/l|awb|air ?waybill|invoice|hawb|mawb)\s*(?:no\.?|number|#)?\s*[:#-]\s*(.+)$/im],
    ['mbl', 'Master BL', /^(?:m\.?b\/?l|master b\/?l|mawb)\s*(?:no\.?|number|#)?\s*[:#-]\s*(.+)$/im],
    ['shipper', 'Shipper / Vendor', /^(?:shipper|exporter|vendor|supplier|seller)\s*[:-]\s*(.+)$/im],
    ['consignee', 'Consignee / Bill to', /^(?:consignee|importer|bill to|buyer)\s*[:-]\s*(.+)$/im],
    ['pol', 'Origin', /^(?:port of loading|pol|airport of departure|origin|from port)\s*[:-]\s*(.+)$/im],
    ['pod', 'Destination', /^(?:port of discharge|pod|airport of destination|destination|to port)\s*[:-]\s*(.+)$/im],
    ['carrier', 'Vessel / Flight', /^(?:vessel(?:\s*\/\s*voyage)?|flight|carrier)\s*[:-]\s*(.+)$/im],
    ['etd', 'ETD / Date', /^(?:etd|departure date|invoice date|date)\s*[:-]\s*(.+)$/im],
    ['eta', 'ETA / Due', /^(?:eta|arrival date|due date)\s*[:-]\s*(.+)$/im],
    ['units', 'Containers / Pieces'],
    ['weight', 'Gross weight', /^(?:gross weight|g\.?w\.?|weight)\s*[:-]\s*(.+)$/im],
    ['volume', 'Volume', /^(?:measurement|volume|cbm)\s*[:-]\s*(.+)$/im],
    ['goods', 'Goods / Description', /^(?:commodity|nature of goods|description(?: of goods)?|goods)\s*[:-]\s*(.+)$/im],
    ['terms', 'Incoterm', /^(?:incoterms?|terms)\s*[:-]\s*(.+)$/im],
    ['amount', 'Amount', /^(?:total due|total amount|grand total|amount)\s*[:-]\s*(.+)$/im],
    ['jobref', 'Linked job', /^(?:job ref|job no|reference)\s*[:-]\s*(.+)$/im]
  ];
  function extract(t) {
    var out = {};
    F.forEach(function (f) { if (f[2]) { var m = t.match(f[2]); if (m) out[f[0]] = m[1].trim(); } });
    var cn = t.match(/\b[A-Z]{4}\d{7}\b/g);
    var sizes = t.match(/\b(20|40)\s?(GP|HC|DV|RF|OT)\b/gi);
    if (cn) out.units = cn.length + ' container' + (cn.length > 1 ? 's' : '') + (sizes ? ' · ' + sizes[0].toUpperCase().replace(/\s/, '') : '') + ' (' + cn.join(', ') + ')';
    else { var pc = t.match(/^(?:pieces|packages|pcs|no\. of packages)\s*[:-]\s*(.+)$/im); if (pc) out.units = pc[1].trim(); }
    if (!out.weight) { var w = t.match(/([\d,]+(?:\.\d+)?)\s*(kgs?|kilos?)\b/i); if (w) out.weight = w[0]; }
    if (!out.volume) { var v = t.match(/([\d,]+(?:\.\d+)?)\s*cbm\b/i); if (v) out.volume = v[0]; }
    var cur = t.match(/^currency\s*[:-]\s*([A-Z]{3})/im);
    if (out.amount && cur) out.amount = cur[1] + ' ' + out.amount;
    if (/invoice/i.test(t) && /vendor|amount|total/i.test(t)) out.kind = 'Vendor invoice → purchase bill';
    else if (/awb|air ?waybill|flight/i.test(t)) out.kind = 'Air shipment → export job';
    else if (/pre-?alert|arrival|b\/?l|bill of lading/i.test(t)) out.kind = 'Sea shipment → import job';
    else if (Object.keys(out).length) out.kind = 'Freight document';
    return out;
  }
  var docText = $('#docText'), fieldsEl = $('#fields');
  function blankFields() {
    fieldsEl.innerHTML = F.map(function (f) { return '<div class="fld empty" data-k="' + f[0] + '"><small>' + f[1] + '</small><b>—</b></div>'; }).join('');
  }
  function loadDoc(i) { docText.value = docs[i]; blankFields(); $('#jobConf').textContent = ''; $('#jobKind').textContent = 'New freight job'; $('#jobNote').textContent = 'Press the button to turn the document into a ready job, with no typing.'; }
  $('#docPick').addEventListener('change', function (e) { loadDoc(+e.target.value); });
  loadDoc(0);
  var lensBusy = false;
  $('#lensRun').addEventListener('click', function () {
    if (lensBusy) return; lensBusy = true;
    var text = docText.value.trim(); blankFields();
    var sl = $('#scanline');
    var finish = function () {
      var data = extract(text), keys = F.map(function (f) { return f[0]; }).filter(function (k) { return data[k]; });
      var applicable = F.filter(function (f) { return data[f[0]]; }).length;
      keys.forEach(function (k, i) {
        setTimeout(function () {
          var el = fieldsEl.querySelector('[data-k="' + k + '"]');
          el.classList.remove('empty'); el.classList.add('hit'); el.querySelector('b').textContent = data[k];
        }, reduce ? 0 : i * 110);
      });
      setTimeout(function () {
        lensBusy = false;
        $$('.fld.empty', fieldsEl).forEach(function (el) { el.remove(); });
        if (!keys.length) { $('#jobNote').textContent = 'No shipment details found. Try a pre-alert, bill of lading, airway bill or invoice.'; return; }
        var isBill = /invoice/i.test(data.kind || '');
        $('#jobKind').textContent = isBill ? 'Purchase bill ready' : 'Freight job ready';
        $('#jobConf').textContent = applicable + ' fields captured';
        var mins = Math.max(4, Math.round(applicable * 0.9));
        $('#jobNote').textContent = (isBill ? 'Bill linked to job ' + (data.jobref || 'on file') + ' and queued for approval. ' : 'Job ' + (/air/i.test(data.kind || '') ? 'EXP' : 'IMP') + '-24' + (880 + Math.floor(Math.random() * 90)) + ' created and the client was sent a tracking link. ') + 'About ' + mins + ' minutes of typing saved on this one document.';
      }, reduce ? 0 : keys.length * 110 + 200);
    };
    if (hasGsap && !reduce) {
      gsap.fromTo(sl, { top: 44, autoAlpha: 1 }, { top: sl.parentNode.clientHeight - 70, duration: 1.1, ease: 'power1.inOut', onComplete: function () { gsap.to(sl, { autoAlpha: 0, duration: 0.2 }); finish(); } });
    } else finish();
  });

  /* ---------- LogiTRACK ---------- */
  var ships = {
    'LSMNL2611024': { title: 'Sea FCL · 2 × 40HC', sub: 'Manila Bay Trading Corp.', from: 'Shanghai, CN', to: 'Manila South Harbor', carrier: 'COSCO HARMONY V.112E', ref: 'HBL SHAMNL2611024', eta: 'Arrives 27 Nov, 06:00. On time. Customs entry is ready for BOC e2m filing.', a: [121.5, 31.2], b: [121, 14.6], progress: 0.82,
      m: [['Booking confirmed', '12 Nov', 1], ['Gate-in, Shanghai', '16 Nov', 1], ['Departed Shanghai', '18 Nov', 1], ['At sea, near Batanes', 'now', 2], ['Arrives Manila', '27 Nov', 0], ['Customs cleared', 'est. 28 Nov', 0], ['Delivered to warehouse, Laguna', 'est. 29 Nov', 0]] },
    '176-55120934': { title: 'Air export · 86 pcs, 1,032 kg', sub: 'Visayan Dried Mango Exports Inc.', from: 'Mactan-Cebu (CEB)', to: 'Tokyo Narita (NRT)', carrier: 'PR 434', ref: 'AWB 176-55120934', eta: 'Landed 26 Nov, 14:40. Ready for pick-up by the consignee.', a: [123.9, 10.3], b: [140.4, 35.8], progress: 1,
      m: [['Cargo received, Cebu', '25 Nov', 1], ['Export customs cleared', '25 Nov', 1], ['Departed CEB', '26 Nov', 1], ['Arrived NRT', '26 Nov', 1], ['Released to consignee', 'now', 2]] },
    'LSDVO2611311': { title: 'Sea LCL · 14 pallets', sub: 'Mindanao Agri Supply Co.', from: 'Singapore', to: 'Davao (Sasa Wharf)', carrier: 'KOTA NAGA V.0841N', ref: 'HBL SINDVO2611311', eta: 'Arrived. Customs cleared today. Delivery booked for tomorrow 9 AM.', a: [103.8, 1.3], b: [125.6, 7.1], progress: 1,
      m: [['Booking confirmed', '8 Nov', 1], ['Departed Singapore', '13 Nov', 1], ['Arrived Davao', '22 Nov', 1], ['Customs cleared (BOC e2m)', 'now', 2], ['Out for delivery', 'est. 27 Nov', 0]] }
  };
  function mapXY(p) { return [(p[0] - 95) / 55 * 600, 340 - (p[1] + 5) / 45 * 340]; }
  function track(no) {
    var s = ships[no.trim().toUpperCase()] || ships[no.trim()];
    var card = $('#trkCard'), map = $('#trkMap'), miles = $('#miles');
    if (!s) {
      card.innerHTML = '<h4>No shipment found</h4><p class="sub">Check the number and try again. In the live portal, your clients log in and see only their own shipments.</p>';
      map.innerHTML = ''; miles.innerHTML = ''; return;
    }
    card.innerHTML = '<h4>' + esc(s.title) + '</h4><p class="sub">' + esc(s.sub) + '</p><dl><div><dt>From</dt><dd>' + esc(s.from) + '</dd></div><div><dt>To</dt><dd>' + esc(s.to) + '</dd></div><div><dt>Carrier</dt><dd>' + esc(s.carrier) + '</dd></div><div><dt>Reference</dt><dd>' + esc(s.ref) + '</dd></div></dl><p class="eta">' + esc(s.eta) + '</p>';
    var a = mapXY(s.a), b = mapXY(s.b), c = [(a[0] + b[0]) / 2 + 40, (a[1] + b[1]) / 2 - 30];
    var dots = '';
    for (var x = 10; x < 600; x += 20) for (var y = 10; y < 340; y += 20) dots += '<circle cx="' + x + '" cy="' + y + '" r="1" fill="rgba(124,196,238,.18)"/>';
    var path = 'M' + a + ' Q' + c + ' ' + b;
    map.innerHTML = dots + '<path d="' + path + '" fill="none" stroke="rgba(124,196,238,.35)" stroke-width="2" stroke-dasharray="4 6"/>' +
      '<path id="trkLine" d="' + path + '" fill="none" stroke="#2994d1" stroke-width="3" stroke-linecap="round"/>' +
      '<circle cx="' + a[0] + '" cy="' + a[1] + '" r="6" fill="#fff"/><circle cx="' + b[0] + '" cy="' + b[1] + '" r="6" fill="#3ddc84"/>' +
      '<text x="' + (a[0] + 10) + '" y="' + (a[1] + 4) + '" fill="#c4d4ea" font-size="13" font-family="Poppins">' + esc(s.from) + '</text>' +
      '<text x="' + (b[0] > 420 ? b[0] - 12 : b[0] + 10) + '" y="' + (b[1] + 4) + '" text-anchor="' + (b[0] > 420 ? 'end' : 'start') + '" fill="#c4d4ea" font-size="13" font-family="Poppins">' + esc(s.to) + '</text><circle id="trkDot" r="8" fill="#3ddc84" stroke="#0a1830" stroke-width="3"/>';
    var line = $('#trkLine'), L = line.getTotalLength(), dot = $('#trkDot');
    line.style.strokeDasharray = L; line.style.strokeDashoffset = L;
    var st = null, dur = reduce ? 1 : 1400;
    requestAnimationFrame(function step(t) {
      if (!st) st = t; var p = Math.min((t - st) / dur, 1), e = 1 - Math.pow(1 - p, 3), at = e * s.progress;
      line.style.strokeDashoffset = L * (1 - at); var pt = line.getPointAtLength(L * at); dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y);
      if (p < 1) requestAnimationFrame(step);
    });
    miles.innerHTML = s.m.map(function (m) { return '<li class="' + (m[2] === 1 ? 'done' : m[2] === 2 ? 'now' : '') + '"><span>' + esc(m[0]) + '</span><time>' + esc(m[1]) + '</time></li>'; }).join('');
  }
  $('#trackForm').addEventListener('submit', function (e) { e.preventDefault(); track($('#trackNo').value); });
  $$('.try button').forEach(function (b) { b.addEventListener('click', function () { $('#trackNo').value = b.dataset.tn; track(b.dataset.tn); }); });
  track('LSMNL2611024');

  /* ---------- LogiBRAIN ---------- */
  var months = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
  var shipsN = [212, 168, 181, 204, 219, 233, 226, 241, 258, 249, 272, 291];
  var profit = [1.42, 1.08, 1.19, 1.37, 1.46, 1.55, 1.49, 1.63, 1.77, 1.69, 1.88, 2.04];
  $('#kpis').innerHTML = [['Shipments (Nov)', '291', '+7% vs Oct', 'up'], ['Gross profit (Nov)', '₱2.04M', '+8.5% vs Oct', 'up'], ['Avg. profit per job', '₱7,010', '+1.4%', 'up'], ['Unpaid over 60 days', '₱410K', '3 clients', 'down']]
    .map(function (k) { return '<div class="kpi"><small>' + k[0] + '</small><b>' + k[1] + '</b><em class="' + k[3] + '">' + k[2] + '</em></div>'; }).join('');
  $('#insights').innerHTML = ['Profit is up 8.5% this month. Most of it came from Shanghai → Manila sea imports.', 'Air exports from Cebu grew 3 months in a row. Worth a dedicated sales push.', 'Three clients owe ₱410K for more than 60 days. One of them is still booking new jobs.']
    .map(function (s) { return '<li>' + s + '</li>'; }).join('');
  var answers = {
    'Which lane makes the most money?': 'Shanghai → Manila sea imports: ₱612K profit in November from 64 jobs, about ₱9,560 per job. Singapore → Davao is next at ₱238K.',
    'Who pays late?': 'Three clients are past 60 days: a Pasig distributor (₱214K), a Cavite manufacturer (₱128K) and a Quezon City retailer (₱68K). The Pasig distributor still booked 4 jobs this month, so LogiBRAIN suggests holding new bookings until they pay.',
    'What will next month look like?': 'December usually dips after the holiday rush. LogiBRAIN expects about 245 to 265 shipments and ₱1.7M to ₱1.85M profit. Plan staff leave for the first two weeks of January, the slowest period last year.'
  };
  $$('#brainQs button').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('#brainQs button').forEach(function (x) { x.classList.toggle('on', x === b); });
      var a = $('#brainA'), txt = answers[b.textContent], i = 0;
      if (reduce) { a.textContent = txt; return; }
      a.textContent = ''; clearInterval(a._t);
      a._t = setInterval(function () { i += 3; a.textContent = txt.slice(0, i); if (i >= txt.length) clearInterval(a._t); }, 16);
    });
  });
  var chartDrawn = false;
  function drawChart() {
    if (chartDrawn) return; chartDrawn = true;
    var svg = $('#chart'), W = 640, H = 260, pl = 40, pb = 28, pt = 16, bw = (W - pl - 10) / 12;
    var maxS = 320, maxP = 2.4, h = '';
    [0, 100, 200, 300].forEach(function (v) { var y = H - pb - v / maxS * (H - pb - pt); h += '<line x1="' + pl + '" x2="' + W + '" y1="' + y + '" y2="' + y + '" stroke="#e7edf5"/><text x="' + (pl - 8) + '" y="' + (y + 4) + '" font-size="11" fill="#5d6b82" text-anchor="end">' + v + '</text>'; });
    shipsN.forEach(function (v, i) {
      var x = pl + i * bw + bw * 0.2, bh = v / maxS * (H - pb - pt);
      h += '<rect class="cbar" x="' + x + '" y="' + (H - pb - bh) + '" width="' + bw * 0.6 + '" height="' + bh + '" rx="3" fill="' + (i === 11 ? '#2994d1' : '#c9dcef') + '" style="transform-origin:' + x + 'px ' + (H - pb) + 'px;animation:cgrow .8s ' + (i * 0.04) + 's cubic-bezier(.2,.7,.2,1) both"><title>' + months[i] + ': ' + v + ' shipments</title></rect>';
      h += '<text x="' + (x + bw * 0.3) + '" y="' + (H - 8) + '" font-size="11" fill="#5d6b82" text-anchor="middle">' + months[i] + '</text>';
    });
    var d = profit.map(function (v, i) { return (i ? 'L' : 'M') + (pl + i * bw + bw / 2) + ' ' + (H - pb - v / maxP * (H - pb - pt)); }).join(' ');
    h += '<path d="' + d + '" fill="none" stroke="#194380" stroke-width="2.5" pathLength="1" style="stroke-dasharray:1;stroke-dashoffset:1;animation:cline 1.4s .3s ease forwards"/>';
    profit.forEach(function (v, i) { h += '<circle cx="' + (pl + i * bw + bw / 2) + '" cy="' + (H - pb - v / maxP * (H - pb - pt)) + '" r="3.5" fill="#194380"><title>' + months[i] + ': ₱' + v + 'M profit</title></circle>'; });
    h += '<g font-size="11" fill="#5d6b82"><rect x="' + (W - 230) + '" y="4" width="10" height="10" fill="#c9dcef"/><text x="' + (W - 215) + '" y="13">Shipments</text><line x1="' + (W - 140) + '" x2="' + (W - 124) + '" y1="9" y2="9" stroke="#194380" stroke-width="2.5"/><text x="' + (W - 118) + '" y="13">Profit (₱M)</text></g>';
    h += '<style>@keyframes cgrow{from{transform:scaleY(0)}}@keyframes cline{to{stroke-dashoffset:0}}</style>';
    svg.innerHTML = h;
  }

  /* ---------- PH MAP ---------- */
  (function phMap() {
    var hubs = [['Manila', 121, 14.6, 1], ['Clark', 120.55, 15.18, 0], ['Subic', 120.27, 14.8, 0], ['Batangas', 121.05, 13.75, 0], ['Laguna', 121.4, 14.25, 0], ['Iloilo', 122.56, 10.7, 0], ['Cebu', 123.9, 10.3, 1], ['Cagayan de Oro', 124.65, 8.48, 0], ['Davao', 125.6, 7.1, 1], ['General Santos', 125.17, 6.11, 0]];
    function xy(lon, lat) { return [(lon - 116.5) / 10.5 * 300, (20.5 - lat) / 16 * 420]; }
    var svg = $('#phMap'), h = '', d = '';
    for (var x = 6; x < 300; x += 12) for (var y = 6; y < 420; y += 12) h += '<circle cx="' + x + '" cy="' + y + '" r="1" fill="#d5dfeb"/>';
    [['LUZON', 119.2, 17.4], ['VISAYAS', 119.8, 11.6], ['MINDANAO', 121.2, 6.4]].forEach(function (r) { var p = xy(r[1], r[2]); h += '<text x="' + p[0] + '" y="' + p[1] + '" font-size="13" letter-spacing="3" font-weight="600" fill="#9fb3cc">' + r[0] + '</text>'; });
    var M = xy(121, 14.6), C = xy(123.9, 10.3), D = xy(125.6, 7.1);
    [[M, C], [C, D], [M, D]].forEach(function (pr, i) {
      var c = [(pr[0][0] + pr[1][0]) / 2 + 40, (pr[0][1] + pr[1][1]) / 2];
      d += '<path d="M' + pr[0] + ' Q' + c + ' ' + pr[1] + '" fill="none" stroke="#2994d1" stroke-width="1.6" stroke-dasharray="3 5"><animate attributeName="stroke-dashoffset" from="40" to="0" dur="' + (2 + i * 0.5) + 's" repeatCount="indefinite"/></path>';
    });
    h += d;
    hubs.forEach(function (hb) {
      var p = xy(hb[1], hb[2]);
      if (hb[3]) h += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="6" fill="none" stroke="#2994d1"><animate attributeName="r" values="6;18" dur="2.2s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0" dur="2.2s" repeatCount="indefinite"/></circle>';
      h += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (hb[3] ? 6 : 3.5) + '" fill="' + (hb[3] ? '#194380' : '#2994d1') + '"/>';
      if (hb[3]) h += '<text x="' + (p[0] > 240 ? p[0] - 11 : p[0] + 11) + '" text-anchor="' + (p[0] > 240 ? 'end' : 'start') + '" y="' + (p[1] + 4) + '" font-size="13" font-weight="600" fill="#0a1830">' + hb[0] + '</text>';
    });
    svg.innerHTML = h;
  })();

  /* ---------- ROI ---------- */
  function roi() {
    var s = +$('#r1').value, m = +$('#r2').value, r = +$('#r3').value, e = +$('#r4').value;
    ['#r1', '#r2', '#r3', '#r4'].forEach(function (id) { var el = $(id); el.style.setProperty('--v', ((el.value - el.min) / (el.max - el.min) * 100) + '%'); });
    $('#o1').textContent = s.toLocaleString(); $('#o2').textContent = m; $('#o3').textContent = '₱' + r; $('#o4').textContent = e;
    var hours = s * m / 60 * 0.5 + e * 0.5 * 1.5;
    $('#h').textContent = Math.round(hours).toLocaleString();
    $('#peso').textContent = peso(hours * r * 12);
    $('#fte').textContent = (hours / 160).toFixed(1);
  }
  ['#r1', '#r2', '#r3', '#r4'].forEach(function (id) { $(id).addEventListener('input', roi); });
  roi();

  /* ---------- MODULE FINDER ---------- */
  var MOD = {
    ff: ['Freight Forwarding', 'Sea, air and land jobs from booking to delivery'],
    inv: ['Invoicing', 'Bills straight from the job, no re-typing'],
    fa: ['Financial Accounting', 'Books, collections and profit per job in real time'],
    crm: ['Sales & CRM', 'Leads, quotes and follow-ups in one place'],
    cc: ['Customs Compliance', 'Manifest filing and customs entries, BOC e2m ready'],
    tms: ['Transportation Management', 'Trucks, drivers and deliveries'],
    wms: ['Warehouse Management', 'Stock, bins, receiving and release'],
    po: ['P O Management', 'Track purchase orders from supplier to shipment'],
    fs: ['Freight Station', 'CFS and container freight station operations'],
    lens: ['LogiLENS', 'AI reads pre-alerts and invoices and creates the job'],
    track: ['LogiTRACK', 'Your clients see live updates without calling you'],
    brain: ['LogiBRAIN', 'AI dashboards that explain your numbers'],
    conn: ['LogiCONNECT', 'Connect partners, carriers and systems']
  };
  var base = { forwarder: ['ff', 'inv', 'fa'], broker: ['cc', 'inv', 'fa'], nvocc: ['ff', 'fs', 'inv', 'fa'], warehouse: ['wms', 'fs', 'inv'], trucking: ['tms', 'inv', 'fa'] };
  var need = { docs: ['lens'], track: ['track'], billing: ['inv', 'fa'], customs: ['cc'], branches: ['fa', 'conn', 'brain'], sales: ['crm', 'brain'] };
  function finder() {
    var t = $('#fdType .on').dataset.v, list = base[t].slice();
    $$('#fdNeed .on').forEach(function (b) { need[b.dataset.v].forEach(function (k) { if (list.indexOf(k) < 0) list.push(k); }); });
    $('#fdList').innerHTML = list.map(function (k, i) { return '<li style="animation-delay:' + i * 0.05 + 's"><b>' + MOD[k][0] + '</b><span>' + MOD[k][1] + '</span></li>'; }).join('');
    $('#demoModules').value = list.map(function (k) { return MOD[k][0]; }).join(', ');
  }
  $$('#fdType button').forEach(function (b) { b.addEventListener('click', function () { $$('#fdType button').forEach(function (x) { x.classList.toggle('on', x === b); }); finder(); }); });
  $$('#fdNeed button').forEach(function (b) { b.addEventListener('click', function () { b.classList.toggle('on'); finder(); }); });
  finder();

  /* ---------- DEMO FORM ---------- */
  $('#demoForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, bad = [];
    ['name', 'company', 'city', 'email', 'phone'].forEach(function (n) { var i = f[n]; var ok = i.value.trim() && (n !== 'email' || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(i.value)); i.classList.toggle('err', !ok); if (!ok) bad.push(n); });
    var msg = $('#formMsg');
    if (bad.length) { msg.className = 'form-msg bad'; msg.textContent = 'Please complete the highlighted fields.'; f[bad[0]].focus(); return; }
    var body = 'Name: ' + f.name.value + '\nCompany: ' + f.company.value + '\nLocation: ' + f.city.value + '\nPosition: ' + f.position.value + '\nEmail: ' + f.email.value + '\nPhone: ' + f.phone.value + '\nModules: ' + f.modules.value;
    msg.className = 'form-msg ok'; msg.textContent = 'Thank you, ' + f.name.value.split(' ')[0] + '. Your email app will open so you can send the request.';
    window.location.href = 'mailto:business@softlinkglobal.com?subject=' + encodeURIComponent('Demo request: ' + f.company.value) + '&body=' + encodeURIComponent(body);
  });

  /* ---------- ASK LOGI (virtual assistant) ---------- */
  var KB = [
    { k: 'logi sys logisys platform erp overview software', a: 'Logi-Sys is an all-in-one cloud ERP for freight forwarders, customs brokers and consolidators. It runs freight operations, customs, warehouse, transport, billing, accounting and sales &amp; CRM in one system, with AI built in.' },
    { k: 'price pricing cost how much magkano presyo quote subscription license', a: 'Logi-Sys has a transparent pricing model: no hidden costs and no vendor lock-ins. The price depends on the modules and number of users you need, so the team gives you an exact quote after a short demo. <a href="#demo">Book a demo</a>.' },
    { k: 'boc customs e2m compliance compliant bureau philippines manifest', a: 'Yes. Logi-Sys is 100% compliant with BOC e2m requirements, and supports manifest filing in 20 countries including the Philippines, US, Canada, Japan and Singapore.' },
    { k: 'peza freeport bonded ecozone sez', a: 'Yes. It includes built-in features for PEZA, Freeport and bonded operations.' },
    { k: 'small startup sme company maliit business size', a: 'Definitely. The system scales to suit startups, SMEs and large enterprises alike.' },
    { k: 'install hardware server cloud internet browser device mobile phone', a: 'No installation needed. Logi-Sys is 100% cloud-based: no local servers, accessible from any office, port or device, with mobile access to approve, track and update jobs on the go.' },
    { k: 'support help local training implementation suporta', a: 'Local support is available in the Philippines, backed by over three decades of global logistics software expertise. Logi-Sys also runs implementation, FAQs and a certification program for your team.' },
    { k: 'ai artificial intelligence lens document read pre alert invoice ocr automation', a: 'LogiLENS uses AI to read logistics documents: it turns pre-alerts into import jobs, export documents into freight jobs, and vendor invoices into purchase bills. You can <a href="#ai">try it above</a>.' },
    { k: 'track tracking shipment client customer portal update status where', a: 'LogiTRACK gives your shippers 24/7 access to live shipment updates, milestones, documents, invoices and customs status, so they stop calling to ask. <a href="#ai">See the demo</a>.' },
    { k: 'brain analytics dashboard report kpi insight profit', a: 'LogiBRAIN is the AI analytics tool: KPI dashboards, predictive analytics and plain insights on profit, lanes and late payers.' },
    { k: 'warehouse wms inventory stock cfs freight station', a: 'Yes. Logi-Sys has Warehouse Management and a Freight Station module for CFS operations, connected to the same jobs and billing.' },
    { k: 'truck trucking transport tms delivery driver', a: 'The Transportation Management module handles trucks, drivers and deliveries, linked to each freight job.' },
    { k: 'accounting billing invoice finance collection tax', a: 'Invoicing and Financial Accounting are built in: bills come straight from the job, and you see collections and profit per job in real time.' },
    { k: 'branch branches multi company currency entities luzon visayas mindanao', a: 'Logi-Sys is multi-entity ready: run branches, companies and currencies together, and coordinate operations across Luzon, Visayas and Mindanao in one system.' },
    { k: 'wca network partner integration connect api', a: 'Logi-Sys connects partners, carriers and systems through LogiCONNECT, and offers WIN integration for WCA members.' },
    { k: 'security secure data access audit', a: 'It is secure by design, with role-based access and audit trails on every record.' },
    { k: 'demo book contact call schedule talk sales', a: 'You can <a href="#demo">book a free demo here</a>, chat on <a href="https://wa.link/8he6li" target="_blank" rel="noopener">WhatsApp</a>, or email business@softlinkglobal.com.' },
    { k: 'hello hi hey kumusta good morning', a: 'Hi! I can answer questions about Logi-Sys modules, customs compliance, AI tools, pricing and demos. What would you like to know?' }
  ];
  var STOP = /\b(the|a|an|is|are|do|does|can|i|you|we|my|our|it|of|to|for|and|or|in|on|with|po|ba|ang|ng|sa|na|yung|nyo|ninyo|kayo|ko|me)\b/g;
  function answer(q) {
    var words = q.toLowerCase().replace(/[^a-z0-9ñ\s-]/g, ' ').replace(STOP, ' ').split(/\s+/).filter(function (w) { return w.length > 1; });
    var best = null, bs = 0;
    KB.forEach(function (e) {
      var keys = e.k.split(' '), s = 0;
      words.forEach(function (w) { keys.forEach(function (k) { if (w === k) s += 2; else if (w.length > 3 && (k.indexOf(w) === 0 || w.indexOf(k) === 0)) s += 1; }); });
      if (s > bs) { bs = s; best = e; }
    });
    return bs >= 2 ? best.a : 'I don’t have that answer yet. The Logi-Sys team can help: <a href="#demo">book a demo</a> or chat on <a href="https://wa.link/8he6li" target="_blank" rel="noopener">WhatsApp</a>.';
  }
  var chat = $('#chat'), log = $('#chatLog'), fab = $('#chatFab');
  function say(html, who) { var d = document.createElement('div'); d.className = 'msg ' + who; d.innerHTML = html; log.appendChild(d); log.scrollTop = log.scrollHeight; return d; }
  function ask(q) {
    if (!q.trim()) return;
    say(esc(q), 'me');
    var t = say('Typing…', 'bot typing');
    setTimeout(function () { t.classList.remove('typing'); t.innerHTML = answer(q); log.scrollTop = log.scrollHeight; }, reduce ? 0 : 550);
  }
  var sugs = ['Is it BOC compliant?', 'How much is it?', 'Can AI read my documents?', 'Do I need servers?'];
  $('#chatSug').innerHTML = sugs.map(function (s) { return '<button>' + s + '</button>'; }).join('');
  $$('#chatSug button').forEach(function (b) { b.addEventListener('click', function () { ask(b.textContent); }); });
  var greeted = false;
  function openChat() {
    chat.hidden = false; fab.hidden = true;
    if (!greeted) { greeted = true; say('Hi, I’m Logi, the Logi-Sys virtual assistant. Ask me about modules, customs, AI tools or pricing.', 'bot'); }
    setTimeout(function () { $('#chatQ').focus(); }, 50);
  }
  $$('[data-open-chat]').forEach(function (b) { b.addEventListener('click', openChat); });
  $('#chatX').addEventListener('click', function () { chat.hidden = true; fab.hidden = false; fab.focus(); });
  $('#chatForm').addEventListener('submit', function (e) { e.preventDefault(); var i = $('#chatQ'); ask(i.value); i.value = ''; });
  log.addEventListener('click', function (e) { var a = e.target.closest('a[href^="#"]'); if (a) { chat.hidden = true; fab.hidden = false; } });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !chat.hidden) $('#chatX').click(); });
})();
