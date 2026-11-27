/* Quote page: request to Novus by email (no backend) + a DEMO ballpark (not Novus's rates) */
(function () {
  'use strict';
  var N = window.NOVUS, AI = window.NovusAI, U = window.NovusUtil, esc = window.NovusT.esc, R = N.rates;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var f = $('#qform');

  /* service options = Novus's real service lines */
  var OPTS = [];
  N.services.forEach(function (s) {
    s.lines.forEach(function (l) {
      if (s.id === 'customs' && l.id !== 'cc-impexp') return;      // cargo types are a separate field
      if (s.id === 'international' && l.id === 'intl-sea-air') { OPTS.push([s, l, s.short + ' · Import & Export by sea']); return; }
      OPTS.push([s, l, s.short + ' · ' + l.label.replace(/\s*\(foreign.*\)/i, '')]);
    });
  });
  f.svc.innerHTML = OPTS.map(function (o, i) { return '<option value="' + i + '">' + esc(o[2]) + '</option>'; }).join('');
  var places = {};
  N.destinations.forEach(function (d) { places[d.name] = 1; });
  $('#places').innerHTML = Object.keys(places).map(function (p) { return '<option value="' + esc(p) + '">'; }).join('');

  /* prefill from URL (Novus AI hands over the conversation this way) */
  var qs = new URLSearchParams(location.search), filled = [];
  function set(name, v) { if (v == null || v === '' || !f[name]) return; f[name].value = v; filled.push(f[name]); }
  var ps = qs.get('svc'), pl = qs.get('line'), pm = qs.get('mode');
  if (ps) {
    var idx = -1;
    OPTS.forEach(function (o, i) { if (idx < 0 && o[0].id === ps && (!pl || o[1].id === pl)) idx = i; });
    if (pm === 'air') OPTS.forEach(function (o, i) { if (o[1].id === 'air' && ps === 'international') idx = i; });
    if (pl && ['perishable', 'peza', 'breakbulk', 'project', 'general'].indexOf(pl) > -1) { var ct = { perishable: 'Perishable cargo', peza: 'PEZA cargo', breakbulk: 'Breakbulk cargo', project: 'Project cargo', general: 'General cargo' }[pl]; set('ctype', ct); }
    if (idx < 0) OPTS.forEach(function (o, i) { if (idx < 0 && o[0].id === ps) idx = i; });
    if (idx > -1) set('svc', String(idx));
  }
  var dir = qs.get('dir'), dest = qs.get('dest');
  if (dest) {
    var dObj = findPlace(dest), dom = dObj && /domestic/.test(dObj.region);
    if (dir === 'Import') { set('dir', 'Import'); set('origin', dest); set('dest', 'Manila'); }
    else { set('dir', dom ? 'Domestic' : 'Export'); set('origin', 'Manila'); set('dest', dest); }
  }
  set('kg', qs.get('kg')); set('cbm', qs.get('cbm')); set('ctn', qs.get('ctn')); set('size', qs.get('size'));
  if (filled.length) setTimeout(function () { filled.forEach(function (el) { el.classList.add('prefilled'); }); $('#qMsg').className = 'form-msg ok'; $('#qMsg').textContent = 'Pre-filled from your Novus AI chat.'; }, 300);

  function findPlace(txt) {
    if (!txt) return null;
    var n = ' ' + AI.norm(txt) + ' ';
    for (var i = 0; i < N.destinations.length; i++) {
      var d = N.destinations[i];
      if (n.indexOf(' ' + AI.norm(d.name).split(' ')[0] + ' ') > -1) return d;
      for (var j = 0; j < d.aliases.length; j++) { var a = AI.norm(d.aliases[j]); if (a.length > 2 && n.indexOf(' ' + a + ' ') > -1) return d; }
    }
    return null;
  }
  function num(v) { var x = parseFloat(v); return isFinite(x) && x > 0 ? x : 0; }
  function rng(a) { return AI.peso(a[0]) + ' – ' + AI.peso(a[1]); }

  function calc() {
    var o = OPTS[+f.svc.value] || OPTS[0], svc = o[0], line = o[1];
    var oP = findPlace(f.origin.value), dP = findPlace(f.dest.value);
    var place = (oP && oP.region !== 'home') ? oP : (dP && dP.region !== 'home') ? dP : (dP || oP);
    var cbm = num(f.cbm.value), dimsCbm = num(f.L.value) * num(f.W.value) * num(f.H.value) / 1e6 * (num(f.pcs.value) || 1);
    if (!cbm && dimsCbm) cbm = Math.round(dimsCbm * 100) / 100;
    var kg = num(f.kg.value), chargeable = Math.max(kg, Math.round(cbm * 167));
    $('#estAi').innerHTML = '';
    var kind = line.estimate || svc.estimate;
    var e = AI.estimate(svc, place, { kg: kind === 'air' ? (chargeable || null) : (kg || null), cbm: cbm || null, ctn: num(f.ctn.value) || 1, size: f.size.value }, line, kind);
    var lines = [], lo = 0, hi = 0;
    lines.push([o[2] + (place && place.region !== 'home' ? ' · ' + place.name : ''), e.range]);
    if (f.customs.checked && svc.id !== 'customs' && svc.id !== 'trucking' && svc.id !== 'domestic' && f.dir.value !== 'Domestic') lines.push(['Customs clearance (' + f.ctype.value.toLowerCase() + ')', R.customs]);
    if (f.delivery.checked && svc.id !== 'trucking') lines.push(['Trucking to your door', svc.id === 'nvocc' && line.id === 'fcl' ? R.trucking.trailer : R.trucking['4w']]);
    lines.forEach(function (l) { lo += l[1][0]; hi += l[1][1]; });
    $('#estNum').textContent = rng([lo, hi]);
    $('#estSub').textContent = (place ? 'Demo ballpark ' + (place.region === 'home' ? 'within Metro Manila' : (f.dir.value === 'Import' ? 'from ' : 'to ') + place.name) + ' · ' : 'Add an origin or destination. ') + e.basis;
    $('#estLines').innerHTML = lines.map(function (l) { return '<li><span>' + esc(l[0]) + '</span><b>' + rng(l[1]) + '</b></li>'; }).join('');
    $('#estNote').textContent = R.note + ' Novus Freight Inc. replies with the actual rate.';
    if (line.id === 'lcl' && cbm >= 13) $('#estAi').innerHTML = '<b>Novus AI:</b> At ' + cbm + ' CBM, a full container (FCL) may cost less than LCL consolidation. Ask Novus to compare both.';
    else if (f.ctype.value === 'Perishable cargo') $('#estAi').innerHTML = '<b>Novus AI:</b> Perishable cargo is one of the cargo types Novus clears. Mention temperature needs in the cargo field so the team can plan.';
    else if (f.ctype.value === 'PEZA cargo') $('#estAi').innerHTML = '<b>Novus AI:</b> PEZA cargo is one of the cargo types Novus clears, and PEZA is among Novus’s accreditations.';
    else if (line.id === 'triangular') $('#estAi').innerHTML = '<b>Novus AI:</b> Triangular shipments (foreign country to foreign country) are part of Novus’s international freight forwarding.';
  }
  var mini = document.createElement('button');
  mini.type = 'button'; mini.className = 'est-mini'; mini.setAttribute('aria-label', 'See the demo estimate');
  document.body.appendChild(mini);
  mini.addEventListener('click', function () { $('.est').scrollIntoView({ behavior: 'smooth', block: 'center' }); });
  function run() { calc(); mini.innerHTML = '<small>Demo estimate</small><b>' + esc($('#estNum').textContent) + '</b><span>View ↓</span>'; }
  f.addEventListener('input', run); f.addEventListener('change', run);
  run();

  f.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var bad = [];
    ['name', 'email', 'phone'].forEach(function (n) { var el = f[n], ok = el.value.trim() && (n !== 'email' || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value)); el.classList.toggle('err', !ok); if (!ok) bad.push(n); });
    var msg = $('#qMsg');
    if (bad.length) { msg.className = 'form-msg bad'; msg.textContent = 'Please add your name, email and mobile so Novus can reply.'; f[bad[0]].focus(); return; }
    var o = OPTS[+f.svc.value];
    var body = ['Quote request (via Novus AI demo)', '',
      'Service: ' + o[2], 'Direction: ' + f.dir.value, 'Cargo type: ' + f.ctype.value, 'Origin: ' + f.origin.value, 'Destination: ' + f.dest.value, 'Cargo: ' + f.cargo.value,
      'Weight: ' + (f.kg.value || '-') + ' kg', 'Volume: ' + (f.cbm.value || '-') + ' CBM', 'Dimensions: ' + [f.L.value, f.W.value, f.H.value].join(' x ') + ' cm, ' + (f.pcs.value || '-') + ' pcs',
      'Containers: ' + f.ctn.value + ' x ' + f.size.value + 'ft', 'Terms: ' + (f.inco.value || 'Not sure'), 'Ready date: ' + (f.ready.value || '-'),
      'Add-ons: ' + ['customs', 'delivery'].filter(function (k) { return f[k].checked; }).join(', '), '',
      'Name: ' + f.name.value, 'Company: ' + f.company.value, 'Email: ' + f.email.value, 'Mobile: ' + f.phone.value].join('\n');
    msg.className = 'form-msg ok'; msg.textContent = 'Thanks, ' + f.name.value.split(' ')[0] + '. Your email app will open so you can send the request to Novus.';
    window.location.href = 'mailto:' + N.contacts.quotesEmail + '?subject=' + encodeURIComponent('Quote request: ' + o[2] + (f.dest.value ? ' to ' + f.dest.value : '')) + '&body=' + encodeURIComponent(body);
  });
})();
