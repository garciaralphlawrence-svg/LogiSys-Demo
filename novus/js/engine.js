/* Novus AI · free in-browser engine
   Intent + entity matching over window.NOVUS (data/novus-kb.js, facts from nfiph.com).
   English, Tagalog and Taglish, typo tolerant, remembers context.
   Never states unpublished facts (prices, transit, hours) as Novus's own:
   those are labelled demo estimates or handed to the team.
   No network calls. The live version can route open-ended questions to
   Claude (Anthropic) grounded on the same knowledge base. */
(function (root) {
  'use strict';
  var N = root.NOVUS;

  /* ---------- text helpers ---------- */
  function norm(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[’'`]/g, '').replace(/(\d)\s*x\s*(\d)/g, '$1 x $2').replace(/(\d)\s*(ft|footer|kg|kgs|cbm|hc)\b/g, '$1 $2')
      .replace(/[^a-z0-9.\s]/g, ' ').replace(/\.(?!\d)/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function lev(a, b) {
    if (Math.abs(a.length - b.length) > 2) return 9;
    var m = [], i, j;
    for (i = 0; i <= b.length; i++) m[i] = [i];
    for (j = 0; j <= a.length; j++) m[0][j] = j;
    for (i = 1; i <= b.length; i++) for (j = 1; j <= a.length; j++)
      m[i][j] = b[i - 1] === a[j - 1] ? m[i - 1][j - 1] : Math.min(m[i - 1][j - 1] + 1, m[i][j - 1] + 1, m[i - 1][j] + 1);
    return m[b.length][a.length];
  }
  var PREFIX = ['nagpapa', 'magpapa', 'nagpa', 'magpa', 'ipapa', 'nag', 'mag', 'ipa', 'pa', 'ma', 'na', 'i'];
  function variants(t) {
    var out = [t];
    PREFIX.forEach(function (p) { if (t.indexOf(p) === 0 && t.length - p.length >= 4) out.push(t.slice(p.length)); });
    out.slice().forEach(function (v) { if (v.length >= 6 && v.slice(2, 4) === v.slice(0, 2)) out.push(v.slice(2)); });
    return out;
  }
  function prep(q) {
    var n = norm(q), toks = n.split(' ').filter(Boolean), all = [];
    toks.forEach(function (t) { variants(t).forEach(function (v) { all.push(v); }); });
    return { raw: q, n: ' ' + n + ' ', toks: toks, all: all, joined: ' ' + all.join(' ') + ' ' };
  }
  function has(P, phrase) {
    var p = norm(phrase);
    if (!p) return false;
    if (P.n.indexOf(' ' + p + ' ') > -1 || P.joined.indexOf(' ' + p + ' ') > -1) return true;
    if (p.indexOf(' ') === -1 && p.length >= 6) {
      var lim = p.length >= 9 ? 2 : 1;
      for (var i = 0; i < P.all.length; i++) { var t = P.all[i]; if (t[0] === p[0] && t.length >= 4 && lev(t, p) <= lim) return true; }
    }
    return false;
  }
  function score(P, list) { var s = 0; list.forEach(function (w) { if (has(P, w)) s += w.indexOf(' ') > -1 ? 2 : 1; }); return s; }
  function bestAlias(P, aliases) { var b = 0; aliases.forEach(function (a) { if (has(P, a)) b = Math.max(b, norm(a).length); }); return b; }

  /* ---------- vocab ---------- */
  var V = {
    handles: ['do you', 'can you', 'does novus', 'is novus', 'kaya nyo', 'kaya niyo', 'kaya ba', 'cater', 'offer', 'offering', 'handle', 'handles', 'meron ba', 'meron kayo', 'may ba', 'available', 'accept', 'tumatanggap', 'ba kayo', 'kayo ba', 'pwede ba', 'puwede ba', 'pwede', 'nag handle', 'service ba', 'serbisyo'],
    price: ['how much', 'magkano', 'mag kano', 'mgkano', 'magkanu', 'presyo', 'price', 'prices', 'pricing', 'rate', 'rates', 'cost', 'costs', 'fee', 'fees', 'singil', 'estimate', 'ballpark', 'budget', 'tantya', 'charge', 'charges'],
    quote: ['get a quote', 'request a quote', 'book', 'booking', 'mag book', 'magpa quote', 'i want to ship', 'gusto ko magpadala', 'gusto ko mag ship', 'start a quote'],
    docs: ['document', 'documents', 'docs', 'requirements', 'requirement', 'required', 'papers', 'papeles', 'dokumento', 'kailangan ko', 'ano kailangan', 'anong kailangan', 'what do i need', 'need to prepare', 'checklist'],
    transit: ['how long', 'how many days', 'gaano katagal', 'ilang araw', 'transit', 'transit time', 'lead time', 'tagal', 'kailan darating', 'when will it arrive', 'delivery time'],
    track: ['track', 'tracking', 'nasaan', 'asan', 'nasan', 'where is my', 'status ng', 'shipment status', 'trace'],
    human: ['person', 'human', 'agent', 'representative', 'tao', 'kausap', 'talk to', 'speak to', 'call me', 'tawagan', 'staff', 'sales team', 'live agent', 'real person', 'customer service', 'csr', 'makausap', 'coordinator'],
    contact: ['contact', 'phone', 'number', 'email', 'e mail', 'call', 'tawag', 'viber', 'whatsapp', 'reach you', 'hotline', 'landline', 'telephone', 'facebook', 'fb page', 'website'],
    hours: ['hours', 'office hours', 'open', 'bukas ba', 'bukas kayo', 'sarado', 'closed', 'oras', 'schedule', 'holiday'],
    location: ['where are you', 'address', 'office', 'located', 'saan kayo', 'location', 'branch', 'branches', 'opisina', 'saan ang office', 'visit', 'binondo', 'escolta'],
    about: ['about', 'who are you', 'sino kayo', 'ano ang novus', 'what is novus', 'story', 'kwento', 'kuwento', 'ikwento', 'background', 'tell me about', 'tungkol', 'introduce', 'company profile', 'who is novus', 'novus freight', 'profile'],
    list: ['what services', 'anong services', 'ano ang services', 'ano services', 'ano offer', 'list of services', 'what do you do', 'ano ginagawa', 'services nyo', 'services niyo', 'ano kaya nyo', 'what can you do', 'all services', 'your services', 'mga services', 'serbisyo nyo'],
    logi: ['ship', 'shipping', 'send', 'padala', 'freight', 'cargo', 'deliver', 'delivery', 'import', 'export', 'papunta', 'papuntang', 'galing', 'from', 'to', 'route', 'cover', 'byahe', 'biyahe', 'container', 'port', 'sea', 'air', 'cbm', 'kg', 'kayo', 'ba', 'naman', 'eh', 'how about', 'what about'],
    greet: ['hi', 'hello', 'hey', 'kumusta', 'kamusta', 'musta', 'good morning', 'good afternoon', 'good evening', 'magandang umaga', 'magandang hapon', 'magandang gabi', 'hola'],
    thanks: ['thanks', 'thank you', 'salamat', 'ty', 'tnx', 'thx', 'maraming salamat'],
    offtopic: ['capital of', 'game', 'nba', 'pba', 'basketball', 'score', 'won', 'weather', 'panahon', 'president', 'election', 'recipe', 'movie', 'song', 'lyrics', 'joke', 'bitcoin', 'crypto', 'stock market', 'news', 'chismis', 'homework', 'math', 'politics', 'girlfriend', 'boyfriend', 'love', 'horoscope', 'lotto', 'boxing', 'pacquiao', 'celebrity', 'netflix', 'pizza', 'poem', 'write code']
  };
  var TL = ['ba', 'po', 'kano', 'mgkano', 'ng', 'nyo', 'niyo', 'kayo', 'namin', 'natin', 'ko', 'mo', 'ang', 'mga', 'sa', 'yung', 'ano', 'anong', 'saan', 'paano', 'magkano', 'gaano', 'ilang', 'papunta', 'papuntang', 'pwede', 'puwede', 'meron', 'wala', 'hindi', 'salamat', 'kumusta', 'kamusta', 'gusto', 'nasaan', 'asan', 'sino', 'kailan', 'lang', 'naman', 'yan', 'iyan', 'dito', 'galing', 'kaya', 'opo', 'din', 'rin', 'tapos', 'pala', 'kasi'];
  var DEMO_TRANSIT = { eastasia: ['4 to 8 days', '1 to 2 days'], seasia: ['4 to 9 days', '1 to 2 days'], far: ['14 to 35 days', '2 to 4 days'], domestic: ['2 to 6 days', '1 day'] };

  /* ---------- entities ---------- */
  function findOffer(P) {
    var best = { svc: null, line: null, len: 0 }, bestLine = { svc: null, line: null, len: 0 };
    N.services.forEach(function (s) {
      var sl = bestAlias(P, s.aliases.concat([s.name, s.short]));
      if (sl > best.len) best = { svc: s, line: null, len: sl };
      s.lines.forEach(function (l) { var ll = bestAlias(P, l.aliases.concat([l.label])); if (ll > bestLine.len) bestLine = { svc: s, line: l, len: ll }; });
    });
    return bestLine.line ? bestLine : best;
  }
  function findNot(P) {
    var b = null, bl = 0;
    N.notListed.forEach(function (n) { var l = bestAlias(P, n.aliases); if (l > bl) { bl = l; b = n; } });
    return b ? { item: b, len: bl } : null;
  }
  function findDests(P) {
    var hits = [];
    N.destinations.forEach(function (d) {
      d.aliases.forEach(function (a) {
        var na = norm(a);
        if (na.length <= 3 ? P.n.indexOf(' ' + na + ' ') > -1 : has(P, a)) {
          var pos = P.n.indexOf(' ' + na.split(' ')[0]);
          if (!hits.some(function (h) { return h.d.id === d.id; })) hits.push({ d: d, pos: pos < 0 ? 999 : pos });
        }
      });
    });
    hits.sort(function (a, b) { return a.pos - b.pos; });
    return hits.map(function (h) { return h.d; });
  }
  function regionOf(dests) { for (var i = 0; i < dests.length; i++) if (dests[i].region !== 'home') return dests[i]; return null; }
  function findQty(P) {
    var s = P.n, q = {}, m;
    if ((m = s.match(/(\d+(?:\.\d+)?)\s*(kg|kgs|kilo|kilos|kilograms?)\b/))) q.kg = +m[1];
    if ((m = s.match(/(\d+(?:\.\d+)?)\s*(cbm|cubic|m3)\b/))) q.cbm = +m[1];
    if ((m = s.match(/(\d+)\s*x\s*(20|40)\b/)) || (m = s.match(/(\d+)\s+(20|40)\s*(?:ft|footer|foot|hc)/))) { q.ctn = +m[1]; q.size = m[2]; }
    else if ((m = s.match(/\b(20|40)\s*(ft|footer|foot|hc|hq)\b/))) { q.ctn = 1; q.size = m[1]; }
    return q;
  }
  function trackNo(raw) { var m = String(raw).match(/\bNVF[\s-]?(\d{4,6})\b/i); return m ? 'NVF-' + m[1] : null; }
  function isTL(P) { var c = 0; P.toks.forEach(function (t) { if (TL.indexOf(t) > -1) c++; }); return c >= 1; }

  /* ---------- demo money ---------- */
  function peso(n) { return '₱' + (Math.round(n / 10) * 10).toLocaleString('en-PH'); }
  function rng(a) { return peso(a[0]) + ' to ' + peso(a[1]); }
  function kindOf(svc, line, P) {
    var k = (line && line.estimate) || (svc && svc.estimate) || null;
    if (P && svc && (svc.id === 'international' || svc.id === 'domestic') && /\b(air|eroplano|plane|flight)\b/.test(P.n)) k = 'air';
    return k;
  }
  function estimate(svc, dest, q, line, kindOverride) {
    var R = N.rates, reg = dest ? dest.region : null, kind = kindOverride || kindOf(svc, line);
    if (!kind) return null;
    if (reg === 'domesticland' && (kind === 'lcl' || kind === 'fcl' || kind === 'air')) kind = 'trucking';
    var key = svc && svc.id === 'domestic' ? 'domestic' : reg === 'domestic' ? 'domestic' : (reg === 'eastasia' || reg === 'seasia' || reg === 'far') ? reg : 'eastasia';
    var r, lo, hi, basis, pre = { svc: svc ? svc.id : '' };
    if (line) pre.line = line.id;
    if (dest) pre.dest = dest.name;
    if (kind === 'air') { var kg = Math.max(q.kg || 100, R.air.minKg); r = R.air[key]; lo = r[0] * kg; hi = r[1] * kg; basis = kg + ' kg chargeable × ' + peso(r[0]) + ' to ' + peso(r[1]) + ' per kg'; pre.kg = kg; pre.mode = 'air'; }
    else if (kind === 'lcl') { var cbm = Math.max(q.cbm || 1, R.lcl.min); r = R.lcl[key]; lo = r[0] * cbm; hi = r[1] * cbm; basis = cbm + ' CBM × ' + peso(r[0]) + ' to ' + peso(r[1]) + ' per CBM'; pre.cbm = cbm; pre.mode = 'lcl'; }
    else if (kind === 'fcl') { var n = q.ctn || 1, f = q.size === '40' ? R.fcl.fortyFactor : 1; r = R.fcl[key]; lo = r[0] * f * n; hi = r[1] * f * n; basis = n + ' × ' + (q.size === '40' ? '40ft' : '20ft') + ' container'; pre.ctn = n; pre.size = q.size || '20'; pre.mode = 'fcl'; }
    else if (kind === 'customs') { r = R.customs; lo = r[0]; hi = r[1]; basis = 'Brokerage per entry, duties and taxes not included'; pre.mode = 'customs'; }
    else if (kind === 'trucking') { r = R.trucking['4w']; lo = r[0]; hi = r[1]; basis = 'Small closed van, one trip within Metro Manila'; pre.mode = 'trucking'; }
    return { range: [lo, hi], basis: basis, kind: kind, prefill: pre };
  }

  /* ---------- reply ---------- */
  var ctx = { lastService: null, lastLine: null, lastDest: null, lastIntent: null, lastQty: {}, lang: 'en', turns: 0 };
  function L(en, tl) { return ctx.lang === 'tl' && tl ? tl : en; }
  function shipment(no) { for (var i = 0; i < N.shipments.length; i++) if (N.shipments[i].no === no) return N.shipments[i]; return null; }
  function docsFor(svc, line) {
    if (line && line.id === 'peza') return N.documents.peza;
    if (line && line.estimate === 'air') return N.documents.air;
    if (svc && svc.id === 'nvocc') return N.documents.sea;
    return N.documents.customs;
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function reply(q) {
    var P = prep(q), out = { q: q, text: '', cards: [], chips: [], source: '', intent: '', gap: false };
    var co = N.company, c = N.contacts;
    ctx.turns++;
    ctx.lang = 'en'; // Novus AI always replies in English (it still understands Tagalog/Taglish questions)

    var no = trackNo(q), off = findOffer(P), svc = off.svc, line = off.line, notL = findNot(P);
    var dests = findDests(P), dest = regionOf(dests), qty = findQty(P);
    if (notL && notL.len > off.len) { svc = null; line = null; } else if (notL && off.len >= notL.len) notL = null;
    var S = {}; Object.keys(V).forEach(function (k) { S[k] = score(P, V[k]); });
    var hasQty = qty.kg != null || qty.cbm != null || qty.ctn != null;
    var followWord = /^ ?(how about|what about|what if|eh|e|paano kung|pano kung|kung|sa|by|naman|and|tapos)\b/.test(P.n) || / naman /.test(P.n) || P.toks.length <= 2;
    var shortFollow = P.toks.length <= 6 && (svc || dest || hasQty) && followWord && !S.price && !S.docs && !S.transit && !S.handles && !S.track && ctx.lastIntent && ['price', 'docs', 'transit'].indexOf(ctx.lastIntent) > -1;
    if (S.price || S.docs || S.transit || shortFollow) {
      if (!svc && ctx.lastService) { svc = ctx.lastService; line = ctx.lastLine; }
      if (!dest && ctx.lastDest) dest = ctx.lastDest;
    }
    if (S.price || shortFollow) ['kg', 'cbm', 'ctn', 'size'].forEach(function (k) { if (qty[k] == null && ctx.lastQty[k] != null) qty[k] = ctx.lastQty[k]; });

    /* FAQ score */
    var faq = null, fs = 0;
    N.faqs.forEach(function (f) { var s = score(P, f.keys); if (s > fs) { fs = s; faq = f; } });

    var intent;
    if (no) intent = 'track';
    else if (S.human && !svc) intent = 'human';
    else if (S.offtopic && !svc && !dest && !notL && !S.about && fs < 1) intent = 'offtopic';
    else if (S.price) intent = 'price';
    else if (S.docs) intent = 'docs';
    else if (S.transit && (svc || dest)) intent = 'transit';
    else if (S.track) intent = 'track';
    else if (S.list) intent = 'list';
    else if (notL) intent = 'notlisted';
    else if (faq && fs >= 2 && !line) intent = 'faq';
    else if (svc) intent = 'service';
    else if (S.contact) intent = 'contact';
    else if (S.hours) intent = 'hours';
    else if (S.location) intent = 'location';
    else if (faq && fs >= 1) intent = 'faq';
    else if (dest && (S.logi || P.toks.length <= 3)) intent = 'route';
    else if (S.about) intent = 'about';
    else if (S.thanks) intent = 'thanks';
    else if (S.greet && P.toks.length <= 4) intent = 'greet';
    else if (S.quote) intent = 'quote';
    else intent = S.handles ? 'gap' : 'offtopic';
    if (shortFollow) intent = ctx.lastIntent;
    out.intent = intent;

    switch (intent) {
      case 'track': {
        if (!no) {
          out.text = L('Sure. What’s your Novus tracking number? It starts with NVF-.', 'Sige po. Ano po ang tracking number ninyo? Nagsisimula ito sa NVF-.');
          out.chips = N.shipments.slice(0, 3).map(function (s) { return 'Track ' + s.no; });
          out.source = 'Tracking › Logi-Sys shipment records (sample)';
          break;
        }
        var sh = shipment(no);
        if (!sh) {
          out.text = L('I couldn’t find ' + no + ' in the shipment records. Please check the number, or I can connect you to the Novus team.', 'Wala po akong makitang ' + no + ' sa shipment records. Pakicheck po ang number, o ikokonekta ko kayo sa Novus team.');
          out.cards.push({ type: 'handoff' }); out.chips = ['Track NVF-24117', 'Talk to a person'];
          out.source = 'Tracking › Logi-Sys shipment records (sample)';
          break;
        }
        var now = sh.events.filter(function (e) { return e[3] === 'now'; })[0] || sh.events[sh.events.length - 1];
        out.text = L(sh.no + ' is at “' + now[0] + '”: ' + now[2].charAt(0).toLowerCase() + now[2].slice(1) + '. ' + sh.eta + '.',
          'Ang ' + sh.no + ' ay nasa “' + now[0] + '” na: ' + now[2].charAt(0).toLowerCase() + now[2].slice(1) + '. ' + sh.eta + '.');
        out.cards.push({ type: 'track', sh: sh });
        out.chips = sh.stage === 'customs' ? [L('What does assessment mean?', 'Ano ibig sabihin ng assessment?'), 'Talk to a person'] : ['Track another shipment', 'Talk to a person'];
        out.source = 'Tracking › Logi-Sys shipment ' + sh.no + ' (sample data)';
        break;
      }
      case 'service': {
        ctx.lastService = svc; ctx.lastLine = line; if (dest) ctx.lastDest = dest;
        var yes = line ? line.say : 'Novus offers ' + svc.name;
        var extra = line ? '' : ' ' + svc.summary;
        var dTxt = '';
        if (dest && dest.region !== 'home') {
          dTxt = dest.region === 'domestic' || dest.region === 'domesticland'
            ? L(' For ' + dest.name + ', that falls under Novus’s domestic freight forwarding (sea, land and air); the team confirms the schedule.', ' Para sa ' + dest.name + ', sakop po ito ng domestic freight forwarding ng Novus (sea, land at air); kinukumpirma ng team ang schedule.')
            : L(' For ' + dest.name + ', the team confirms the routing; Novus’s site lists 50+ countries.', ' Para sa ' + dest.name + ', kinukumpirma ng team ang routing; 50+ countries ang nakalista sa site ng Novus.');
        }
        if (svc.id === 'customs' && !line) extra += L(' Novus started in 2017 as a customs brokerage founded by two Licensed Customs Brokers.', ' Nagsimula ang Novus noong 2017 bilang customs brokerage na itinatag ng dalawang Licensed Customs Brokers.');
        if (/ (binondo|escolta|near|malapit|manila) /.test(P.n)) extra += L(' Novus’s office is in Binondo, Manila: ' + co.street + '.', ' Ang office ng Novus ay nasa Binondo, Manila: ' + co.street + '.');
        out.text = L('Yes. ' + cap(yes) + '.' + extra + dTxt, 'Opo, kaya namin ’yan. ' + cap(yes) + '.' + extra + dTxt);
        out.cards.push({ type: 'service', svc: svc, line: line });
        out.chips = [L('How much for that?', 'Magkano po ’yan?'), L('What documents do I need?', 'Anong documents ang kailangan?'), 'Talk to a person'];
        out.source = 'Services (nfiph.com) › ' + svc.name + (line ? ' › ' + line.label : '');
        break;
      }
      case 'notlisted': {
        var it = notL.item;
        out.gap = true;
        out.text = L(it.name + ' is not on Novus’s published service list, so I won’t promise it. A Novus coordinator can tell you if they can arrange it.',
          'Hindi po nakalista ang ' + it.name.toLowerCase() + ' sa services ng Novus, kaya hindi ko po ito maipapangako. Isang Novus coordinator ang makakasagot kung kaya nilang i-arrange.');
        out.cards.push({ type: 'verdict', verdict: 'notlisted', title: it.name });
        out.cards.push({ type: 'handoff', transcript: true });
        out.chips = ['What services do you offer?', 'Talk to a person'];
        out.source = 'Services (nfiph.com) › not in the published list · logged as a question for Novus';
        break;
      }
      case 'price': {
        if (!svc) {
          if (dest) ctx.lastDest = dest;
          out.text = L('I can give a demo ballpark. Which service is it' + (dest ? ' for ' + dest.name : '') + '?', 'Sige po, bibigyan ko kayo ng demo ballpark. Anong service po' + (dest ? ' para sa ' + dest.name : '') + '?');
          out.chips = ['LCL consolidation', 'FCL 20ft', 'Air freight', 'Customs clearance', 'Wing van trucking'];
          out.source = 'Rates › not published by Novus · demo estimate';
          break;
        }
        ctx.lastService = svc; ctx.lastLine = line; if (dest) ctx.lastDest = dest; ctx.lastQty = qty;
        var kind = kindOf(svc, line, P);
        var est = estimate(svc, dest, qty, line, kind);
        var label = line ? line.label.replace(/\s*\(.*\)/, '') : svc.short;
        if (!est) {
          out.text = L('Novus doesn’t publish rates, and ' + label + ' is priced per shipment, so I won’t guess. Send the details and the team will quote you.', 'Hindi po nagpa-publish ng rates ang Novus, at per shipment ang presyo ng ' + label + ', kaya hindi po ako manghuhula. I-send lang ang details at magqu-quote ang team.');
          out.cards.push({ type: 'quote', prefill: { svc: svc.id, dest: dest ? dest.name : '' } });
          out.source = 'Rates › not published by Novus';
          break;
        }
        var fromDir = /\b(from|galing)\b/.test(P.n) && !/\b(to|papunta|papuntang)\b/.test(P.n);
        var where = dest && dest.region !== 'home' ? (fromDir ? ' from ' : ' to ') + dest.name : '';
        if (fromDir) est.prefill.dir = 'Import';
        out.text = L('Novus doesn’t publish rates, so here is a demo ballpark for ' + label + where + ': about ' + rng(est.range) + ' (' + est.basis + '). Novus confirms the real rate for your shipment.',
          'Hindi po nagpa-publish ng rates ang Novus, kaya ito po ang demo ballpark para sa ' + label + where.replace(' to ', ' papuntang ').replace(' from ', ' mula ') + ': mga ' + rng(est.range).replace(' to ', ' hanggang ') + ' (' + est.basis + '). Kinukumpirma ng Novus ang totoong rate.');
        out.cards.push({ type: 'estimate', svc: svc, line: line, dest: dest, est: est });
        var follow = est.kind === 'air' && !qty.kg ? L('What if it’s 300 kg?', 'Paano kung 300 kg?') : est.kind === 'lcl' && !qty.cbm ? L('What if it’s 5 CBM?', 'Paano kung 5 CBM?') : L('What documents do I need?', 'Anong documents ang kailangan?');
        out.chips = [follow, 'Get a quote', 'Talk to a person'];
        out.source = 'Rates › not published by Novus · demo estimate (' + svc.short + ')';
        break;
      }
      case 'docs': {
        var d = docsFor(svc, line);
        if (svc) { ctx.lastService = svc; ctx.lastLine = line; }
        out.text = L('Here’s a general checklist' + (line ? ' for ' + line.label.replace(/\s*\(.*\)/, '') : svc ? ' for ' + svc.short : '') + '. Novus’s Licensed Customs Brokers confirm exactly what your shipment needs before anything is lodged with BOC.',
          'Ito po ang general checklist' + (line ? ' para sa ' + line.label.replace(/\s*\(.*\)/, '') : svc ? ' para sa ' + svc.short : '') + '. Kinukumpirma ng Licensed Customs Brokers ng Novus kung ano talaga ang kailangan bago i-lodge sa BOC.');
        out.cards.push({ type: 'docs', doc: d });
        out.chips = [svc ? L('How much for that?', 'Magkano po ’yan?') : 'Get a quote', 'Talk to a person'];
        out.source = 'General BOC guide (not from nfiph.com) · Novus confirms per shipment';
        break;
      }
      case 'transit': {
        if (svc) { ctx.lastService = svc; ctx.lastLine = line; } if (dest) ctx.lastDest = dest;
        if (!dest || dest.region === 'home') { out.text = L('Where is it going, or coming from?', 'Saan po papunta, o galing?'); out.chips = ['Japan', 'China', 'Cebu', 'USA']; out.source = 'Transit › not published by Novus'; break; }
        var air = (svc && kindOf(svc, line, P) === 'air') || /\b(air|eroplano)\b/.test(P.n);
        var reg = dest.region === 'domesticland' ? 'domestic' : dest.region, tt = DEMO_TRANSIT[reg] ? DEMO_TRANSIT[reg][air ? 1 : 0] : '';
        out.text = L('Novus doesn’t publish transit times. As a demo estimate only, Manila to ' + dest.name + ' by ' + (air ? 'air' : 'sea') + ' is typically ' + tt + ' port to port. The Novus team confirms the actual schedule.',
          'Hindi po nagpa-publish ng transit times ang Novus. Bilang demo estimate lang, Manila papuntang ' + dest.name + ' by ' + (air ? 'air' : 'sea') + ' ay karaniwang ' + tt + ' port to port. Kinukumpirma ng Novus team ang actual na schedule.');
        out.cards.push({ type: 'route', svc: svc, dest: dest, mode: air ? 'air' : 'sea', time: tt });
        out.chips = [L('How much for that?', 'Magkano po ’yan?'), air ? L('How about by sea?', 'Eh kung by sea?') : L('How about by air?', 'Eh kung by air?'), 'Talk to a person'];
        out.source = 'Transit › not published by Novus · demo estimate';
        break;
      }
      case 'route': {
        ctx.lastDest = dest;
        var dom = dest.region === 'domestic' || dest.region === 'domesticland';
        var s2 = N.services.filter(function (s) { return s.id === (dom ? 'domestic' : 'international'); })[0];
        ctx.lastService = s2; ctx.lastLine = null;
        out.text = dom
          ? L('Yes. ' + dest.name + ' falls under Novus’s Domestic / Local Freight Forwarding, by sea, land and air. The team confirms the schedule.', 'Opo. Sakop ng Domestic / Local Freight Forwarding ng Novus ang ' + dest.name + ', by sea, land at air. Kinukumpirma ng team ang schedule.')
          : L('Yes. Shipping to or from ' + dest.name + ' falls under Novus’s International Freight Forwarding (import and export, sea and air). Novus’s site lists 50+ countries; the team confirms the routing.', 'Opo. Ang shipment papunta o galing ' + dest.name + ' ay sakop ng International Freight Forwarding ng Novus (import at export, sea at air). 50+ countries ang nakalista sa site nila; kinukumpirma ng team ang routing.');
        out.cards.push({ type: 'service', svc: s2, line: null });
        out.chips = [L('How much by LCL?', 'Magkano by LCL?'), L('How much by air?', 'Magkano by air?'), 'Talk to a person'];
        out.source = 'Services (nfiph.com) › ' + s2.name;
        break;
      }
      case 'list': {
        out.text = L('Novus Freight Inc. lists five services, from NVOCC sea freight to trucking. Tap one to see exactly what’s included.',
          'Limang services po ang nakalista ng Novus Freight Inc., mula NVOCC sea freight hanggang trucking. I-tap lang para makita ang kasama.');
        out.cards.push({ type: 'list' });
        out.chips = ['Perishable cargo?', 'PEZA cargo?', 'Triangular shipment?'];
        out.source = 'Services (nfiph.com) › all services';
        break;
      }
      case 'quote': {
        var pre = { svc: ctx.lastService ? ctx.lastService.id : '', dest: ctx.lastDest ? ctx.lastDest.name : '' };
        out.text = L('Let’s start your quote request. I’ve filled in what we talked about; finish it on the form and Novus replies with the actual rate.', 'Simulan na natin ang quote request ninyo. Na-fill in ko na ang napag-usapan natin; tapusin lang sa form at sasagot ang Novus ng actual rate.');
        out.cards.push({ type: 'quote', prefill: pre });
        out.source = 'Actions › Quote request';
        break;
      }
      case 'contact': case 'location': case 'hours': {
        out.text = intent === 'hours'
          ? L('Novus doesn’t publish office hours on its website, but it lists 24/7 support. To be sure someone’s in the office, call ' + c.phone + ' or email ' + c.email + '.', 'Hindi po naka-publish ang office hours ng Novus, pero 24/7 support ang nakalista sa site nila. Para sigurado, tumawag sa ' + c.phone + ' o mag-email sa ' + c.email + '.')
          : intent === 'location'
            ? L('Novus’s office is at ' + co.address + '.', 'Ang office po ng Novus ay nasa ' + co.address + '.')
            : L('You can reach Novus at ' + c.phones.join(', ') + ', or email ' + c.emails.join(' or ') + '.', 'Pwede po ninyong tawagan ang Novus sa ' + c.phones.join(', ') + ', o mag-email sa ' + c.emails.join(' o ') + '.');
        out.cards.push({ type: 'handoff' });
        out.chips = ['Get a quote', 'What services do you offer?'];
        out.source = intent === 'hours' ? 'Company (nfiph.com) › office hours not published' : 'Company (nfiph.com) › Contact us';
        break;
      }
      case 'about': {
        out.text = L('', 'Ito po ang kwento ng Novus. ') + 'Novus Freight Inc. began in 2017 as JBC Customs Brokerage, founded by two Licensed Customs Brokers. It rebranded in September 2020 as Novus Cargo Logistics Inc., became Novus Freight Inc. in July 2021, and during the pandemic grew into a one-stop shop: international and domestic freight forwarding, customs brokerage and trucking. Its values are Accountability, Integrity, Quality and Innovation.';
        out.cards.push({ type: 'timeline' });
        out.chips = ['What is your mission?', 'Are you accredited?', 'What services do you offer?'];
        out.source = 'Company (nfiph.com) › History, About us, Values';
        break;
      }
      case 'human': {
        out.text = L('Of course. A Novus coordinator can take it from here. Pick how you’d like to reach them; I can also send them this chat so you don’t repeat yourself.',
          'Sige po. Isang Novus coordinator ang tutulong sa inyo. Piliin kung paano ninyo sila gustong kontakin; pwede ko ring i-send sa kanila itong chat para hindi na kayo mag-ulit.');
        out.cards.push({ type: 'handoff', transcript: true });
        out.source = 'Company (nfiph.com) › Contact us';
        break;
      }
      case 'faq': {
        out.text = ctx.lang === 'tl' ? faq.a.replace(/^Yes\./, 'Opo.') : faq.a;
        if (faq.id === 'accredited' || faq.id === 'networks') out.cards.push({ type: 'accred' });
        if (faq.id === 'founded') out.cards.push({ type: 'timeline' });
        if (faq.id === 'values') out.cards.push({ type: 'values' });
        out.chips = faq.id === 'track' ? ['Track NVF-24117', 'Track NVF-24130'] : ['What services do you offer?', 'Talk to a person'];
        out.source = (/track|assessment/.test(faq.id) ? 'Novus AI guide' : 'Company (nfiph.com)') + ' › ' + faq.q;
        break;
      }
      case 'greet': {
        out.text = L('Hi! I’m Novus AI. Ask me anything about Novus Freight Inc.: services, cargo types, customs, accreditations, contacts or your shipment.', 'Hello po! Ako si Novus AI. Magtanong lang tungkol sa Novus Freight Inc.: services, cargo types, customs, accreditations, contacts o ang shipment ninyo.');
        out.chips = ['Nag ca-cater ba kayo ng perishable?', 'PEZA cargo?', 'Track NVF-24117'];
        out.source = 'Company (nfiph.com)';
        break;
      }
      case 'thanks': {
        out.text = L('You’re welcome. Anything else about your shipment?', 'Walang anuman po. May iba pa po ba kayong tanong?');
        out.chips = ['Get a quote', 'Talk to a person'];
        out.source = 'Novus AI';
        break;
      }
      case 'gap': {
        out.gap = true;
        out.text = L('That isn’t in Novus’s published information, so I won’t guess. A Novus coordinator can answer it for you.', 'Wala po ’yan sa published information ng Novus, kaya hindi po ako manghuhula. Isang Novus coordinator ang sasagot sa inyo.');
        out.cards.push({ type: 'handoff', transcript: true });
        out.source = 'Not in Novus’s information · logged as a question for Novus';
        break;
      }
      default: {
        out.intent = 'offtopic';
        out.gap = !S.offtopic && P.toks.length > 2;
        out.text = L('I’m Novus’s assistant, so I can only help with Novus Freight: services, customs, shipping, the company and your shipment. Is there something about your cargo I can help with?',
          'Assistant po ako ng Novus, kaya Novus Freight lang ang kaya kong sagutin: services, customs, shipping, ang kumpanya at ang shipment ninyo. May tanong po ba kayo tungkol sa cargo ninyo?');
        out.cards.push({ type: 'scope' });
        out.chips = ['What services do you offer?', 'Kwento mo naman about Novus', 'Track NVF-24117'];
        out.source = 'Scope limit · Novus topics only';
      }
    }
    if (['offtopic', 'thanks', 'greet'].indexOf(out.intent) < 0) ctx.lastIntent = intent === 'route' ? 'transit' : intent;
    out.lang = ctx.lang;
    return out;
  }

  root.NovusAI = { reply: reply, ctx: ctx, estimate: estimate, peso: peso, norm: norm, DEMO_TRANSIT: DEMO_TRANSIT, reset: function () { ctx.lastService = ctx.lastLine = ctx.lastDest = ctx.lastIntent = null; ctx.lastQty = {}; ctx.turns = 0; } };
})(typeof window !== 'undefined' ? window : globalThis);
