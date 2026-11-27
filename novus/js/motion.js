/* Novus demo · motion layer (GSAP + ScrollTrigger + SplitText + Lenis, all self-hosted)
   Every animation is optional: without GSAP or with reduced motion, everything is simply shown. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var G = window.gsap, ST = window.ScrollTrigger, Split = window.SplitText;
  var page = document.body.getAttribute('data-page') || '';
  var loader = $('#loader');
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;

  function killLoader() { if (loader && loader.parentNode) loader.parentNode.removeChild(loader); loader = null; }
  function showAll() {
    killLoader();
    if (window.NovusGlobe) window.NovusGlobe.show();
    $$('.flow-step').forEach(function (s) { s.classList.add('lit'); });
  }

  /* ---------- nav: hide on scroll down, progress line ---------- */
  var nav = $('.nav'), bar = $('.nav-progress i'), lastY = window.scrollY;
  function navTick(y) {
    if (!nav) return;
    var open = $('.mnav.open');
    if (!open && y > innerHeight * 0.6 && y > lastY + 4) nav.classList.add('nav-hide');
    else if (y < lastY - 4 || y < 80) nav.classList.remove('nav-hide');
    lastY = y;
    if (page === 'overview' && !open) {
      var el = document.elementFromPoint(innerWidth / 2, nav.getBoundingClientRect().bottom + 6);
      nav.classList.toggle('on-dark', !!(el && el.closest && el.closest('.s-hero,.marquee,.s-services,.s-acc .acc,.s-contact .band')));
    }
    if (bar) { var h = document.documentElement.scrollHeight - innerHeight; bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0) + ')'; }
  }
  window.addEventListener('scroll', function () { navTick(window.scrollY); }, { passive: true });

  if (!G || reduce) { showAll(); return; }

  if (ST) G.registerPlugin(ST);
  if (Split) G.registerPlugin(Split);

  /* ---------- Lenis smooth scroll (marketing pages only; app pages keep native scroll) ---------- */
  var lenis = null;
  if (window.Lenis && /overview|track|quote/.test(page)) {
    lenis = new window.Lenis({
      duration: 1.1, smoothWheel: true,
      prevent: function (node) { return !!(node && node.closest && node.closest('.chat-log,.panel,.mnav,.engine-pop,pre,.tbl-wrap,[data-lenis-prevent]')); }
    });
    if (ST) lenis.on('scroll', ST.update);
    G.ticker.add(function (t) { lenis.raf(t * 1000); });
    G.ticker.lagSmoothing(0);
    window.NovusLenis = lenis;
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href'); if (id.length < 2) return;
        var t = $(id); if (!t) return;
        e.preventDefault(); lenis.scrollTo(t, { offset: -60, duration: 1.4 });
      });
    });
    // stop smooth scroll while the mobile menu or AI panel is open
    var mo = new MutationObserver(function () { var o = $('.mnav.open') || ($('.panel') && !$('.panel').hidden && innerWidth < 640); o ? lenis.stop() : lenis.start(); });
    $$('.mnav, .panel').forEach(function (el) { mo.observe(el, { attributes: true, attributeFilter: ['class', 'hidden'] }); });
  }

  /* ---------- helpers ---------- */
  function lines(el, opts) {
    // masked line reveal; reverts the split afterwards so nothing is left wrapped
    opts = opts || {};
    if (!Split) return G.fromTo(el, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, ease: 'power3.out', delay: opts.delay || 0, scrollTrigger: opts.st });
    var sp = Split.create(el, { type: 'lines', mask: 'lines', linesClass: 'ln' });
    return G.fromTo(sp.lines, { yPercent: 115 }, {
      yPercent: 0, duration: opts.dur || 1.15, ease: 'expo.out', stagger: 0.09, delay: opts.delay || 0,
      scrollTrigger: opts.st, onComplete: function () { sp.revert(); }
    });
  }
  function fade(el, delay, st) {
    return G.fromTo(el, { y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.95, ease: 'power3.out', delay: delay || 0, scrollTrigger: st, clearProps: 'transform' });
  }
  function onView(el) { return ST ? { trigger: el, start: 'top 86%', once: true } : undefined; }

  /* ---------- magnetic buttons ---------- */
  if (fine) $$('.magnetic').forEach(function (b) {
    var inner = b.querySelector('span') || b;
    b.addEventListener('pointermove', function (e) {
      var r = b.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      G.to(b, { x: dx * 0.22, y: dy * 0.32, duration: 0.5, ease: 'power3.out' });
      G.to(inner, { x: dx * 0.1, y: dy * 0.12, duration: 0.5, ease: 'power3.out' });
    });
    b.addEventListener('pointerleave', function () { G.to([b, inner], { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1,0.4)' }); });
  });

  /* =====================================================================
     HOME
     ===================================================================== */
  if (page === 'overview') {
    var heroLines = $$('.s-hero .m-lines'), heroFades = $$('.s-hero .m-fade');
    G.set(heroFades, { autoAlpha: 0, y: 24 });
    var seen = false; try { seen = sessionStorage.getItem('novus.loader') === '1'; } catch (e) { }
    var started = false;
    var startHero = function () {
      if (started) return; started = true;
      try { sessionStorage.setItem('novus.loader', '1'); } catch (e) { }
      var tl = G.timeline();
      if (loader) {
        tl.to('.loader-in', { y: -30, autoAlpha: 0, duration: 0.5, ease: 'power2.in' })
          .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'expo.inOut', onComplete: killLoader }, '-=0.1');
      }
      tl.add(function () { if (window.NovusGlobe) window.NovusGlobe.intro(2600); }, loader ? '-=0.6' : 0);
      heroLines.forEach(function (el) { tl.add(lines(el, { dur: 1.3 }), loader ? '-=0.55' : 0.05); });
      tl.to(heroFades, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.09, clearProps: 'transform' }, '-=0.95');
      tl.add(countUps, '-=0.6');
    };
    if (loader && !seen) {
      var t0 = performance.now(), minT = 1500;
      var go = function () { setTimeout(startHero, Math.max(0, minT - (performance.now() - t0))); };
      if (document.readyState === 'complete') go(); else window.addEventListener('load', go);
      setTimeout(startHero, 6000); // safety: never wait more than 6s
    } else { killLoader(); startHero(); }

    function countUps() {
      $$('.count').forEach(function (el) {
        var to = +el.dataset.to, from = +(el.dataset.from || 0), o = { v: from };
        G.fromTo(o, { v: from }, { v: to, duration: 1.8, ease: 'power3.out', onUpdate: function () { el.textContent = Math.round(o.v); } });
      });
    }

    /* scroll reveals outside the hero */
    $$('.m-lines').forEach(function (el) { if (!el.closest('.s-hero')) lines(el, { st: onView(el) }); });
    $$('.m-fade').forEach(function (el) { if (!el.closest('.s-hero')) fade(el, 0, onView(el)); });
    $$('.m-rise').forEach(function (el) {
      G.fromTo(el, { y: 70, scale: 0.96, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 1.3, ease: 'expo.out', scrollTrigger: onView(el), clearProps: 'transform' });
    });

    /* hero parallax: copy drifts up, globe sinks as you leave */
    if (ST) {
      G.to('.s-hero-in', { yPercent: -18, ease: 'none', scrollTrigger: { trigger: '.s-hero', start: 'top top', end: 'bottom top', scrub: true } });
      G.to('#globe', { yPercent: 14, scale: 1.06, ease: 'none', scrollTrigger: { trigger: '.s-hero', start: 'top top', end: 'bottom top', scrub: true } });
    }

    /* velocity marquee */
    var mq = $('#marquee');
    if (mq) {
      mq.innerHTML += mq.innerHTML; // seamless loop
      $$('span', mq).forEach(function (s, i) { if (i >= mq.children.length / 2) s.setAttribute('aria-hidden', 'true'); });
      var mqT = G.to(mq, { xPercent: -50, ease: 'none', duration: 46, repeat: -1 });
      if (ST) ST.create({
        onUpdate: function (s) {
          var v = s.getVelocity(), dir = v < 0 ? -1 : 1;
          G.to(mqT, { timeScale: dir * (1 + Math.min(Math.abs(v) / 300, 6)), duration: 0.2, overwrite: true });
          G.to(mqT, { timeScale: dir, duration: 1.2, delay: 0.25, overwrite: false });
        }
      });
    }

    /* statement: words fill in as you scroll */
    var stmt = $('#statement');
    if (stmt && Split && ST) {
      var ws = Split.create(stmt, { type: 'words', wordsClass: 'w' });
      G.fromTo(ws.words, { opacity: 0.14 }, { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: stmt, start: 'top 80%', end: 'bottom 50%', scrub: 0.6 } });
    }

    /* services: pinned horizontal scroll on desktop, plain stack on phones */
    var mm = G.matchMedia();
    mm.add('(min-width: 1024px) and (min-height: 700px)', function () {
      var pin = $('#hsPin'), track = $('#svcGrid'), rail = $('#hsRail'), ship = $('#hsShip');
      if (!pin || !track || !ST) return;
      var dist = function () { return Math.max(0, track.scrollWidth - track.parentNode.clientWidth); };
      var tw = G.to(track, {
        x: function () { return -dist(); }, ease: 'none',
        scrollTrigger: {
          trigger: pin, pin: true, start: 'top top', end: function () { return '+=' + dist(); }, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: function (s) { if (rail) rail.style.transform = 'scaleX(' + s.progress + ')'; if (ship) ship.style.left = (s.progress * 100) + '%'; }
        }
      });
      $$('.svc', track).forEach(function (c) {
        G.fromTo(c.querySelector('.svc-ic'), { rotate: -12, scale: 0.7 }, { rotate: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: c, containerAnimation: tw, start: 'left 95%', end: 'left 55%', scrub: true } });
      });
      return function () { G.set(track, { clearProps: 'transform' }); };
    });
    mm.add('(max-width: 1023px), (max-height: 699px)', function () {
      $$('#svcGrid .svc').forEach(function (c) { fade(c, 0, onView(c)); });
    });

    /* flow: route line fills with scroll, steps light up as it passes */
    var flow = $('#flow'), rail2 = $('#flowRail'), steps = $$('.flow-step');
    if (flow && ST) ST.create({
      trigger: flow, start: 'top 78%', end: 'bottom 45%', scrub: 0.5,
      onUpdate: function (s) {
        var p = s.progress;
        if (rail2) rail2.style.transform = (innerWidth > 640 ? 'scaleX(' : 'scaleY(') + p + ')';
        steps.forEach(function (st, i) { st.classList.toggle('lit', p >= (i + 0.35) / steps.length || p > 0.98); });
      }
    });
    steps.forEach(function (st, i) { G.fromTo(st, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', delay: i * 0.07, scrollTrigger: onView(flow), clearProps: 'transform' }); });

    /* history rail */
    var hr = $('#histRail');
    if (hr && ST) G.fromTo(hr, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '#histList', start: 'top 75%', end: 'bottom 55%', scrub: 0.5 } });
    $$('#histList li').forEach(function (li) { fade(li, 0, onView(li)); });
    $$('#valsGrid .val').forEach(function (v, i) { fade(v, i * 0.08, onView($('#valsGrid'))); });

    /* accreditation band opens like a container door */
    var acc = $('.s-acc .acc');
    if (acc && ST) G.fromTo(acc, { clipPath: 'inset(12% 6% 12% 6% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', ease: 'none', scrollTrigger: { trigger: acc, start: 'top 95%', end: 'top 40%', scrub: 0.6 } });
    $$('.acc-list li').forEach(function (li, i) { G.fromTo(li, { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, delay: i * 0.05, ease: 'power3.out', scrollTrigger: onView($('#accGrid')), clearProps: 'transform' }); });
    $$('#faqList .faq-i').forEach(function (f, i) { G.fromTo(f, { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, delay: (i % 6) * 0.05, ease: 'power3.out', scrollTrigger: onView(f), clearProps: 'transform' }); });
    var band = $('.s-contact .band');
    if (band && ST) G.fromTo(band, { scale: 0.94 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: band, start: 'top 95%', end: 'top 50%', scrub: 0.6 } });

    if (ST) { window.addEventListener('load', function () { ST.refresh(); }); setTimeout(function () { ST.refresh(); }, 1600); }
  }

  /* =====================================================================
     INNER PAGES: entrance + live-feel details
     ===================================================================== */
  function enter(list, opt) {
    opt = opt || {};
    list = list.filter(function (el) { return el && !el.classList.contains('reveal'); });
    if (!list.length) return;
    G.fromTo(list, { y: opt.y == null ? 28 : opt.y, x: opt.x || 0, autoAlpha: 0 }, { y: 0, x: 0, autoAlpha: 1, duration: opt.dur || 0.85, ease: 'power3.out', stagger: opt.stagger || 0.07, delay: opt.delay || 0.05, clearProps: 'transform,opacity,visibility' });
  }
  if (page === 'ask') {
    var h1 = $('.ask-side h1'); if (h1) lines(h1, { delay: 0.05 });
    enter([$('.ask-side .eyebrow'), $('.ask-side h1 + p')]);
    enter($$('.ask-side .card'), { delay: 0.25 });
    enter($$('.ask-side .try button'), { y: 12, stagger: 0.035, delay: 0.4, dur: 0.6 });
    enter([$('.ask-main')], { y: 40, delay: 0.15, dur: 1.1 });
  }
  if (page === 'track' || page === 'quote') {
    var th = $('main .h1'); if (th) lines(th, { delay: 0.05 });
    enter($$('main .eyebrow, main .h1 ~ .lead, .track-form, .samples').filter(function (e) { return !e.closest('.reveal'); }), { delay: 0.2 });
    if (page === 'quote') enter($$('.q-grid > *'), { delay: 0.35, y: 40, stagger: 0.12, dur: 1 });
  }
  if (page === 'dashboard' || page === 'visibility') {
    enter($$('.side nav a'), { x: -14, y: 0, stagger: 0.04, delay: 0.1, dur: 0.6 });
    var top = $('.main .top h1'); if (top) lines(top, { delay: 0.05 });
    var bm = $('.briefing .b-main, #vMain');
    enter([$('.main .top p'), $('.main .top .ctrls')].filter(Boolean), { delay: 0.15 });
    enter([$('.briefing')], { delay: 0.12, y: 24, dur: 1 });
    if (bm && bm.textContent.trim()) lines(bm, { delay: 0.45, dur: 1 });
    var rest = $$('.main > section').filter(function (s) { return !s.classList.contains('briefing'); });
    rest.forEach(function (s, i) {
      var kids = s.classList.contains('card') ? [s] : $$(':scope > *', s);
      if (i < 2) enter(kids, { delay: 0.35 + i * 0.12, y: 34 });
      else kids.forEach(function (k) { G.fromTo(k, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: ST ? { trigger: k, start: 'top 92%', once: true } : undefined, clearProps: 'transform,opacity,visibility' }); });
    });
  }

  /* safety net: anything still hidden after 7s (and on screen) is shown */
  setTimeout(function () {
    $$('.m-fade, .m-lines, .m-rise, .svc, .val, .flow-step, .acc-list li, .faq-i, main section, main .card, .ask-main, .ask-side > *, .side nav a').forEach(function (el) {
      var cs = getComputedStyle(el);
      if ((cs.visibility === 'hidden' || +cs.opacity < 0.05) && el.getBoundingClientRect().top < innerHeight) G.set(el, { autoAlpha: 1, y: 0, x: 0 });
    });
    killLoader();
  }, 7000);
})();
