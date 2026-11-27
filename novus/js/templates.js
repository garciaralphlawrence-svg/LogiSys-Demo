/* Novus templates: shared by the browser and by tools/build.mjs.
   Everything here is generated from window.NOVUS (data/novus-kb.js). */
(function (root) {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function tel(s) { return 'tel:' + String(s).replace(/[^+\d]/g, ''); }

  var ICONS = {
    Sea: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17c1.5 1.2 3 1.2 4.5 0s3-1.2 4.5 0 3 1.2 4.5 0 3-1.2 4.5 0M5 14l-1-4h16l-2 4M8 10V6h5v4M13 7h3v3"/></svg>',
    Air: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15.5 13.5 11V5.5a1.5 1.5 0 0 0-3 0V11L3 15.5V17l7.5-2.2V19L8.5 20.5V22l3.5-1 3.5 1v-1.5L13.5 19v-4.2L21 17z"/></svg>',
    Customs: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l5 5v13H7zM14 3v5h5M10 13l2 2 4-4M10 18h6"/></svg>',
    Land: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 6h12v10H2zM14 9h4l4 4v3h-8M6 19a2 2 0 1 0 0-.01M18 19a2 2 0 1 0 0-.01"/></svg>',
    Special: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 21V9l5-3v15M9 9l11-4M15 6.8V13M13 13h4v3h-4zM2 21h20"/></svg>'
  };

  function servicesHTML(N) {
    return N.services.map(function (s) {
      return '<article class="svc" id="svc-' + esc(s.id) + '">' +
        '<div class="svc-ic">' + (ICONS[s.group] || ICONS.Sea) + '</div>' +
        '<p class="svc-g">' + esc(s.group) + '</p>' +
        '<h3>' + esc(s.name) + '</h3>' +
        '<p>' + esc(s.summary) + '</p>' +
        '<ul>' + s.details.slice(0, 3).map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('') + '</ul>' +
        '<button class="svc-ask" type="button" data-ask="Do you handle ' + esc(s.name.replace(' · ', ' ').replace(/\s*\(.*\)/, '')) + '?">Ask Novus AI about this <span aria-hidden="true">→</span></button>' +
        '</article>';
    }).join('');
  }

  function faqHTML(N) {
    return N.faqs.map(function (f) {
      return '<details class="faq-i"><summary>' + esc(f.q) + '</summary><p>' + esc(f.a) + '</p></details>';
    }).join('');
  }

  function portsHTML(N) {
    return N.ports.map(function (p) {
      return '<li><b>' + esc(p.name) + '</b><span class="tag">' + esc(p.mode) + '</span><small>' + esc(p.note) + '</small></li>';
    }).join('');
  }

  function contactHTML(N) {
    var c = N.contacts, co = N.company;
    return '<li><small>Call</small><a href="' + tel(c.phone) + '">' + esc(c.phone) + '</a></li>' +
      '<li><small>Viber / WhatsApp</small><a href="' + tel(c.mobile) + '">' + esc(c.mobile) + '</a></li>' +
      '<li><small>Email</small><a href="mailto:' + esc(c.email) + '">' + esc(c.email) + '</a></li>' +
      '<li><small>Office hours</small><span>' + esc(co.hours) + '</span></li>' +
      '<li><small>Office</small><span>' + esc(co.address) + '</span></li>';
  }

  function jsonld(N) {
    var url = N.meta.siteUrl, co = N.company, c = N.contacts;
    var org = {
      '@type': 'Organization', '@id': url + '#org', name: co.name, url: url,
      description: co.oneLiner, telephone: c.phone, email: c.email,
      address: { '@type': 'PostalAddress', streetAddress: co.address, addressLocality: co.city, addressRegion: co.region, addressCountry: co.country },
      areaServed: ['Philippines'].concat(N.destinations.filter(function (d) { return ['eastasia', 'seasia', 'far'].indexOf(d.region) > -1; }).map(function (d) { return d.name; })),
      knowsAbout: N.services.map(function (s) { return s.name; }),
      contactPoint: { '@type': 'ContactPoint', telephone: c.phone, email: c.email, contactType: 'customer service', availableLanguage: ['English', 'Filipino'] }
    };
    if (co.legalName) org.legalName = co.legalName;
    if (c.facebook) org.sameAs = [c.facebook];
    var services = N.services.filter(function (s) { return s.handles; }).map(function (s) {
      return { '@type': 'Service', name: s.name, serviceType: s.group + ' freight service', description: s.summary, provider: { '@id': url + '#org' }, areaServed: 'Philippines', url: url + '#svc-' + s.id };
    });
    var faq = { '@type': 'FAQPage', mainEntity: N.faqs.map(function (f) { return { '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }; }) };
    return JSON.stringify({ '@context': 'https://schema.org', '@graph': [org].concat(services, [faq]) }, null, 1);
  }

  function llms(N) {
    var co = N.company, c = N.contacts, L = [];
    L.push('# ' + co.name);
    L.push('');
    L.push('> ' + co.oneLiner);
    L.push('');
    if (N.meta.sample) { L.push('Note: this file is a demo built from sample data. Details will be replaced once ' + co.name + ' confirms them.'); L.push(''); }
    L.push(co.type + ' based in ' + co.city + ', Philippines. Answers questions in English and Filipino (Tagalog, Taglish).');
    L.push('');
    L.push('## Services');
    N.services.filter(function (s) { return s.handles; }).forEach(function (s) { L.push('- [' + s.name + '](' + N.meta.siteUrl + '#svc-' + s.id + '): ' + s.summary); });
    L.push('');
    L.push('## Not offered');
    N.notHandled.forEach(function (n) { L.push('- ' + n.answer); });
    L.push('');
    L.push('## Ports and coverage');
    N.ports.forEach(function (p) { L.push('- ' + p.name + ' (' + p.mode + '): ' + p.note); });
    L.push('- ' + N.otherPortsNote);
    L.push('');
    L.push('## Documents');
    Object.keys(N.documents).forEach(function (k) { var d = N.documents[k]; L.push('- ' + d.title + ': ' + d.items.join('; ')); });
    L.push('');
    L.push('## FAQ');
    N.faqs.forEach(function (f) { L.push('- Q: ' + f.q); L.push('  A: ' + f.a); });
    L.push('');
    L.push('## Contact');
    L.push('- Phone: ' + c.phone);
    L.push('- Viber / WhatsApp: ' + c.mobile);
    L.push('- Email: ' + c.email);
    L.push('- Hours: ' + co.hours);
    L.push('- Office: ' + co.address);
    L.push('');
    L.push('## Pages');
    L.push('- [Overview](' + N.meta.siteUrl + 'index.html)');
    L.push('- [Ask Novus AI](' + N.meta.siteUrl + 'ask.html): assistant that answers from this information');
    L.push('- [Track a shipment](' + N.meta.siteUrl + 'track.html)');
    L.push('- [Get a quote](' + N.meta.siteUrl + 'quote.html)');
    return L.join('\n') + '\n';
  }

  root.NovusT = { esc: esc, tel: tel, ICONS: ICONS, servicesHTML: servicesHTML, faqHTML: faqHTML, portsHTML: portsHTML, contactHTML: contactHTML, jsonld: jsonld, llms: llms };
})(typeof window !== 'undefined' ? window : globalThis);
