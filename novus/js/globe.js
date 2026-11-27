/* Hero globe: dotted Earth (Natural Earth land mask) with routes drawing out from Manila.
   Abstract backdrop: the routes are illustrative, not a list of Novus lanes. Pauses offscreen. */
(function () {
  'use strict';
  var cv = document.getElementById('globe'), L = window.NOVUS_LAND;
  if (!cv || !L || !cv.getContext) return;
  var ctx = cv.getContext('2d');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var D2R = Math.PI / 180;

  /* land dots -> unit vectors */
  var pts = [];
  L.rows.forEach(function (hex, r) {
    var lat = L.lat0 - L.step * (r + 0.5);
    for (var i = 0; i < hex.length; i++) {
      var n = parseInt(hex[i], 16);
      for (var b = 0; b < 4; b++) if (n & (8 >> b)) {
        var lon = L.lon0 + L.step * (i * 4 + b + 0.5);
        pts.push(v3(lat, lon));
      }
    }
  });
  function v3(lat, lon) { var la = lat * D2R, lo = lon * D2R; return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)]; }

  var HOME = [14.6, 121.0];
  var DEST = [[31.2, 121.5], [22.5, 114.1], [35.1, 129.0], [35.7, 139.7], [1.3, 103.8], [10.8, 106.7], [13.7, 100.5], [-33.9, 151.2], [25.2, 55.3], [51.9, 4.5], [33.7, -118.3], [10.3, 123.9], [7.1, 125.6], [-6.1, 106.8], [22.3, 70.0]];
  var home = v3(HOME[0], HOME[1]);
  function slerp(a, b, t) {
    var d = Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));
    if (d < 1e-4) return a.slice();
    var s = Math.sin(d), k1 = Math.sin((1 - t) * d) / s, k2 = Math.sin(t * d) / s;
    return [a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2];
  }
  var routes = DEST.map(function (d, i) {
    var b = v3(d[0], d[1]), dist = Math.acos(home[0] * b[0] + home[1] * b[1] + home[2] * b[2]);
    var N = 48, path = [];
    for (var k = 0; k <= N; k++) { var t = k / N, p = slerp(home, b, t), lift = 1 + Math.sin(Math.PI * t) * (0.05 + dist * 0.09); path.push([p[0] * lift, p[1] * lift, p[2] * lift]); }
    return { path: path, dur: 2.2 + dist * 1.4, delay: i * 0.55, period: 9 + (i % 4) * 1.3, ret: i % 3 === 1 };
  });

  var W = 0, H = 0, R = 0, cx = 0, cy = 0, dpr = 1, mobile = false;
  function size() {
    var r = cv.getBoundingClientRect();
    mobile = r.width < 760;
    dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.75);
    W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (mobile) { R = W * 0.92; cx = W * 0.56; cy = H * 1.02; }
    else { R = Math.min(H * 0.56, W * 0.33); cx = W * 0.74; cy = H * 0.58; }
  }

  var tilt = 0.12, mx = 0, my = 0, tmx = 0, tmy = 0;
  var introK = reduce ? 1 : 0;      // 0..1, set by motion.js during the hero reveal
  function proj(p, cosY, sinY, cosX, sinX) {
    var x = p[0] * cosY - p[2] * sinY, z = p[0] * sinY + p[2] * cosY, y = p[1];
    var y2 = y * cosX - z * sinX, z2 = y * sinX + z * cosX;
    return [cx + x * R, cy - y2 * R, z2];
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    mx += (tmx - mx) * 0.05; my += (tmy - my) * 0.05;
    // rest centred so Manila faces the viewer, gentle drift + pointer parallax
    var a = 121 * D2R + Math.sin(t * 0.00006) * 0.32 + mx * 0.18 - 2.4 * (1 - easeOut(introK));
    var cosY = Math.cos(a), sinY = Math.sin(a), tx = (mobile ? -0.42 : tilt) + my * 0.06, cosX = Math.cos(tx), sinX = Math.sin(tx);
    var gR = R * (0.92 + 0.08 * easeOut(introK));

    // atmosphere
    var g = ctx.createRadialGradient(cx, cy, gR * 0.86, cx, cy, gR * 1.25);
    g.addColorStop(0, 'rgba(37,99,235,0.28)'); g.addColorStop(0.4, 'rgba(37,99,235,0.10)'); g.addColorStop(1, 'rgba(37,99,235,0)');
    ctx.globalAlpha = introK; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, gR * 1.25, 0, 6.2832); ctx.fill();
    var s = ctx.createRadialGradient(cx - gR * 0.35, cy - gR * 0.4, gR * 0.1, cx, cy, gR);
    s.addColorStop(0, '#132a8a'); s.addColorStop(0.55, '#0a1460'); s.addColorStop(1, '#050838');
    ctx.fillStyle = s; ctx.beginPath(); ctx.arc(cx, cy, gR, 0, 6.2832); ctx.fill();
    ctx.strokeStyle = 'rgba(96,165,250,0.35)'; ctx.lineWidth = 1; ctx.stroke();

    // land dots
    var sc = gR / R, ds = mobile ? 1.5 : 1.9;
    for (var i = 0; i < pts.length; i++) {
      var p = proj(pts[i], cosY, sinY, cosX, sinX);
      if (p[2] < 0.02) continue;
      var x = cx + (p[0] - cx) * sc, y = cy + (p[1] - cy) * sc;
      ctx.globalAlpha = introK * (0.22 + p[2] * 0.78);
      ctx.fillStyle = p[2] > 0.55 ? '#d6e4ff' : '#8fb2f5';
      ctx.fillRect(x - ds / 2, y - ds / 2, ds, ds);
    }

    // routes
    var sec = t / 1000, hp = proj(home, cosY, sinY, cosX, sinX);
    ctx.lineCap = 'round';
    routes.forEach(function (r) {
      var local = ((sec - r.delay - 1.2) % r.period + r.period) % r.period;
      if (sec < r.delay + 1.2 && !reduce) return;
      var draw = reduce ? 1 : Math.min(1, local / r.dur), fade = reduce ? 1 : (local < r.period - 1.4 ? 1 : Math.max(0, (r.period - local) / 1.4));
      var n = Math.max(1, Math.round(draw * (r.path.length - 1)));
      ctx.lineWidth = mobile ? 1.3 : 1.8;
      var prev = null;
      for (var k = 0; k <= n; k++) {
        var q = proj(r.path[k], cosY, sinY, cosX, sinX), X = cx + (q[0] - cx) * sc, Y = cy + (q[1] - cy) * sc;
        if (prev && q[2] > -0.08 && prev[2] > -0.08) {
          ctx.globalAlpha = introK * fade * (0.25 + 0.6 * (k / n));
          ctx.strokeStyle = '#7cb6ff'; ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(X, Y); ctx.stroke();
        }
        prev = [X, Y, q[2]];
      }
      if (prev && prev[2] > -0.08) {
        // vessel head while drawing, landing ring when done
        ctx.globalAlpha = introK * fade;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(prev[0], prev[1], draw < 1 ? 2.4 : 2, 0, 6.2832); ctx.fill();
        if (draw >= 1) { var pr = reduce ? 0.5 : Math.max(0, ((local - r.dur) % 1.6) / 1.6); ctx.strokeStyle = 'rgba(96,165,250,' + (1 - pr) * 0.8 + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(prev[0], prev[1], 2 + pr * 9, 0, 6.2832); ctx.stroke(); }
        else { var hg = ctx.createRadialGradient(prev[0], prev[1], 0, prev[0], prev[1], 10); hg.addColorStop(0, 'rgba(147,197,253,.7)'); hg.addColorStop(1, 'rgba(147,197,253,0)'); ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(prev[0], prev[1], 10, 0, 6.2832); ctx.fill(); }
      }
    });

    // Manila
    var hx = cx + (hp[0] - cx) * sc, hy = cy + (hp[1] - cy) * sc;
    if (hp[2] > 0) {
      var pulse = reduce ? 0.4 : (sec % 2.4) / 2.4;
      ctx.globalAlpha = introK * (1 - pulse); ctx.strokeStyle = '#60a5fa'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(hx, hy, 5 + pulse * 22, 0, 6.2832); ctx.stroke();
      ctx.globalAlpha = introK; ctx.fillStyle = '#2563eb'; ctx.beginPath(); ctx.arc(hx, hy, 5, 0, 6.2832); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(hx, hy, 2.2, 0, 6.2832); ctx.fill();
      if (!mobile) { ctx.font = '600 11px "JetBrains Mono", monospace'; ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillText('MANILA', hx + 12, hy + 4); }
    }
    ctx.globalAlpha = 1;
  }
  function easeOut(k) { return 1 - Math.pow(1 - k, 3); }

  var visible = true, raf = 0;
  function loop(t) { raf = 0; if (!visible || document.hidden) return; draw(t); raf = requestAnimationFrame(loop); }
  function kick() { if (!raf && visible && !document.hidden && !reduce) raf = requestAnimationFrame(loop); }
  size();
  window.addEventListener('resize', function () { size(); if (reduce) draw(0); });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; kick(); }).observe(cv);
  document.addEventListener('visibilitychange', kick);
  if (!mobile) window.addEventListener('pointermove', function (e) { tmx = (e.clientX / innerWidth - 0.5) * 2; tmy = (e.clientY / innerHeight - 0.5) * 2; }, { passive: true });
  if (reduce) draw(0); else kick();

  window.NovusGlobe = {
    intro: function (dur) {
      if (reduce) return;
      var t0 = performance.now(); dur = dur || 2200;
      (function st(now) { introK = Math.min(1, (now - t0) / dur); if (introK < 1) requestAnimationFrame(st); })(t0);
    },
    show: function () { introK = 1; }
  };
  // safety: if motion.js never runs the intro, show the globe anyway
  setTimeout(function () { if (introK === 0) window.NovusGlobe.intro(1200); }, 6500);
})();
