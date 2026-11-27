/* Ask page: full-page Novus AI chat */
(function () {
  'use strict';
  var N = window.NOVUS, $ = function (s) { return document.querySelector(s); };
  $('#askAv').innerHTML = window.NovusIcons.spark;
  $('#askEngine').innerHTML = window.NovusEngineSwitch.html();
  window.NovusEngineSwitch.wire($('#askEngine'));
  $('#kbStats').innerHTML = [
    ['Services (nfiph.com)', N.services.length], ['Service lines & cargo types', N.services.reduce(function (a, x) { return a + x.lines.length; }, 0)], ['Company story & values', N.company.history.length + N.company.values.length],
    ['Networks & accreditations', N.company.networks.length + N.company.accreditations.length], ['FAQs', N.faqs.length], ['Contacts', N.contacts.phones.length + N.contacts.emails.length], ['Shipments (sample)', N.shipments.length]
  ].map(function (r) { return '<div><span>' + r[0] + '</span><b>' + r[1] + '</b></div>'; }).join('');

  function mount() {
    window.NovusAI.reset();
    window.NovusPageChat = new window.NovusChat($('#askChat'), {
      id: 'aq',
      empty: window.NovusEmpty('Hi! I’m Novus AI.', 'Ask me if Novus Freight handles your cargo, who they are, what they’re accredited for, or where your shipment is.')
    });
  }
  mount();
  $('#newChat').addEventListener('click', function () { $('#askChat').innerHTML = ''; mount(); window.NovusPageChat.input.focus(); });
  var q = new URLSearchParams(location.search).get('q');
  if (q) window.NovusPageChat.ask(q.slice(0, 300));
})();
