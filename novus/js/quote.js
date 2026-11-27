/* Quote page: live ballpark estimate + mailto request (no backend) */
(function () {
  'use strict';
  var N = window.NOVUS, AI = window.NovusAI, U = window.NovusUtil, esc = window.NovusT.esc, R = N.rates;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var f = $('#qform');
  f.svc.innerHTML = N.services.map(function (s) { return '<option value="' + s.id + '">' + esc(s.name) + '</option>'; }).join('');
  var places = {};
  N.destinations.forEach(function (d) { places[d.name] = 1; });
  N.ports.forEach(function (p) { places[p.name] = 1; });
  $('#places').innerHTML = Object.keys(places).map(function (p) { return '<option value="' + esc(p) + '">'; }).join('');

  /* prefill from URL (Novus AI hands over the conversation this way) */
  var qs = new URLSearchParams(location.search), filled = [];
  function set(name, v) { if (v == null || v === '' || !f[name]) return; f[name].value = v; filled.push(f[name]); }
  set('svc', qs.get('svc'));
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
      if (AI.norm(d.name) && n.indexOf(' ' + AI.norm(d.name).split(' ')[0]) > -1) return d;
      for (var j = 0; j < d.aliases.length; j++) { var a = AI.norm(d.aliases[j]); if (a.length > 2 && n.indexOf(' ' + a + ' ') > -1) return d; }
    }
    if (/micp|south harbor|naia/.test(n)) return N.destinations.filter(function (d) { return d.id === 'manila'; })[0];
    return null;
  }
  function num(v) { var x = parseFloat(v); return isFinite(x) && x > 0 ? x : 0; }
  function peso(n) { return AI.peso(n); }
  function rng(a) { return peso(a[0]) + ' – ' + peso(a[1]); }

  function calc() {
    var svc = U.svcById(f.svc.value), o = findPlace(f.origin.value), d = findPlace(f.dest.value);
    var place = (o && o.region !== 'home') ? o : (d && d.region !== 'home') ? d : (d || o);
    var cbm = num(f.cbm.value), dimsCbm = num(f.L.value) * num(f.W.value) * num(f.H.value) / 1e6 * (num(f.pcs.value) || 1);
    if (!cbm && dimsCbm) cbm = Math.round(dimsCbm * 100) / 100;
    var kg = num(f.kg.value), chargeable = Math.max(kg, Math.round(cbm * 167));
    $('#estLines').innerHTML = ''; $('#estAi').innerHTML = '';
    var lines = [], lo = 0, hi = 0;
    var q = { kg: svc.group === 'Air' ? (chargeable || null) : (kg || null), cbm: cbm || null, ctn: num(f.ctn.value) || 1, size: f.size.value };
    var e = AI.estimate(svc, place, q);
    if (!e) {
      $('#estNum').textContent = 'Quoted per project';
      $('#estSub').textContent = svc.name + ' depends on the cargo, route and permits. Send the details and Novus replies within one working day.';
      $('#estNote').textContent = '';
      return;
    }
    lines.push([svc.name + (place && place.region !== 'home' ? ' · ' + place.name : ''), e.range, e.basis]);
    if (f.customs.checked && svc.id !== 'customs' && svc.id !== 'peza' && f.dir.value !== 'Domestic' && svc.id !== 'trucking' && svc.id !== 'warehousing') lines.push(['Customs brokerage', R.customs, 'Per entry, duties and taxes separate']);
    if (f.delivery.checked && svc.id !== 'trucking' && svc.id !== 'warehousing') lines.push(['Delivery to your door', svc.id === 'sea-fcl' ? R.trucking.trailer : R.trucking['4w'], svc.id === 'sea-fcl' ? 'Container trailer, Metro Manila' : 'Closed van, Metro Manila']);
    lines.forEach(function (l) { lo += l[1][0]; hi += l[1][1]; });
    $('#estNum').textContent = rng([lo, hi]);
    $('#estSub').textContent = place ? 'Ballpark ' + (place.region === 'home' ? 'within Metro Manila' : (f.dir.value === 'Import' ? 'from ' : 'to ') + place.name) + ' · ' + e.basis : 'Add an origin or destination for a sharper estimate. ' + e.basis;
    $('#estLines').innerHTML = lines.map(function (l) { return '<li><span>' + esc(l[0]) + '</span><b>' + rng(l[1]) + '</b></li>'; }).join('') +
      (f.insurance.checked ? '<li><span>Cargo insurance</span><b>Quoted separately</b></li>' : '');
    $('#estNote').textContent = R.note;
    // one-line AI verdict: compare sea LCL vs air when it matters
    if (place && /asia|far/.test(place.region) && (svc.id === 'air' || svc.id === 'sea-lcl') && (cbm || kg)) {
      var cb = Math.max(cbm || kg / 167, 1), ck = Math.max(kg, Math.round(cb * 167), R.air.minKg), reg = place.region;
      var sea = [R.lcl[reg][0] * cb, R.lcl[reg][1] * cb], air = [R.air[reg][0] * ck, R.air[reg][1] * ck];
      var save = ((air[0] + air[1]) - (sea[0] + sea[1])) / 2;
      if (save > 3000) $('#estAi').innerHTML = '<b>Novus AI:</b> ' + (svc.id === 'air' ? 'Sea LCL would save you about ' + peso(save) + ' on this shipment, if it can wait ' + place.sea + ' instead of ' + place.air + '.' : 'Good choice. By air this would cost about ' + peso(save) + ' more; sea LCL takes ' + place.sea + '.');
      else if (save < -3000) $('#estAi').innerHTML = '<b>Novus AI:</b> At this size, air is about as cheap as sea and much faster (' + place.air + '). Ask Novus to compare both.';
    } else if (svc.id === 'sea-lcl' && cbm >= 13) {
      $('#estAi').innerHTML = '<b>Novus AI:</b> At ' + cbm + ' CBM, a 20ft container (FCL) may cost less than LCL. Ask Novus to compare.';
    }
  }
  var mini = document.createElement('button');
  mini.type = 'button'; mini.className = 'est-mini'; mini.setAttribute('aria-label', 'See the estimate');
  document.body.appendChild(mini);
  mini.addEventListener('click', function () { $('.est').scrollIntoView({ behavior: 'smooth', block: 'center' }); });
  function syncMini() { mini.innerHTML = '<small>Estimate only</small><b>' + esc($('#estNum').textContent) + '</b><span>View ↓</span>'; }
  var calc0 = calc; calc = function () { calc0(); syncMini(); };
  f.addEventListener('input', calc); f.addEventListener('change', calc);
  calc();

  f.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var bad = [];
    ['name', 'email', 'phone'].forEach(function (n) { var el = f[n], ok = el.value.trim() && (n !== 'email' || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value)); el.classList.toggle('err', !ok); if (!ok) bad.push(n); });
    var msg = $('#qMsg');
    if (bad.length) { msg.className = 'form-msg bad'; msg.textContent = 'Please add your name, email and mobile so Novus can reply.'; f[bad[0]].focus(); return; }
    var svc = U.svcById(f.svc.value);
    var body = ['Quote request from the Novus website', '',
      'Service: ' + svc.name, 'Direction: ' + f.dir.value, 'Origin: ' + f.origin.value, 'Destination: ' + f.dest.value, 'Cargo: ' + f.cargo.value,
      'Weight: ' + (f.kg.value || '-') + ' kg', 'Volume: ' + (f.cbm.value || '-') + ' CBM', 'Dimensions: ' + [f.L.value, f.W.value, f.H.value].join(' x ') + ' cm, ' + (f.pcs.value || '-') + ' pcs',
      'Containers: ' + f.ctn.value + ' x ' + f.size.value + 'ft', 'Incoterm: ' + (f.inco.value || 'Not sure'), 'Ready date: ' + (f.ready.value || '-'),
      'Add-ons: ' + ['customs', 'delivery', 'insurance'].filter(function (k) { return f[k].checked; }).join(', '),
      'Website ballpark: ' + $('#estNum').textContent + ' (estimate only)', '',
      'Name: ' + f.name.value, 'Company: ' + f.company.value, 'Email: ' + f.email.value, 'Mobile: ' + f.phone.value].join('\n');
    msg.className = 'form-msg ok'; msg.textContent = 'Thanks, ' + f.name.value.split(' ')[0] + '. Your email app will open so you can send the request.';
    window.location.href = 'mailto:' + N.contacts.quotesEmail + '?subject=' + encodeURIComponent('Quote request: ' + svc.name + (f.dest.value ? ' to ' + f.dest.value : '')) + '&body=' + encodeURIComponent(body);
  });
})();
