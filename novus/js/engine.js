/* Novus AI · free in-browser engine
   Intent + entity matching over window.NOVUS (data/novus-kb.js).
   English, Tagalog and Taglish, typo tolerant, remembers context.
   No network calls. The live version can route open-ended questions
   to Claude (Anthropic) grounded in the same knowledge base. */
(function (root) {
  'use strict';
  var N = root.NOVUS;

  /* ---------- text helpers ---------- */
  function norm(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
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
    out.slice().forEach(function (v) { // Tagalog reduplication: cacater -> cater, papadala -> padala
      if (v.length >= 6 && v.slice(2, 4) === v.slice(0, 2)) out.push(v.slice(2));
    });
    return out;
  }
  function prep(q) {
    var n = norm(q), toks = n.split(' ').filter(Boolean), all = [];
    toks.forEach(function (t) { variants(t).forEach(function (v) { all.push(v); }); });
    return { raw: q, n: ' ' + n + ' ', toks: toks, all: all, joined: ' ' + all.join(' ') + ' ' };
  }
  /* does text contain phrase (exact, or fuzzy for single long words)? */
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

  /* ---------- vocab ---------- */
  var V = {
    handles: ['do you', 'can you', 'does novus', 'is novus', 'kaya nyo', 'kaya niyo', 'kaya ba', 'cater', 'offer', 'offering', 'handle', 'handles', 'meron ba', 'may ba', 'available', 'accept', 'tumatanggap', 'ba kayo', 'kayo ba', 'pwede ba', 'puwede ba', 'pwede', 'nag handle', 'service ba', 'serbisyo'],
    price: ['how much', 'magkano', 'mag kano', 'mgkano', 'magkanu', 'hm', 'presyo', 'price', 'prices', 'pricing', 'rate', 'rates', 'cost', 'costs', 'fee', 'fees', 'singil', 'estimate', 'ballpark', 'budget', 'tantya', 'quotation price', 'charge', 'charges'],
    quote: ['quote', 'quotation', 'get a quote', 'request a quote', 'book', 'booking', 'mag book', 'magpa quote', 'i want to ship', 'gusto ko magpadala', 'gusto ko mag ship', 'ship my', 'start a quote'],
    docs: ['document', 'documents', 'docs', 'requirements', 'requirement', 'required', 'papers', 'papeles', 'dokumento', 'kailangan ko', 'ano kailangan', 'anong kailangan', 'what do i need', 'need to prepare', 'checklist'],
    transit: ['how long', 'how many days', 'gaano katagal', 'ilang araw', 'transit', 'transit time', 'lead time', 'tagal', 'kailan darating', 'when will it arrive', 'delivery time', 'days'],
    track: ['track', 'tracking', 'nasaan', 'asan', 'nasan', 'where is my', 'status ng', 'shipment status', 'trace'],
    human: ['person', 'human', 'agent', 'representative', 'tao', 'kausap', 'talk to', 'speak to', 'call me', 'tawagan', 'staff', 'sales team', 'live agent', 'real person', 'customer service', 'csr', 'makausap'],
    contact: ['contact', 'phone', 'number', 'email', 'e mail', 'call', 'tawag', 'viber', 'whatsapp', 'reach you', 'hotline', 'landline', 'cellphone', 'mobile'],
    hours: ['hours', 'office hours', 'open', 'bukas ba', 'sarado', 'closed', 'oras', 'schedule', 'saturday', 'sunday', 'sabado', 'linggo', 'weekend', 'holiday'],
    location: ['where are you', 'address', 'office', 'located', 'saan kayo', 'location', 'branch', 'branches', 'opisina', 'saan ang office', 'visit'],
    about: ['about', 'who are you', 'sino kayo', 'ano ang novus', 'what is novus', 'story', 'kwento', 'kuwento', 'ikwento', 'history', 'background', 'tell me about', 'tungkol', 'introduce', 'company profile', 'who is novus', 'novus freight'],
    list: ['what services', 'anong services', 'ano ang services', 'ano services', 'ano offer', 'list of services', 'what do you do', 'ano ginagawa', 'services nyo', 'services niyo', 'ano kaya nyo', 'what can you do', 'all services', 'your services', 'mga services'],
    coverage: ['ports', 'port', 'coverage', 'areas', 'saan kayo nag', 'where do you ship', 'which countries', 'anong bansa', 'routes', 'lanes', 'destinations', 'countries'],
    greet: ['hi', 'hello', 'hey', 'kumusta', 'kamusta', 'musta', 'good morning', 'good afternoon', 'good evening', 'magandang umaga', 'magandang hapon', 'magandang gabi', 'yo', 'hola'],
    thanks: ['thanks', 'thank you', 'salamat', 'ty', 'tnx', 'thx', 'maraming salamat'],
    logi: ['ship', 'shipping', 'send', 'padala', 'freight', 'cargo', 'deliver', 'delivery', 'import', 'export', 'papunta', 'papuntang', 'galing', 'from', 'to', 'route', 'cover', 'byahe', 'biyahe', 'container', 'port', 'sea', 'air', 'cbm', 'kg', 'kayo', 'ba', 'naman', 'eh', 'how about', 'what about'],
    offtopic: ['capital of', 'game', 'nba', 'pba', 'basketball', 'score', 'won', 'weather', 'panahon', 'president', 'election', 'recipe', 'movie', 'song', 'lyrics', 'joke', 'bitcoin', 'crypto', 'stock market', 'news', 'chismis', 'homework', 'math', 'politics', 'girlfriend', 'boyfriend', 'love', 'horoscope', 'lotto', 'boxing', 'pacquiao', 'celebrity', 'netflix', 'pizza', 'poem', 'write code']
  };
  var TL = ['ba', 'po', 'kano', 'mgkano', 'ng', 'nyo', 'niyo', 'kayo', 'namin', 'natin', 'ko', 'mo', 'ang', 'mga', 'sa', 'yung', 'ano', 'anong', 'saan', 'paano', 'magkano', 'gaano', 'ilang', 'papunta', 'papuntang', 'pwede', 'puwede', 'meron', 'wala', 'hindi', 'salamat', 'kumusta', 'kamusta', 'gusto', 'nasaan', 'asan', 'sino', 'kailan', 'lang', 'naman', 'yan', 'iyan', 'dito', 'galing', 'kaya', 'opo', 'din', 'rin', 'tapos', 'pala', 'kasi'];

  /* ---------- entity finders ---------- */
  function findService(P) {
    var best = null, bs = 0;
    N.services.forEach(function (s) {
      var sc = 0;
      s.aliases.concat([s.name, s.id.replace('-', ' ')]).forEach(function (a) { if (has(P, a)) sc += norm(a).length; });
      if (sc > bs) { bs = sc; best = s; }
    });
    return best;
  }
  function findNot(P) {
    for (var i = 0; i < N.notHandled.length; i++) {
      var n = N.notHandled[i];
      for (var j = 0; j < n.aliases.length; j++) if (has(P, n.aliases[j]) && norm(n.aliases[j]).length > 2) return n;
    }
    return null;
  }
  function findDests(P) {
    var hits = [];
    N.destinations.forEach(function (d) {
      d.aliases.forEach(function (a) {
        var na = norm(a);
        if (na.length <= 2 ? P.n.indexOf(' ' + na + ' ') > -1 : has(P, a)) {
          var pos = P.n.indexOf(' ' + na.split(' ')[0]);
          if (!hits.some(function (h) { return h.d.id === d.id; })) hits.push({ d: d, pos: pos < 0 ? 999 : pos });
        }
      });
    });
    hits.sort(function (a, b) { return a.pos - b.pos; });
    return hits.map(function (h) { return h.d; });
  }
  function findPort(P) {
    for (var i = 0; i < N.ports.length; i++) { var p = N.ports[i]; for (var j = 0; j < p.aliases.length; j++) if (has(P, p.aliases[j])) return p; }
    return null;
  }
  function findQty(P) {
    var s = P.n, q = {}, m;
    if ((m = s.match(/(\d+(?:\.\d+)?)\s*(kg|kgs|kilo|kilos|kilograms?)\b/))) q.kg = +m[1];
    if ((m = s.match(/(\d+(?:\.\d+)?)\s*(cbm|cubic|cu m|m3)\b/))) q.cbm = +m[1];
    if ((m = s.match(/(\d+)\s*x\s*(20|40)\b/)) || (m = s.match(/(\d+)\s+(?:units? of |pcs? )?(20|40)\s*(?:ft|footer|foot|hc)/))) { q.ctn = +m[1]; q.size = m[2]; }
    else if ((m = s.match(/\b(20|40)\s*(ft|footer|foot|hc|hq)\b/))) { q.ctn = 1; q.size = m[1]; }
    if ((m = s.match(/(\d+)\s*(pallets?|paleta)\b/))) q.pallets = +m[1];
    return q;
  }
  function trackNo(raw) { var m = String(raw).match(/\bNVF[\s-]?(\d{4,6})\b/i); return m ? 'NVF-' + m[1] : null; }
  function isTL(P) { var c = 0; P.toks.forEach(function (t) { if (TL.indexOf(t) > -1) c++; }); return c >= 1; }

  /* ---------- money ---------- */
  function peso(n) { return '₱' + (Math.round(n / 10) * 10).toLocaleString('en-PH'); }
  function rng(a) { return peso(a[0]) + ' to ' + peso(a[1]); }
  function regionOf(dests) {
    for (var i = 0; i < dests.length; i++) if (dests[i].region !== 'home') return dests[i];
    return null;
  }
  /* returns {range:[lo,hi], basis, lines:[], unit, prefill} or null */
  function estimate(svc, dest, q) {
    var R = N.rates, reg = dest ? dest.region : null, kind = svc && svc.estimate;
    if (!kind) return null;
    if (reg === 'domesticland' && (kind === 'lcl' || kind === 'fcl' || kind === 'air')) kind = 'trucking';
    var key = reg === 'domestic' ? 'domestic' : (reg === 'eastasia' || reg === 'seasia' || reg === 'far') ? reg : 'eastasia';
    var r, lo, hi, basis, pre = { svc: svc.id };
    if (dest) pre.dest = dest.name;
    if (kind === 'air') {
      var kg = Math.max(q.kg || 100, R.air.minKg); r = R.air[key]; lo = r[0] * kg; hi = r[1] * kg;
      basis = kg + ' kg chargeable × ' + peso(r[0]) + ' to ' + peso(r[1]) + ' per kg'; pre.kg = kg;
    } else if (kind === 'lcl') {
      var cbm = Math.max(q.cbm || 1, R.lcl.min); r = R.lcl[key]; lo = r[0] * cbm; hi = r[1] * cbm;
      basis = cbm + ' CBM × ' + peso(r[0]) + ' to ' + peso(r[1]) + ' per CBM'; pre.cbm = cbm;
    } else if (kind === 'fcl') {
      var n = q.ctn || 1, f = q.size === '40' ? R.fcl.fortyFactor : 1; r = R.fcl[key]; lo = r[0] * f * n; hi = r[1] * f * n;
      basis = n + ' × ' + (q.size === '40' ? '40ft' : '20ft') + ' container'; pre.ctn = n; pre.size = q.size || '20';
    } else if (kind === 'customs') {
      r = R.customs; lo = r[0]; hi = r[1]; basis = 'Brokerage per entry, duties and taxes not included';
    } else if (kind === 'trucking') {
      r = R.trucking['4w']; lo = r[0]; hi = r[1]; basis = '4-wheel closed van, one trip (Metro Manila)'; pre.svc = 'trucking';
    } else if (kind === 'warehousing') {
      var p = q.pallets || 10; r = R.warehousing; lo = r[0] * p; hi = r[1] * p; basis = p + ' pallets × ' + rng(r) + ' per pallet per month'; pre.pallets = p;
    }
    return { range: [lo, hi], basis: basis, kind: kind, prefill: pre };
  }

  /* ---------- reply builder ---------- */
  var ctx = { lastService: null, lastDest: null, lastIntent: null, lastQty: {}, lang: 'en', turns: 0 };
  function L(en, tl) { return ctx.lang === 'tl' && tl ? tl : en; }
  function src(path) { return path; }
  function docsFor(svc) { return N.documents[(svc && svc.docs) || 'customs']; }
  function shipment(no) { for (var i = 0; i < N.shipments.length; i++) if (N.shipments[i].no === no) return N.shipments[i]; return null; }
  function svcShort(s) { return s.name.replace(' · ', ' ').replace(/\s*\(.*\)/, ''); }

  function reply(q) {
    var P = prep(q), out = { q: q, text: '', cards: [], chips: [], source: '', intent: '', gap: false };
    ctx.turns++;
    ctx.lang = isTL(P) ? 'tl' : (P.toks.length > 2 ? 'en' : ctx.lang);

    var no = trackNo(q);
    var svc = findService(P), not = findNot(P), dests = findDests(P), dest = regionOf(dests), qty = findQty(P), port = findPort(P);
    var S = {}; Object.keys(V).forEach(function (k) { S[k] = score(P, V[k]); });
    var hasEntity = !!(svc || dest || no);

    /* follow-up like "how about air?" / "eh sa Davao?" repeats last intent */
    var hasQty = qty.kg != null || qty.cbm != null || qty.ctn != null || qty.pallets != null;
    var followWord = /^ ?(how about|what about|what if|eh|e|paano kung|pano kung|kung|sa|by|naman|and|tapos)\b/.test(P.n) || / naman /.test(P.n) || P.toks.length <= 2;
    var shortFollow = P.toks.length <= 6 && (svc || dest || hasQty) && followWord && !S.price && !S.docs && !S.transit && !S.handles && !S.track && ctx.lastIntent && ['price', 'docs', 'transit'].indexOf(ctx.lastIntent) > -1;
    if (S.price || S.docs || S.transit || shortFollow) { if (!svc && ctx.lastService) svc = ctx.lastService; if (!dest && ctx.lastDest) dest = ctx.lastDest; }
    ['kg', 'cbm', 'ctn', 'size', 'pallets'].forEach(function (k) { if (qty[k] == null && ctx.lastQty[k] != null && (S.price || shortFollow)) qty[k] = ctx.lastQty[k]; });

    var intent;
    if (no) intent = 'track';
    else if (S.human >= 1 && !svc) intent = 'human';
    else if (S.offtopic && !hasEntity && !S.about) intent = 'offtopic';
    else if (S.price) intent = 'price';
    else if (S.docs) intent = 'docs';
    else if (S.transit && (svc || dest)) intent = 'transit';
    else if (S.track) intent = 'track';
    else if (S.list) intent = 'list';
    else if (not) intent = 'not';
    else if (svc) intent = 'service';
    else if (S.quote) intent = 'quote';
    else if (S.contact) intent = 'contact';
    else if (S.hours) intent = 'hours';
    else if (S.location) intent = 'location';
    else if (S.coverage || (dest && (S.logi || P.toks.length <= 3))) intent = dest ? 'route' : 'coverage';
    else if (S.about) intent = 'about';
    else if (S.thanks) intent = 'thanks';
    else if (S.greet && P.toks.length <= 4) intent = 'greet';
    else intent = 'faq';
    if (shortFollow) intent = ctx.lastIntent;

    /* FAQ check (also overrides weak matches) */
    var faq = null, fs = 0;
    N.faqs.forEach(function (f) { var s = score(P, f.keys); if (s > fs) { fs = s; faq = f; } });
    if (intent === 'faq' && !(faq && fs >= 1)) intent = S.handles ? 'gap' : 'offtopic';
    if (faq && fs >= 2 && ['service', 'coverage', 'about', 'contact', 'hours'].indexOf(intent) > -1 && !svc) intent = 'faq';
    if (intent === 'transit' && faq && faq.id === 'clearance-time' && fs >= 2) intent = 'faq';

    out.intent = intent;
    var co = N.company, c = N.contacts;

    switch (intent) {
      case 'track': {
        if (!no) {
          out.text = L('Sure. What’s your Novus tracking number? It starts with NVF-.', 'Sige po. Ano po ang tracking number ninyo? Nagsisimula ito sa NVF-.');
          out.chips = N.shipments.slice(0, 3).map(function (s) { return 'Track ' + s.no; });
          out.source = 'Tracking › Logi-Sys shipment records';
          break;
        }
        var sh = shipment(no);
        if (!sh) {
          out.text = L('I couldn’t find ' + no + ' in Novus’s shipment records. Please check the number, or I can connect you to the team.', 'Wala po akong makitang ' + no + ' sa shipment records ng Novus. Pakicheck po ang number, o ikokonekta ko kayo sa team.');
          out.cards.push({ type: 'handoff' });
          out.chips = ['Track NVF-24117', 'Talk to a person'];
          out.source = 'Tracking › Logi-Sys shipment records';
          break;
        }
        var now = sh.events.filter(function (e) { return e[3] === 'now'; })[0] || sh.events[sh.events.length - 1];
        out.text = L(sh.no + ' is at “' + now[0] + '”: ' + now[2].charAt(0).toLowerCase() + now[2].slice(1) + '. ' + sh.eta + '.',
          'Ang ' + sh.no + ' ay nasa “' + now[0] + '” na: ' + now[2].charAt(0).toLowerCase() + now[2].slice(1) + '. ' + sh.eta + '.');
        out.cards.push({ type: 'track', sh: sh });
        ctx.lastService = N.services.filter(function (s) { return s.id === sh.service; })[0] || ctx.lastService;
        out.chips = sh.stage === 'customs' ? [L('What does assessment mean?', 'Ano ibig sabihin ng assessment?'), 'Talk to a person'] : ['Track another shipment', 'Talk to a person'];
        out.source = 'Tracking › Logi-Sys shipment ' + sh.no;
        break;
      }
      case 'service': {
        ctx.lastService = svc; if (dest) ctx.lastDest = dest;
        var routeTxt = '';
        if (dest && dest.region !== 'home') {
          var mode = svc.group === 'Air' ? 'air' : 'sea';
          var tt = dest[mode] && dest[mode] !== 'n/a' ? dest[mode] : '';
          if (dest.region === 'domesticland') routeTxt = L(' We deliver to ' + dest.name + ', ' + dest.sea + '.', ' Nagde-deliver po kami sa ' + dest.name + ', ' + dest.sea + '.');
          else routeTxt = tt ? L(' To ' + dest.name + ', it’s about ' + tt + ' in transit.', ' Papuntang ' + dest.name + ', mga ' + tt.replace(/ to /g, ' hanggang ').replace('days', 'araw').replace('day', 'araw') + ' ang biyahe.') : '';
          out.cards.push({ type: 'route', svc: svc, dest: dest, mode: mode, time: tt });
        }
        var portTxt = port ? L(' We work at ' + port.name + ' every day.', ' Araw-araw po kaming nasa ' + port.name + '.') : '';
        out.text = L('Yes, Novus handles ' + svcShort(svc) + '. ' + svc.summary + routeTxt + portTxt,
          'Opo, kaya namin ’yan. Nagha-handle ang Novus ng ' + svcShort(svc) + '. ' + svc.summary + routeTxt + portTxt);
        if (port) out.source = 'Services › ' + svc.name + ' + Coverage › ' + port.name;
        out.cards.unshift({ type: 'service', svc: svc, verdict: 'yes' });
        out.chips = [L('How much for that?', 'Magkano po ’yan?'), L('What documents do I need?', 'Anong documents ang kailangan?'), 'Get a quote'];
        out.source = out.source || 'Services › ' + svc.name;
        break;
      }
      case 'not': {
        out.text = L('No, sorry. ' + not.answer, 'Pasensya na po, hindi. ' + not.answer);
        out.cards.push({ type: 'verdict', verdict: 'no', title: not.name, body: not.answer });
        out.chips = ['What services do you offer?', 'Talk to a person'];
        out.source = 'Services › Not offered';
        break;
      }
      case 'price': {
        if (!svc) {
          if (dest) ctx.lastDest = dest;
          out.text = L('Happy to give a ballpark. Which service is it' + (dest ? ' to ' + dest.name : '') + '?', 'Sige po, bibigyan ko kayo ng ballpark. Anong service po' + (dest ? ' papuntang ' + dest.name : '') + '?');
          out.chips = ['Sea LCL', 'Sea FCL 20ft', 'Air freight', 'Customs brokerage'];
          out.source = 'Rates › Sample rate guide';
          break;
        }
        ctx.lastService = svc; if (dest) ctx.lastDest = dest; ctx.lastQty = qty;
        var est = estimate(svc, dest, qty);
        if (!est) {
          out.text = L(svc.name + ' is priced per project after we look at the cargo and the route, so there’s no fixed ballpark. Send the details and Novus will quote within one working day.',
            'Ang ' + svc.name + ' ay per project ang presyo, depende sa cargo at ruta, kaya walang fixed na ballpark. I-send lang po ang details at magqu-quote ang Novus within one working day.');
          out.cards.push({ type: 'quote', prefill: { svc: svc.id, dest: dest ? dest.name : '' } });
          out.source = 'Rates › ' + svc.name;
          break;
        }
        var fromDir = /\b(from|galing)\b/.test(P.n) && !/\b(to|papunta|papuntang)\b/.test(P.n);
        var where = dest && dest.region !== 'home' ? (svc.group === 'Air' || svc.group === 'Sea' ? (fromDir ? ' from ' : ' to ') + dest.name : ' for ' + dest.name) : '';
        if (fromDir) est.prefill.dir = 'Import';
        out.text = L('Ballpark for ' + svcShort(svc) + where + ': about ' + rng(est.range) + ' (' + est.basis + '). This is an estimate only; Novus confirms the final rate in writing.',
          'Ballpark po para sa ' + svcShort(svc) + where.replace(' to ', ' papuntang ').replace(' from ', ' mula ') + ': mga ' + rng(est.range).replace(' to ', ' hanggang ') + ' (' + est.basis + '). Estimate lang po ito; kinukumpirma ng Novus ang final rate in writing.');
        out.cards.push({ type: 'estimate', svc: svc, dest: dest, est: est });
        var follow = svc.group === 'Air' && !qty.kg ? L('What if it’s 300 kg?', 'Paano kung 300 kg?') : svc.estimate === 'lcl' && !qty.cbm ? L('What if it’s 5 CBM?', 'Paano kung 5 CBM?') : L('How long is the transit?', 'Gaano katagal ang biyahe?');
        out.chips = [follow, L('What documents do I need?', 'Anong documents ang kailangan?'), 'Talk to a person'];
        out.source = 'Rates › Sample rate guide › ' + svc.name;
        break;
      }
      case 'docs': {
        var d = docsFor(svc);
        if (svc) ctx.lastService = svc;
        out.text = L('Here’s what to prepare' + (svc ? ' for ' + svcShort(svc) : '') + '. Novus checks everything before it’s lodged, so you won’t be surprised at BOC.',
          'Ito po ang ihahanda' + (svc ? ' para sa ' + svcShort(svc) : '') + '. Che-check ng Novus lahat bago i-lodge, para walang gulatan sa BOC.');
        out.cards.push({ type: 'docs', doc: d });
        out.chips = [L('Do I need an import permit?', 'Kailangan ko ba ng import permit?'), svc ? L('How much for that?', 'Magkano po ’yan?') : 'Get a quote', 'Talk to a person'];
        out.source = 'Documents › ' + d.title;
        break;
      }
      case 'transit': {
        if (svc) ctx.lastService = svc; if (dest) ctx.lastDest = dest;
        if (!dest || dest.region === 'home') { out.text = L('Where is it going (or coming from)? Transit time depends on the route.', 'Saan po papunta (o galing)? Depende po sa ruta ang tagal.'); out.chips = ['Japan', 'China', 'Cebu', 'USA']; out.source = 'Coverage › Transit times'; break; }
        var m2 = svc && svc.group === 'Air' ? 'air' : 'sea', t2 = dest[m2];
        out.text = L('Manila to ' + dest.name + ' by ' + m2 + ' is about ' + t2 + ' in transit, port to port. Add 2 to 4 working days for customs at the import side.',
          'Manila papuntang ' + dest.name + ' by ' + m2 + ': mga ' + t2 + ' ang biyahe, port to port. Dagdag po ng 2 hanggang 4 working days para sa customs.');
        out.cards.push({ type: 'route', svc: svc, dest: dest, mode: m2, time: t2 });
        out.chips = [L('How much for that?', 'Magkano po ’yan?'), m2 === 'sea' ? L('How about by air?', 'Eh kung by air?') : L('How about by sea?', 'Eh kung by sea?'), 'Get a quote'];
        out.source = 'Coverage › Transit times › ' + dest.name;
        break;
      }
      case 'route': {
        ctx.lastDest = dest;
        var dom = dest.region === 'domestic' || dest.region === 'domesticland';
        out.text = dom
          ? L('Yes, Novus covers ' + dest.name + '. ' + (dest.region === 'domestic' ? 'Sea LCL and FCL from Manila take about ' + dest.sea + '; air about ' + dest.air + '.' : 'We deliver by truck, ' + dest.sea + '.'),
            'Opo, covered namin ang ' + dest.name + '. ' + (dest.region === 'domestic' ? 'Sea LCL at FCL mula Manila, mga ' + dest.sea + '; by air mga ' + dest.air + '.' : 'By truck po, ' + dest.sea + '.'))
          : L('Yes, Novus ships between the Philippines and ' + dest.name + ', by sea (about ' + dest.sea + ') or air (about ' + dest.air + ').',
            'Opo, nagshi-ship ang Novus papunta at galing ' + dest.name + ', by sea (mga ' + dest.sea + ') o by air (mga ' + dest.air + ').');
        out.cards.push({ type: 'route', svc: null, dest: dest, mode: 'sea', time: dest.sea });
        out.chips = [L('How much by sea LCL?', 'Magkano by sea LCL?'), L('How much by air?', 'Magkano by air?'), 'Get a quote'];
        out.source = 'Coverage › Destinations › ' + dest.name;
        break;
      }
      case 'coverage': {
        out.text = L('Novus works out of the main Philippine gateways and ships to and from Asia, the US, Europe, Australia and the Middle East. ' + N.otherPortsNote,
          'Ito po ang mga port na hawak ng Novus, at nagshi-ship kami papunta at galing Asia, US, Europe, Australia at Middle East. ' + N.otherPortsNote);
        out.cards.push({ type: 'ports' });
        out.chips = [L('Do you go to Davao?', 'May papuntang Davao ba?'), L('Do you ship to Japan?', 'Nagshi-ship ba kayo sa Japan?'), 'Get a quote'];
        out.source = 'Coverage › Ports';
        break;
      }
      case 'list': {
        out.text = L('Novus handles ' + N.services.length + ' services, from booking the space to delivering at your door. Tap one to see details.',
          'May ' + N.services.length + ' services po ang Novus, mula booking hanggang delivery sa pinto ninyo. I-tap lang para sa details.');
        out.cards.push({ type: 'list' });
        out.chips = ['Customs brokerage', 'Sea LCL', 'Air freight'];
        out.source = 'Services › All services';
        break;
      }
      case 'quote': {
        var pre = { svc: svc ? svc.id : (ctx.lastService ? ctx.lastService.id : ''), dest: dest ? dest.name : (ctx.lastDest ? ctx.lastDest.name : '') };
        out.text = L('Let’s start your quote. I’ve filled in what we talked about; you can finish it on the quote form and get an instant ballpark.',
          'Simulan na natin ang quote ninyo. Na-fill in ko na ang napag-usapan natin; tapusin lang sa quote form para sa instant ballpark.');
        out.cards.push({ type: 'quote', prefill: pre });
        out.source = 'Actions › Quote request';
        break;
      }
      case 'contact': case 'location': case 'hours': {
        out.text = intent === 'hours' ? L('Novus is open ' + co.hours + '. This assistant answers any time.', 'Bukas po ang Novus ' + co.hours + '. Itong assistant, sumasagot kahit anong oras.')
          : intent === 'location' ? L('Novus’s office: ' + co.address + '. Call ahead so the right person is there to meet you.', 'Ang office ng Novus: ' + co.address + '. Tumawag po muna para nandoon ang tamang tao.')
          : L('You can reach Novus at ' + c.phone + ', on Viber or WhatsApp at ' + c.mobile + ', or by email at ' + c.email + '.', 'Pwede po ninyong tawagan ang Novus sa ' + c.phone + ', sa Viber o WhatsApp sa ' + c.mobile + ', o mag-email sa ' + c.email + '.');
        out.cards.push({ type: 'handoff' });
        out.chips = ['Get a quote', 'What services do you offer?'];
        out.source = 'Company › Contacts';
        break;
      }
      case 'about': {
        out.text = L('', 'Ito po ang kwento ng Novus. ') + co.story.join(' ');
        out.cards.push({ type: 'about' });
        out.chips = ['What services do you offer?', 'Which ports do you cover?', 'Talk to a person'];
        out.source = 'Company › Profile';
        break;
      }
      case 'human': {
        out.text = L('Of course. A Novus coordinator can take it from here. Pick how you’d like to reach them; I can also send them this chat so you don’t repeat yourself.',
          'Sige po. Isang Novus coordinator ang tutulong sa inyo. Piliin kung paano ninyo sila gustong kontakin; pwede ko ring i-send sa kanila itong chat para hindi na kayo mag-ulit.');
        out.cards.push({ type: 'handoff', transcript: true });
        out.source = 'Company › Contacts';
        break;
      }
      case 'faq': {
        out.text = faq.a;
        out.chips = ['Get a quote', 'Talk to a person'];
        if (faq.id === 'track') out.chips = ['Track NVF-24117', 'Track NVF-24130'];
        out.source = 'FAQ › ' + faq.q;
        break;
      }
      case 'greet': {
        out.text = L('Hi! I’m Novus AI. Ask me anything about Novus Freight: services, rates, documents, ports, or your shipment.', 'Hello po! Ako si Novus AI. Magtanong lang tungkol sa Novus Freight: services, rates, documents, ports, o ang shipment ninyo.');
        out.chips = ['Do you handle customs?', 'Magkano LCL from China?', 'Track NVF-24117'];
        out.source = 'Company › Profile';
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
        out.text = L('I don’t have that in Novus’s information yet, so I won’t guess. A Novus coordinator can answer it for you.', 'Wala pa po ’yan sa information ng Novus, kaya hindi po ako manghuhula. Isang Novus coordinator ang sasagot sa inyo.');
        out.cards.push({ type: 'handoff', transcript: true });
        out.source = 'Not in knowledge base · sent to the team as a content gap';
        break;
      }
      default: { // offtopic
        out.intent = 'offtopic';
        out.gap = !S.offtopic && P.toks.length > 2;
        out.text = L('I’m Novus’s assistant, so I can only help with Novus Freight: shipping, customs, rates, documents and tracking. Is there something about your cargo I can help with?',
          'Assistant po ako ng Novus, kaya Novus Freight lang ang kaya kong sagutin: shipping, customs, rates, documents at tracking. May tanong po ba kayo tungkol sa cargo ninyo?');
        out.cards.push({ type: 'scope' });
        out.chips = ['What services do you offer?', 'Track NVF-24117', 'Get a quote'];
        out.source = 'Scope limit · Novus topics only';
      }
    }
    if (intent !== 'offtopic' && intent !== 'thanks' && intent !== 'greet') ctx.lastIntent = intent === 'route' ? 'transit' : intent;
    out.lang = ctx.lang;
    return out;
  }

  root.NovusAI = { reply: reply, ctx: ctx, estimate: estimate, peso: peso, norm: norm, reset: function () { ctx.lastService = ctx.lastDest = ctx.lastIntent = null; ctx.lastQty = {}; ctx.turns = 0; } };
})(typeof window !== 'undefined' ? window : globalThis);
