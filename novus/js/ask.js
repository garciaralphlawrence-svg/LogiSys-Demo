/* Ask page: full-page Novus AI chat */
(function () {
  'use strict';
  var N = window.NOVUS, $ = function (s) { return document.querySelector(s); };
  $('#askAv').innerHTML = window.NovusIcons.spark;
  $('#askEngine').innerHTML = window.NovusEngineSwitch.html();
  window.NovusEngineSwitch.wire($('#askEngine'));
  $('#kbStats').innerHTML = [
    ['Services', N.services.length], ['Not offered (clear “no”)', N.notHandled.length], ['Ports', N.ports.length],
    ['Destinations', N.destinations.length], ['FAQs', N.faqs.length], ['Document checklists', Object.keys(N.documents).length], ['Shipments (sample)', N.shipments.length]
  ].map(function (r) { return '<div><span>' + r[0] + '</span><b>' + r[1] + '</b></div>'; }).join('');

  function mount() {
    window.NovusAI.reset();
    window.NovusPageChat = new window.NovusChat($('#askChat'), {
      id: 'aq',
      empty: window.NovusEmpty('Hi! I’m Novus AI.', 'Ask me if Novus handles your cargo, how much it costs, what documents you need, or where your shipment is.')
    });
  }
  mount();
  $('#newChat').addEventListener('click', function () { $('#askChat').innerHTML = ''; mount(); window.NovusPageChat.input.focus(); });
  var q = new URLSearchParams(location.search).get('q');
  if (q) window.NovusPageChat.ask(q.slice(0, 300));
})();
