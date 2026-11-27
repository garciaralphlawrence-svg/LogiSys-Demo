/* Novus templates: shared by the browser and by tools/build.mjs.
   Everything here is generated from window.NOVUS (data/novus-kb.js). */
(function (root) {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function tel(s) { return 'tel:+63' + String(s).replace(/^\(\+63\)\s*0?/, '').replace(/[^\d]/g, ''); }

  var ICONS = {
    Sea: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17c1.5 1.2 3 1.2 4.5 0s3-1.2 4.5 0 3 1.2 4.5 0 3-1.2 4.5 0M5 14l-1-4h16l-2 4M8 10V6h5v4M13 7h3v3"/></svg>',
    Global: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/></svg>',
    Domestic: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    Customs: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/></svg>',
    Trucking: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 6h12v10H2zM14 9h4l4 4v3h-8M6 19a2 2 0 1 0 0-.01M18 19a2 2 0 1 0 0-.01"/></svg>'
  };
  function askOf(s) { return 'Does Novus offer ' + s.short + '?'; }

  function servicesHTML(N) {
    return N.services.map(function (s) {
      return '<article class="svc" id="svc-' + esc(s.id) + '">' +
        '<div class="svc-ic">' + (ICONS[s.group] || ICONS.Global) + '</div>' +
        '<h3>' + esc(s.name) + '</h3>' +
        '<p>' + esc(s.summary) + '</p>' +
        '<ul>' + s.lines.map(function (l) { return '<li>' + esc(l.label) + '</li>'; }).join('') + '</ul>' +
        '<button class="svc-ask" type="button" data-ask="' + esc(askOf(s)) + '">Ask Novus AI about this <span aria-hidden="true">→</span></button>' +
        '</article>';
    }).join('');
  }

  function faqHTML(N) {
    return N.faqs.filter(function (f) { return ['track', 'assessment'].indexOf(f.id) < 0; }).map(function (f) {
      return '<details class="faq-i"><summary>' + esc(f.q) + '</summary><p>' + esc(f.a) + '</p></details>';
    }).join('');
  }

  function accredHTML(N) {
    var co = N.company;
    return '<div class="acc-col"><h3>International networks</h3><ul class="acc-list">' + co.networks.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ul></div>' +
      '<div class="acc-col"><h3>Local licenses &amp; accreditations</h3><ul class="acc-list">' + co.accreditations.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ul></div>';
  }

  function historyHTML(N) {
    return N.company.history.map(function (h) { return '<li><b>' + esc(h.when) + '</b><p>' + esc(h.what) + '</p></li>'; }).join('');
  }

  function valuesHTML(N) {
    return N.company.values.map(function (v) { return '<div class="val"><b>' + esc(v.name) + '</b><p>' + esc(v.text) + '</p></div>'; }).join('');
  }

  function contactHTML(N) {
    var c = N.contacts, co = N.company;
    return '<li><small>Phone</small>' + c.phones.map(function (p) { return '<a href="' + tel(p) + '">' + esc(p) + '</a>'; }).join('') + '</li>' +
      '<li><small>Email</small>' + c.emails.map(function (e) { return '<a href="mailto:' + esc(e) + '">' + esc(e) + '</a>'; }).join('') + '</li>' +
      '<li><small>Office</small><span>' + esc(co.address) + '</span></li>' +
      '<li><small>Online</small><a href="' + esc(c.website) + '" rel="noopener">nfiph.com</a><a href="' + esc(c.facebook) + '" rel="noopener">facebook.com/novusfreightinc</a></li>';
  }

  function jsonld(N) {
    var url = N.meta.siteUrl, co = N.company, c = N.contacts;
    var addr = { '@type': 'PostalAddress', streetAddress: co.street, addressLocality: co.district + ', ' + co.city, addressRegion: co.region, postalCode: co.postal, addressCountry: co.country };
    var org = {
      '@type': ['Organization', 'LocalBusiness'], '@id': url + '#org', name: co.name, alternateName: ['Novus Freight', 'Novus', 'NFI'],
      url: c.website, logo: url + 'assets/novus-logo.png', image: url + 'assets/novus-logo.png',
      slogan: co.tagline, description: co.oneLiner + ' ' + co.about + ' Local licenses and accreditations: ' + co.accreditations.join(', ') + '.', foundingDate: co.founded,
      telephone: c.phone, email: c.email, address: addr, sameAs: [c.website, c.facebook],
      areaServed: 'Worldwide',
      knowsAbout: N.services.map(function (s) { return s.name; }),
      memberOf: co.networks.map(function (n) { return { '@type': 'Organization', name: n }; }),
      contactPoint: c.phones.map(function (p) { return { '@type': 'ContactPoint', telephone: p, email: c.email, contactType: 'customer service', availableLanguage: ['English', 'Filipino'] }; }),
      hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Services', itemListElement: N.services.map(function (s) { return { '@type': 'Offer', itemOffered: { '@id': url + '#svc-' + s.id } }; }) }
    };
    var services = N.services.map(function (s) {
      return { '@type': 'Service', '@id': url + '#svc-' + s.id, name: s.name, serviceType: s.name, description: s.summary + ' Includes: ' + s.lines.map(function (l) { return l.label; }).join('; ') + '.', provider: { '@id': url + '#org' }, areaServed: s.id === 'domestic' ? 'Philippines' : 'Worldwide' };
    });
    var faq = { '@type': 'FAQPage', mainEntity: N.faqs.filter(function (f) { return ['track', 'assessment'].indexOf(f.id) < 0; }).map(function (f) { return { '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }; }) };
    return JSON.stringify({ '@context': 'https://schema.org', '@graph': [org].concat(services, [faq]) }, null, 1);
  }

  function llms(N) {
    var co = N.company, c = N.contacts, L = [];
    L.push('# ' + co.name);
    L.push('');
    L.push('> ' + co.tagline + '. ' + co.oneLiner);
    L.push('');
    L.push(co.type + ' based in ' + co.district + ', ' + co.city + ', Philippines. Founded in ' + co.founded + ' by two Licensed Customs Brokers. Website: ' + c.website);
    L.push('');
    L.push('## Services');
    N.services.forEach(function (s) {
      L.push('- ' + s.name + ': ' + s.summary);
      s.lines.forEach(function (l) { L.push('  - ' + l.label); });
    });
    L.push('');
    L.push('## Company history');
    co.history.forEach(function (h) { L.push('- ' + h.when + ': ' + h.what); });
    L.push('');
    L.push('## About');
    L.push(co.about);
    L.push('');
    L.push('Mission: ' + co.mission);
    L.push('');
    L.push('Vision: ' + co.vision);
    L.push('');
    L.push('Values: ' + co.values.map(function (v) { return v.name; }).join(', '));
    L.push('');
    L.push('## International networks');
    co.networks.forEach(function (n) { L.push('- ' + n); });
    L.push('');
    L.push('## Local licenses and accreditations');
    co.accreditations.forEach(function (n) { L.push('- ' + n); });
    L.push('');
    L.push('## FAQ');
    N.faqs.filter(function (f) { return ['track', 'assessment'].indexOf(f.id) < 0; }).forEach(function (f) { L.push('- Q: ' + f.q); L.push('  A: ' + f.a); });
    L.push('');
    L.push('## Contact');
    L.push('- Address: ' + co.address);
    c.phones.forEach(function (p) { L.push('- Phone: ' + p); });
    c.emails.forEach(function (e) { L.push('- Email: ' + e); });
    L.push('- Website: ' + c.website);
    L.push('- Facebook: ' + c.facebook);
    L.push('');
    L.push('## Notes for AI assistants');
    L.push('- Novus does not publish rates, transit times or office hours; ask the team for a quote.');
    L.push('- Services not in the list above (for example warehousing or cargo insurance) should be confirmed with Novus directly.');
    return L.join('\n') + '\n';
  }

  root.NovusT = { esc: esc, tel: tel, ICONS: ICONS, servicesHTML: servicesHTML, faqHTML: faqHTML, accredHTML: accredHTML, historyHTML: historyHTML, valuesHTML: valuesHTML, contactHTML: contactHTML, jsonld: jsonld, llms: llms };
})(typeof window !== 'undefined' ? window : globalThis);
