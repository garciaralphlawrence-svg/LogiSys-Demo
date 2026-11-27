/* Novus demo · shared UI: ribbon, nav, reveal, Novus AI chat + cards, launcher */
(function () {
  'use strict';
  var N = window.NOVUS, T = window.NovusT, AI = window.NovusAI, esc = T.esc;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var page = document.body.getAttribute('data-page') || '';

  var ICON = {
    spark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path style="fill:var(--accent)" d="M12 2.5l2.1 6.4 6.4 2.1-6.4 2.1L12 19.5l-2.1-6.4L3.5 11l6.4-2.1z"/><path style="fill:#fff" d="M19 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5"/></svg>',
    send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
  };
  window.NovusIcons = ICON;

  /* ---------- ribbon ---------- */
  if (!$('.ribbon')) {
    var rb = document.createElement('div');
    rb.className = 'ribbon'; rb.setAttribute('role', 'note');
    rb.innerHTML = N.meta.sample
      ? '<b>Demo</b><span>· shipments, rates &amp; dashboard numbers are sample data</span><span class="long">· company facts from nfiph.com · built by Likha Studio on <i>Logi-Sys</i></span>'
      : '<b>Demo</b><span class="long">· built by Likha Studio on <i>Logi-Sys</i></span>';
    document.body.insertBefore(rb, document.body.firstChild);
  }

  /* ---------- nav ---------- */
  var nav = $('.nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 10); if (nav.dataset.dark) nav.classList.toggle('on-dark', window.scrollY < (window.innerHeight * 0.7)); };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    var burger = $('.burger'), mnav = $('.mnav');
    if (burger && mnav) {
      burger.addEventListener('click', function () { var o = !mnav.classList.contains('open'); mnav.classList.toggle('open', o); burger.setAttribute('aria-expanded', o); document.body.style.overflow = o ? 'hidden' : ''; nav.classList.toggle('on-dark', o || (nav.dataset.dark && window.scrollY < innerHeight * 0.7)); });
      $$('a', mnav).forEach(function (a) { a.addEventListener('click', function () { mnav.classList.remove('open'); burger.setAttribute('aria-expanded', false); document.body.style.overflow = ''; }); });
    }
  }

  /* ---------- reveal ---------- */
  var rv = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add('in'); });

  /* ---------- data bindings ---------- */
  $$('[data-kb]').forEach(function (el) {
    var v = el.getAttribute('data-kb').split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, N);
    if (v != null) el.textContent = v;
  });
  $$('[data-kb-href]').forEach(function (el) {
    var k = el.getAttribute('data-kb-href'), v = k.split('.').reduce(function (o, kk) { return o == null ? o : o[kk]; }, N);
    if (v) el.href = (k.indexOf('email') > -1 ? 'mailto:' : 'tel:') + (k.indexOf('email') > -1 ? v : String(v).replace(/[^+\d]/g, ''));
  });

  /* ---------- question log (feeds the dashboard "what clients asked") ---------- */
  function logQ(q, r) {
    try {
      var a = JSON.parse(localStorage.getItem('novus.asked.v1') || '[]');
      a.push({ q: q.slice(0, 140), intent: r.intent, gap: !!r.gap, src: r.source, t: Date.now() });
      localStorage.setItem('novus.asked.v1', JSON.stringify(a.slice(-60)));
    } catch (e) { /* storage blocked: fine */ }
  }

  /* ---------- helpers ---------- */
  function svcById(id) { for (var i = 0; i < N.services.length; i++) if (N.services[i].id === id) return N.services[i]; return null; }
  function quoteUrl(p) {
    var q = [];
    Object.keys(p || {}).forEach(function (k) { if (p[k] !== '' && p[k] != null) q.push(encodeURIComponent(k) + '=' + encodeURIComponent(p[k])); });
    return 'quote.html' + (q.length ? '?' + q.join('&') : '');
  }
  var STAGES = ['Booked', 'In transit', 'Arrived', 'Customs', 'Released', 'Delivered'];
  function stageState(sh) {
    // returns per-stage: done / now / next
    var seen = {}, cur = null;
    sh.events.forEach(function (e) { if (e[3] === 'done') seen[e[0]] = 'done'; if (e[3] === 'now') cur = e[0]; });
    return STAGES.map(function (s) {
      if (cur === s) return 'now';
      if (seen[s] && cur !== s) {
        // a stage is done only if a later stage has started
        return 'done';
      }
      return 'next';
    }).map(function (st, i, arr) {
      if (st === 'next' && arr.slice(i + 1).some(function (x) { return x === 'done' || x === 'now'; })) return 'skip';
      return st;
    });
  }
  window.NovusUtil = { svcById: svcById, quoteUrl: quoteUrl, STAGES: STAGES, stageState: stageState };

  /* ---------- answer cards ---------- */
  function card(c, ctx) {
    var h = '';
    switch (c.type) {
      case 'service': {
        var s = c.svc, ln = c.line;
        h = '<div class="acard">' +
          '<div class="verdict yes">' + ICON.check + '<div>Yes, Novus handles this<small>' + esc(ln ? ln.label : s.name) + ' · from Novus’s service list</small></div></div>' +
          '<div class="acard-h"><span class="svc-ic-sm">' + (T.ICONS[s.group] || T.ICONS.Global) + '</span><h4>' + esc(s.name) + '</h4></div>' +
          '<div class="acard-b"><ul class="lines">' + s.lines.map(function (l) { return '<li class="' + (ln && ln.id === l.id ? 'hit' : '') + '">' + ICON.check + '<span>' + esc(l.label) + '</span></li>'; }).join('') + '</ul></div>' +
          '<div class="acard-f">' + (s.id !== 'trucking' ? '<button class="btn sm ghost" data-q="What documents do I need for ' + esc(ln ? ln.label.replace(/\s*\(.*\)/, '') : s.short) + '?">Documents</button>' : '') +
          '<a class="btn sm" href="' + quoteUrl({ svc: s.id, line: ln ? ln.id : '', dest: AI.ctx.lastDest ? AI.ctx.lastDest.name : '' }) + '">Get a quote</a></div></div>';
        break;
      }
      case 'verdict':
        h = '<div class="acard"><div class="verdict notlisted">' + ICON.x + '<div>Not on Novus’s service list<small>' + esc(c.title) + ' · ask the team to confirm</small></div></div></div>';
        break;
      case 'route': {
        var d = c.dest, dom = d.region === 'domestic' || d.region === 'domesticland';
        h = '<div class="acard"><div class="acard-h"><h4>Route</h4><span class="pill warn">Demo estimate</span></div><div class="acard-b"><div class="route">' +
          '<div><small>From</small><b>Manila</b><small>Philippines</small></div>' +
          '<svg viewBox="0 0 200 36" aria-hidden="true"><path d="M6 28 Q100 -6 194 28"/><path class="go" d="M6 28 Q100 -6 194 28"/><circle cx="6" cy="28" r="4"/><circle class="end" cx="194" cy="28" r="4"/></svg>' +
          '<div class="r2"><small>To</small><b>' + esc(d.name) + '</b><small>' + (dom ? 'Domestic' : 'International') + '</small></div></div>' +
          '<dl class="kv"><dt>Service</dt><dd>' + (dom ? 'Domestic / Local Freight Forwarding' : 'International Freight Forwarding') + '</dd>' +
          (c.time ? '<dt>Typical transit</dt><dd>' + esc(c.time) + ' by ' + c.mode + ' (demo, not Novus data)</dd>' : '') +
          '</dl></div></div>';
        break;
      }
      case 'estimate': {
        var e = c.est;
        h = '<div class="acard"><div class="acard-h"><h4>Demo ballpark</h4><span class="pill warn">Not Novus’s rates</span></div>' +
          '<div class="acard-b"><div class="est-big">' + AI.peso(e.range[0]) + ' – ' + AI.peso(e.range[1]) + '</div>' +
          '<p style="margin-top:4px">' + esc(c.line ? c.line.label : c.svc.short) + (c.dest && c.dest.region !== 'home' ? ' · ' + esc(c.dest.name) : '') + ' · ' + esc(e.basis) + '</p>' +
          '<p style="margin-top:8px;font-size:12.5px">' + esc(N.rates.note) + '</p></div>' +
          '<div class="acard-f"><a class="btn sm" href="' + quoteUrl(e.prefill) + '">Start a quote with this</a></div></div>';
        break;
      }
      case 'docs': {
        h = '<div class="acard"><div class="acard-h"><span class="svc-ic-sm">' + T.ICONS.Customs + '</span><h4>' + esc(c.doc.title) + '</h4><span class="tag" data-cnt>0/' + c.doc.items.length + '</span></div>' +
          '<div class="acard-b"><ul class="check">' + c.doc.items.map(function (d) { return '<li role="checkbox" aria-checked="false" tabindex="0"><span class="bx"></span><span>' + esc(d) + '</span></li>'; }).join('') + '</ul>' +
          '<div class="prog"><i></i></div><p style="font-size:12.5px;margin-top:8px">Tick what you already have. Novus’s Licensed Customs Brokers confirm the rest.</p></div></div>';
        break;
      }
      case 'track': {
        var sh = c.sh, st = stageState(sh), now = sh.events.filter(function (x) { return x[3] === 'now'; })[0] || sh.events[sh.events.length - 1];
        h = '<div class="acard"><div class="acard-h"><h4 class="mono">' + esc(sh.no) + '</h4><span class="pill ' + (sh.stage === 'delivered' ? 'ok' : sh.stage === 'customs' ? 'warn' : 'acc') + '"><span class="dot"></span>' + esc(now[0]) + '</span></div>' +
          '<div class="acard-b"><div class="mini-pipe">' + st.map(function (x) { return '<i class="' + (x === 'skip' ? 'done' : x) + '"></i>'; }).join('') + '</div>' +
          '<div class="mini-labels">' + STAGES.map(function (s) { return '<span>' + s + '</span>'; }).join('') + '</div>' +
          '<dl class="kv"><dt>Route</dt><dd>' + esc(sh.origin) + ' → ' + esc(sh.destination) + '</dd><dt>Mode</dt><dd>' + esc(sh.mode) + '</dd><dt>Latest</dt><dd>' + esc(now[2]) + (now[1] ? ' · ' + esc(now[1]) : '') + '</dd><dt>ETA</dt><dd>' + esc(sh.eta) + '</dd></dl></div>' +
          '<div class="acard-f"><a class="btn sm dark" href="track.html?no=' + esc(sh.no) + '">Open full tracking</a></div></div>';
        break;
      }
      case 'handoff': {
        var k = N.contacts;
        h = '<div class="acard"><div class="acard-h"><h4>Talk to the Novus team</h4><span class="tag">' + esc(N.company.district) + ', Manila</span></div><div class="acard-b"><div class="handoff">' +
          '<a href="' + T.tel(k.phone) + '">Call<small>' + esc(k.phone) + '</small></a>' +
          '<a href="mailto:' + esc(k.email) + '">Email<small>' + esc(k.email) + '</small></a>' +
          '<a href="' + esc(k.facebook) + '" rel="noopener">Facebook<small>novusfreightinc</small></a></div>' +
          (c.transcript ? '<div class="acard-f" style="padding:10px 0 0"><button class="btn sm" data-transcript>Send this chat to the Novus team</button></div>' : '') +
          '</div></div>';
        break;
      }
      case 'quote': {
        var p = c.prefill || {}, sv = svcById(p.svc);
        h = '<div class="acard"><div class="acard-h"><h4>Quote request</h4><span class="pill acc">Pre-filled from chat</span></div>' +
          '<div class="acard-b"><dl class="kv" style="margin-top:0"><dt>Service</dt><dd>' + (sv ? esc(sv.name) : 'Choose on the form') + '</dd><dt>Route</dt><dd>' + (p.dest ? 'Manila ↔ ' + esc(p.dest) : 'Add origin and destination') + '</dd></dl></div>' +
          '<div class="acard-f"><a class="btn sm" href="' + quoteUrl(p) + '">Open the quote form</a></div></div>';
        break;
      }
      case 'list':
        h = '<div class="acard"><div class="acard-b"><div class="svc-list">' + N.services.map(function (s) { return '<button data-q="Does Novus offer ' + esc(s.short) + '?"><span class="svc-ic-sm">' + (T.ICONS[s.group] || '') + '</span>' + esc(s.name) + '</button>'; }).join('') + '</div></div></div>';
        break;
      case 'timeline':
        h = '<div class="acard"><div class="acard-h"><h4>Novus Freight Inc. · company history</h4></div><div class="acard-b"><ul class="mini-hist">' + N.company.history.map(function (x) { return '<li><b>' + esc(x.when) + '</b><span>' + esc(x.what) + '</span></li>'; }).join('') + '</ul>' +
          '<p style="margin-top:10px;font-size:12.5px">Values: ' + N.company.values.map(function (v) { return v.name; }).join(' · ') + '</p></div></div>';
        break;
      case 'values':
        h = '<div class="acard"><div class="acard-b"><ul class="lines">' + N.company.values.map(function (v) { return '<li>' + ICON.check + '<span><b>' + esc(v.name) + '</b></span></li>'; }).join('') + '</ul></div></div>';
        break;
      case 'accred':
        h = '<div class="acard"><div class="acard-b"><p style="font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;margin-bottom:6px">International networks</p><div class="chipset">' + N.company.networks.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div>' +
          '<p style="font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;margin:12px 0 6px">Local licenses &amp; accreditations</p><div class="chipset">' + N.company.accreditations.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div></div></div>';
        break;
      case 'scope':
        h = '<div class="acard"><div class="acard-b"><p style="font-size:13px">I answer from Novus Freight Inc.’s own information only: its services, history, accreditations, contacts and your shipment. That keeps every answer accurate.</p></div></div>';
        break;
    }
    return h;
  }

  function wireCard(root, chat) {
    $$('[data-q]', root).forEach(function (b) { b.addEventListener('click', function () { chat.ask(b.getAttribute('data-q')); }); });
    $$('.check li', root).forEach(function (li) {
      var toggle = function () {
        li.classList.toggle('done'); li.setAttribute('aria-checked', li.classList.contains('done'));
        var ul = li.parentNode, all = $$('li', ul).length, dn = $$('li.done', ul).length, cardEl = ul.closest('.acard');
        $('.prog i', cardEl).style.width = (dn / all * 100) + '%';
        $('[data-cnt]', cardEl).textContent = dn + '/' + all;
      };
      li.addEventListener('click', toggle);
      li.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); } });
    });
    $$('[data-transcript]', root).forEach(function (b) {
      b.addEventListener('click', function () {
        var body = chat.transcript();
        b.textContent = 'Opening your email app…';
        window.location.href = 'mailto:' + N.contacts.email + '?subject=' + encodeURIComponent('Novus AI chat: please follow up') + '&body=' + encodeURIComponent(body);
      });
    });
  }

  /* ---------- chat component ---------- */
  function Chat(host, opts) {
    opts = opts || {};
    var self = this;
    this.host = host; this.lines = [];
    host.classList.add('chat');
    host.innerHTML = '<div class="chat-log" aria-live="polite"></div>' +
      '<form class="chat-form" autocomplete="off"><label class="sr" for="' + (opts.id || 'q') + '">Ask Novus AI</label><input id="' + (opts.id || 'q') + '" placeholder="' + esc(opts.placeholder || 'Ask about any service or shipment…') + '" maxlength="300"><button class="send" aria-label="Send">' + ICON.send + '</button></form>' +
      (opts.foot === false ? '' : '<div class="chat-foot"><span>Answers from Novus’s information only</span><span>Free in-browser engine</span></div>');
    this.log = $('.chat-log', host); this.input = $('input', host);
    if (opts.empty) { this.log.innerHTML = opts.empty; wireCard(this.log, this); }
    $('form', host).addEventListener('submit', function (e) { e.preventDefault(); var v = self.input.value.trim(); if (v) { self.input.value = ''; self.ask(v); } });
    this.busy = false;
  }
  Chat.prototype.scroll = function () { this.log.scrollTop = this.log.scrollHeight; };
  Chat.prototype.transcript = function () {
    return 'Hi Novus team, please follow up on this chat.\n\n' + this.lines.map(function (l) { return (l[0] === 'me' ? 'Client: ' : 'Novus AI: ') + l[1]; }).join('\n') + '\n\nMy name / number: ';
  };
  Chat.prototype.ask = function (q) {
    var self = this;
    if (this.busy || !q) return;
    this.busy = true;
    var empty = $('.ask-empty', this.log); if (empty) empty.remove();
    $$('.chips', this.log).forEach(function (c) { c.remove(); });
    var me = document.createElement('div'); me.className = 'msg me'; me.textContent = q; this.log.appendChild(me);
    this.lines.push(['me', q]);
    var r = AI.reply(q); logQ(q, r);
    var bot = document.createElement('div'); bot.className = 'msg bot';
    bot.innerHTML = '<span class="av">' + ICON.spark + '</span><div class="body"><div class="thinking" aria-label="Novus AI is thinking"><i></i><i></i><i></i></div></div>';
    this.log.appendChild(bot); this.scroll();
    var body = $('.body', bot);
    setTimeout(function () {
      body.innerHTML = '<div class="txt"></div>';
      var txt = $('.txt', body), words = r.text.split(' '), i = 0, step = Math.max(8, Math.min(30, 1500 / words.length));
      var finish = function () {
        txt.textContent = r.text;
        self.lines.push(['bot', r.text]);
        var extra = r.cards.map(function (c) { return card(c); }).join('');
        extra += '<div class="src">' + ICON.book + '<span>Source: ' + esc(r.source) + '</span></div>';
        if (r.chips.length) extra += '<div class="chips">' + r.chips.map(function (c, k) { return '<button class="chip" style="animation-delay:' + (k * 70) + 'ms" data-q="' + esc(c) + '">' + esc(c) + '</button>'; }).join('') + '</div>';
        var wrap = document.createElement('div'); wrap.innerHTML = extra;
        while (wrap.firstChild) body.appendChild(wrap.firstChild);
        wireCard(body, self);
        self.busy = false; self.scroll();
        if (self.onAnswer) self.onAnswer(r);
      };
      if (reduce) return finish();
      (function tick() {
        if (i >= words.length) return finish();
        i++; txt.innerHTML = esc(words.slice(0, i).join(' ')) + '<span class="caret"></span>';
        if (i % 4 === 0) self.scroll();
        setTimeout(tick, step);
      })();
    }, reduce ? 0 : 420 + Math.random() * 280);
  };
  window.NovusChat = Chat;

  /* ---------- engine switch (visual only) ---------- */
  function engineSwitch() {
    return '<div class="engine"><button type="button" aria-expanded="false" data-eng>' + '<span class="live-dot"></span>Free engine ▾</button>' +
      '<div class="engine-pop" hidden><div class="engine-opt on"><span class="rd"></span><div><b>Built-in engine (free)</b><small>Runs in your browser. Answers only from the Novus knowledge base. No API cost.</small></div></div>' +
      '<button type="button" class="engine-opt" data-claude><span class="rd"></span><div><b>Claude by Anthropic</b><small>Live version: open-ended answers in natural English, grounded on the same Novus knowledge base.</small></div></button>' +
      '<p class="engine-note" data-engnote>This demo does not call any API. In the live version Novus can switch on Claude for open-ended questions; the scope limit and sources stay the same.</p></div></div>';
  }
  function wireEngine(root) {
    var b = $('[data-eng]', root), pop = $('.engine-pop', root);
    if (!b) return;
    b.addEventListener('click', function (e) { e.stopPropagation(); pop.hidden = !pop.hidden; b.setAttribute('aria-expanded', !pop.hidden); });
    $('[data-claude]', root).addEventListener('click', function (e) { e.stopPropagation(); $('[data-engnote]', root).innerHTML = '<b>Available in the live version.</b> Turning on Claude needs Novus’s go-ahead and an API key on the server, so this demo stays on the free engine.'; });
    document.addEventListener('click', function (e) { if (!pop.hidden && !pop.contains(e.target)) { pop.hidden = true; b.setAttribute('aria-expanded', false); } });
  }
  window.NovusEngineSwitch = { html: engineSwitch, wire: wireEngine };

  function emptyState(title, sub) {
    var ex = ['Do you handle perishable cargo?', 'PEZA cargo?', 'Can you handle triangular shipments?', 'Do you have wing vans?', 'Do you do DDP?', 'Tell me about Novus'];
    return '<div class="ask-empty"><div class="orb">' + ICON.spark + '</div><h2>' + esc(title) + '</h2><p>' + esc(sub) + '</p>' +
      '<div class="chips">' + ex.map(function (c) { return '<button class="chip" data-q="' + esc(c) + '">' + esc(c) + '</button>'; }).join('') + '</div></div>';
  }
  window.NovusEmpty = emptyState;

  /* ---------- floating launcher + panel ---------- */
  var panelChat = null;
  if (page !== 'ask') {
    var fab = document.createElement('button');
    fab.className = 'fab'; fab.type = 'button'; fab.setAttribute('aria-label', 'Ask Novus AI');
    fab.innerHTML = '<span class="av">' + ICON.spark.replace('fill:var(--accent)', 'fill:#fff') + '</span>Ask Novus AI';
    var panel = document.createElement('aside');
    panel.className = 'panel'; panel.hidden = true; panel.setAttribute('aria-label', 'Novus AI assistant');
    panel.innerHTML = '<div class="panel-head"><span class="av" style="width:32px;height:32px;border-radius:10px;background:rgba(255,255,255,.08);display:grid;place-items:center">' + ICON.spark + '</span><div class="grow"><b>Novus AI</b><small>Answers from Novus’s information</small></div>' + engineSwitch() + '<a class="full" href="ask.html">Full screen</a><button class="x" aria-label="Close">×</button></div><div data-chat style="flex:1;min-height:0;display:flex;flex-direction:column"></div>';
    document.body.appendChild(fab); document.body.appendChild(panel);
    wireEngine(panel);
    var openPanel = function (q) {
      if (!panelChat) panelChat = new Chat($('[data-chat]', panel), { id: 'pq', empty: emptyState('Ask anything about Novus Freight', 'Services, cargo types, history, accreditations, contacts or your shipment. I’ll answer in your language.') });
      panel.hidden = false; fab.hidden = true;
      if (q) panelChat.ask(q); else setTimeout(function () { panelChat.input.focus(); }, 60);
    };
    fab.addEventListener('click', function () { openPanel(); });
    $('.x', panel).addEventListener('click', function () { panel.hidden = true; fab.hidden = false; fab.focus(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { panel.hidden = true; fab.hidden = false; } });
    window.NovusOpen = openPanel;
  }
  $$('[data-ask]').forEach(function (b) {
    b.addEventListener('click', function () { var q = b.getAttribute('data-ask'); if (window.NovusPageChat) window.NovusPageChat.ask(q); else if (window.NovusOpen) window.NovusOpen(q); });
  });
})();
