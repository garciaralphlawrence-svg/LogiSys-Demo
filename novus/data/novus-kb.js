/* =====================================================================
   NOVUS FREIGHT INC. · KNOWLEDGE BASE (the ONLY place company facts live)
   ---------------------------------------------------------------------
   Company facts below are taken from Novus's own website, nfiph.com
   (read 27 Nov 2026). Do not add facts that Novus has not published or
   confirmed. Things NOT on their site (prices, port list, transit
   times, office hours, warehousing) are deliberately left out or
   labelled "demo".

   Everything on the demo (website text, Novus AI answers, llms.txt and
   schema.org JSON-LD) is generated from this file.
     1. Edit the values below (keep the field names).
     2. Run:  node novus/tools/build.mjs   (from the repo root)
   ===================================================================== */
window.NOVUS = {
  meta: {
    sample: true,                 // true = ribbon says operational numbers (shipments, rates, dashboard) are sample
    source: 'nfiph.com',
    kbVersion: 'nfiph-2026-11-27',
    siteUrl: 'https://garciaralphlawrence-svg.github.io/LogiSys-Demo/novus/'
  },

  company: {
    name: 'Novus Freight Inc.',
    shortName: 'Novus',
    legalName: 'Novus Freight Inc.',
    tagline: 'Your Gateway to Global Market',
    headline: 'Seamless Global Logistics Solutions',
    oneLiner: 'Expert international freight forwarding, customs clearance, and worldwide delivery services for businesses of all sizes.',
    type: 'Freight forwarder, NVOCC and customs broker',
    about: 'Novus-Freight Inc. is a reliable partner in the logistics industry, providing administrative support for freight forwarding, customs brokerage, and other markets. The company’s services ensure a seamless and efficient flow of goods across borders. Novus-Freight Inc. is committed to excellence, tailoring services to meet clients’ specific needs, and delivering innovative solutions with a team of seasoned professionals.',
    history: [
      { when: '2017', what: 'Started as JBC Customs Brokerage, founded by two Licensed Customs Brokers and registered with the DTI. Focused on customs brokerage.' },
      { when: 'Sept 2020', what: 'Rebranded as Novus Cargo Logistics Inc.' },
      { when: 'July 2021', what: 'Became Novus Freight Inc., registered with the SEC.' },
      { when: 'COVID-19 years', what: 'Expanded into a One-Stop Shop Logistics provider: international and domestic freight forwarding, customs brokerage and trucking. Grew stronger through the pandemic.' }
    ],
    founded: '2017',
    mission: 'To provide customer satisfaction by delivering quality services in a cost-effective and reliable solution resulting in a long-term partnership with our client.',
    vision: 'The organization envisions one of the most reliable and valued logistics providers. We strived to provide our clients with the best QUALITY and EFFICIENT service possible with the continual development at hand.',
    values: [
      { name: 'Accountability', text: 'We are committed to delivering outstanding service, assuming full responsibility for our actions, and collaborating as a team to achieve our company’s goals.' },
      { name: 'Integrity', text: 'We always do the right thing and handle our business professionally and ethically. We act with unwavering integrity, honesty, and dignity, never compromising on the truth.' },
      { name: 'Quality', text: 'Our primary goal is consistently delivering exceptional service by meeting the highest standards and continuously improving our work procedures.' },
      { name: 'Innovation', text: 'Our company is dedicated to identifying the market’s most demanding needs and delivering unparalleled experiences to our customers. We commit our resources to achieving excellence in quality and exceeding customer expectations.' }
    ],
    siteClaims: { countries: '50+', support: '24/7' },   // as shown on nfiph.com
    networks: ['WCA World', 'JC Trans', 'All World Shipping'],
    accreditations: ['PEZA', 'Department of Finance', 'PMTLAI', 'Civil Aeronautics Board', 'DOLE', 'DTI', 'National Privacy Commission'],
    address: 'Unit 406, No.303 Noah’s Ark Building, Brgy. 291 Escolta St., Binondo, Manila, Philippines 1006',
    street: 'Unit 406, No.303 Noah’s Ark Building, Brgy. 291 Escolta St.',
    district: 'Binondo',
    city: 'Manila',
    postal: '1006',
    region: 'Metro Manila',
    country: 'PH',
    hours: null                    // not published on nfiph.com
  },

  contacts: {
    phone: '(+63) 02 8637-7930',
    phones: ['(+63) 02 8637-7930', '(+63) 02 8687-6353', '(+63) 02 8682-9871', '(+63) 02 8682-2754'],
    email: 'inquirynovus@nfiph.com',
    emails: ['inquirynovus@nfiph.com', 'infonovus@nfiph.com'],
    quotesEmail: 'inquirynovus@nfiph.com',
    facebook: 'https://facebook.com/novusfreightinc',
    website: 'https://nfiph.com'
  },

  /* ---------------- SERVICES (exactly the list on nfiph.com) ----------------
     lines = the exact sub-items Novus lists. "say" is how Novus AI confirms it.
     aliases = words people type (English, Tagalog, Taglish, typos).
     estimate = which DEMO ballpark to use (not Novus's rates).              */
  services: [
    {
      id: 'nvocc', name: 'Non-Vessel Operating Common Carrier (NVOCC)', short: 'NVOCC', group: 'Sea',
      aliases: ['nvocc', 'non vessel', 'non-vessel operating common carrier', 'common carrier', 'sea freight', 'ocean freight', 'by sea', 'dagat', 'barko', 'container', 'kontainer', 'shipping line'],
      summary: 'Novus operates as an NVOCC for full container loads (FCL) and LCL consolidation cargo.',
      estimate: 'lcl',
      lines: [
        { id: 'fcl', label: 'FCL', aliases: ['fcl', 'full container', 'full container load', '20ft', '40ft', '20 footer', '40 footer', '40hc', 'buong container'], say: 'FCL (full container load) is part of Novus’s NVOCC service', estimate: 'fcl' },
        { id: 'lcl', label: 'LCL (consolidation cargo)', aliases: ['lcl', 'less than container', 'consolidation', 'consol', 'consolidated', 'shared container', 'per cbm', 'by cbm', 'small shipment', 'konting cargo', 'ilang kahon'], say: 'LCL consolidation cargo is part of Novus’s NVOCC service', estimate: 'lcl' }
      ]
    },
    {
      id: 'international', name: 'International Freight Forwarding', short: 'International freight forwarding', group: 'Global',
      aliases: ['international', 'freight forwarding', 'forwarder', 'forwarding', 'abroad', 'overseas', 'ibang bansa', 'global', 'worldwide', 'import', 'export', 'mag import', 'mag export', 'importation', 'exportation'],
      summary: 'Import and export by sea and air, triangular shipments between foreign countries, and processing and releasing.',
      estimate: 'lcl',
      lines: [
        { id: 'intl-sea-air', label: 'Import & Export (Sea and Air)', aliases: ['import and export', 'import export', 'sea and air'], say: 'import and export by sea and air is part of Novus’s international freight forwarding' },
        { id: 'air', label: 'Import & Export by air', aliases: ['air', 'air freight', 'airfreight', 'air cargo', 'by air', 'eroplano', 'plane cargo', 'flight', 'naia', 'urgent', 'mabilis'], say: 'air freight (import and export) is part of Novus’s international freight forwarding', estimate: 'air' },
        { id: 'triangular', label: 'Triangular Shipments (foreign countries to other foreign countries)', aliases: ['triangular', 'triangle shipment', 'cross trade', 'cross-trade', 'third country', 'foreign to foreign', 'country to country', 'hindi dadaan ng pilipinas'], say: 'triangular shipments, from one foreign country to another, are part of Novus’s international freight forwarding' },
        { id: 'processing', label: 'Processing and Releasing', aliases: ['processing', 'releasing', 'processing and releasing', 'pa release', 'ma release'], say: 'processing and releasing is part of Novus’s international freight forwarding' }
      ]
    },
    {
      id: 'domestic', name: 'Domestic / Local Freight Forwarding', short: 'Domestic freight forwarding', group: 'Domestic',
      aliases: ['domestic', 'local', 'local freight', 'domestic freight', 'inter island', 'interisland', 'province', 'probinsya', 'within the philippines', 'sa loob ng pilipinas', 'visayas', 'mindanao', 'luzon'],
      summary: 'Domestic and local freight forwarding across the Philippines by sea, land and air.',
      estimate: 'lcl',
      lines: [
        { id: 'dom-sea', label: 'Sea', aliases: ['domestic sea', 'by boat', 'roro', 'inter island shipping'], say: 'domestic freight by sea is part of Novus’s local freight forwarding' },
        { id: 'dom-land', label: 'Land', aliases: ['by land', 'by truck', 'land transport'], say: 'domestic freight by land is part of Novus’s local freight forwarding', estimate: 'trucking' },
        { id: 'dom-air', label: 'Air', aliases: ['domestic air', 'local air'], say: 'domestic freight by air is part of Novus’s local freight forwarding', estimate: 'air' }
      ]
    },
    {
      id: 'customs', name: 'Customs Clearances', short: 'Customs clearance', group: 'Customs',
      aliases: ['customs', 'customs clearance', 'clearance', 'customs broker', 'customs brokerage', 'broker', 'brokerage', 'boc', 'bureau of customs', 'e2m', 'declaration', 'entry', 'duties', 'taxes', 'aduana', 'clear', 'paclear', 'pa clear', 'mag clear', 'customs release', 'licensed customs broker'],
      summary: 'Import and export customs clearance under CIF, CFR, DDP and DDU, for general, perishable, PEZA, breakbulk and project cargoes.',
      estimate: 'customs',
      lines: [
        { id: 'cc-impexp', label: 'Import & Export', aliases: ['import clearance', 'export clearance', 'import customs', 'export customs'], say: 'import and export clearance is part of Novus’s customs clearance service' },
        { id: 'incoterms', label: 'CIF, CFR, DDP, DDU', aliases: ['cif', 'cfr', 'ddp', 'ddu', 'incoterm', 'incoterms', 'delivered duty paid', 'cost insurance freight', 'cost and freight', 'delivered duty unpaid'], say: 'Novus clears shipments under CIF, CFR, DDP and DDU terms' },
        { id: 'general', label: 'General Cargoes', aliases: ['general cargo', 'general cargoes', 'dry cargo', 'ordinary cargo'], say: 'general cargo is one of the cargo types Novus clears' },
        { id: 'perishable', label: 'Perishable Cargoes', aliases: ['perishable', 'perishables', 'perishable cargo', 'frozen', 'chilled', 'reefer', 'food', 'fresh', 'fruits', 'vegetables', 'seafood', 'meat', 'nabubulok', 'pagkain', 'gulay', 'prutas'], say: 'perishable cargo is one of the cargo types Novus clears' },
        { id: 'peza', label: 'PEZA Cargoes', aliases: ['peza', 'ecozone', 'eco zone', 'economic zone', 'export processing zone', 'locator', 'peza cargo', 'freeport', 'boat note'], say: 'PEZA cargo is one of the cargo types Novus clears (Novus also lists PEZA among its accreditations)' },
        { id: 'breakbulk', label: 'Breakbulk Cargoes', aliases: ['breakbulk', 'break bulk', 'break-bulk', 'bulk cargo', 'loose cargo'], say: 'breakbulk cargo is one of the cargo types Novus clears' },
        { id: 'project', label: 'Project Cargoes', aliases: ['project cargo', 'project cargoes', 'heavy equipment', 'machinery', 'makina', 'oversized', 'out of gauge', 'heavy lift', 'generator'], say: 'project cargo is one of the cargo types Novus clears' }
      ]
    },
    {
      id: 'trucking', name: 'Trucking Services', short: 'Trucking', group: 'Trucking',
      aliases: ['trucking', 'truck', 'trak', 'delivery', 'deliver', 'hatid', 'ihatid', 'pickup', 'pick up', 'hakot', 'hauling', 'haulage', 'pull out', 'pullout'],
      summary: 'Trailer trucks, small trucks, and winged van and closed van trucking.',
      estimate: 'trucking',
      lines: [
        { id: 'trailer', label: 'Trailer Trucks', aliases: ['trailer', 'trailer truck', 'container trailer', 'prime mover', 'chassis'], say: 'trailer trucks are part of Novus’s trucking services' },
        { id: 'small', label: 'Small Trucks', aliases: ['small truck', 'small trucks', 'elf', '4 wheeler', '6 wheeler', 'maliit na truck'], say: 'small trucks are part of Novus’s trucking services' },
        { id: 'van', label: 'Winged Van & Closed Van', aliases: ['wing van', 'winged van', 'wingvan', 'closed van', 'close van', 'van'], say: 'winged van and closed van trucking are part of Novus’s trucking services' }
      ]
    }
  ],

  /* Services NOT listed on nfiph.com. Novus AI says so plainly and offers the team. */
  notListed: [
    { id: 'warehousing', name: 'Warehousing / storage', aliases: ['warehouse', 'warehousing', 'storage', 'bodega', 'imbakan', 'fulfillment', 'fulfilment', 'pallet storage', 'inventory'] },
    { id: 'insurance', name: 'Cargo insurance', aliases: ['insurance', 'insure', 'insured', 'seguro'] },
    { id: 'courier', name: 'Courier / parcel delivery', aliases: ['courier', 'parcel', 'lbc', 'door to door parcel', 'balikbayan', 'padala box'] },
    { id: 'packing', name: 'Packing and crating', aliases: ['packing', 'crating', 'packaging', 'palletizing'] },
    { id: 'permits', name: 'Import permits (FDA, BPI, etc.)', aliases: ['permit', 'permits', 'import permit', 'fda', 'bpi', 'bfar', 'ntc', 'license to import'] },
    { id: 'travel', name: 'Passenger tickets and travel', aliases: ['plane ticket', 'airline ticket', 'ticket', 'tickets', 'travel', 'tour', 'passenger', 'visa'] },
    { id: 'remittance', name: 'Money remittance', aliases: ['remittance', 'padala pera', 'send money', 'money transfer'] }
  ],

  /* Places people ask about. Region is used ONLY for the demo ballpark.
     Novus does not publish a port list or transit times.                 */
  destinations: [
    { id: 'japan', name: 'Japan', region: 'eastasia', aliases: ['japan', 'japon', 'hapon', 'tokyo', 'osaka', 'nagoya', 'yokohama', 'narita'] },
    { id: 'china', name: 'China', region: 'eastasia', aliases: ['china', 'tsina', 'shanghai', 'shenzhen', 'guangzhou', 'ningbo', 'xiamen', 'yiwu', 'qingdao'] },
    { id: 'hongkong', name: 'Hong Kong', region: 'eastasia', aliases: ['hong kong', 'hongkong', 'hk'] },
    { id: 'korea', name: 'South Korea', region: 'eastasia', aliases: ['korea', 'south korea', 'busan', 'seoul', 'incheon'] },
    { id: 'taiwan', name: 'Taiwan', region: 'eastasia', aliases: ['taiwan', 'kaohsiung', 'taipei'] },
    { id: 'singapore', name: 'Singapore', region: 'seasia', aliases: ['singapore', 'singapur'] },
    { id: 'vietnam', name: 'Vietnam', region: 'seasia', aliases: ['vietnam', 'ho chi minh', 'hanoi', 'haiphong'] },
    { id: 'thailand', name: 'Thailand', region: 'seasia', aliases: ['thailand', 'bangkok', 'laem chabang'] },
    { id: 'malaysia', name: 'Malaysia', region: 'seasia', aliases: ['malaysia', 'port klang', 'kuala lumpur', 'penang'] },
    { id: 'indonesia', name: 'Indonesia', region: 'seasia', aliases: ['indonesia', 'jakarta', 'surabaya'] },
    { id: 'usa', name: 'United States', region: 'far', aliases: ['usa', 'america', 'united states', 'amerika', 'los angeles', 'long beach', 'new york', 'california'] },
    { id: 'europe', name: 'Europe', region: 'far', aliases: ['europe', 'europa', 'germany', 'rotterdam', 'hamburg', 'netherlands', 'united kingdom', 'london', 'france', 'italy', 'spain'] },
    { id: 'australia', name: 'Australia', region: 'far', aliases: ['australia', 'sydney', 'melbourne', 'brisbane'] },
    { id: 'middleeast', name: 'Middle East', region: 'far', aliases: ['dubai', 'uae', 'saudi', 'jeddah', 'riyadh', 'middle east', 'qatar', 'doha'] },
    { id: 'cebu', name: 'Cebu', region: 'domestic', aliases: ['cebu', 'sugbo', 'mactan', 'mandaue'] },
    { id: 'davao', name: 'Davao', region: 'domestic', aliases: ['davao', 'sasa'] },
    { id: 'iloilo', name: 'Iloilo', region: 'domestic', aliases: ['iloilo'] },
    { id: 'cdo', name: 'Cagayan de Oro', region: 'domestic', aliases: ['cagayan de oro', 'cdo'] },
    { id: 'manila', name: 'Manila', region: 'home', aliases: ['manila', 'maynila', 'metro manila', 'ncr', 'binondo', 'escolta', 'quezon city', 'makati', 'pasig', 'taguig', 'caloocan', 'valenzuela', 'paranaque', 'pasay', 'micp', 'south harbor', 'north harbor', 'port area'] },
    { id: 'luzon', name: 'Laguna / Cavite / Batangas', region: 'domesticland', aliases: ['laguna', 'cavite', 'batangas', 'calabarzon', 'santa rosa', 'binan', 'calamba', 'lipa', 'bulacan', 'pampanga', 'clark', 'subic'] }
  ],

  /* ---------------- DEMO BALLPARK RATES (PHP) ----------------
     NOT Novus's rates. Typical market ranges used only to show how an
     instant estimate would work. Replace with Novus's rate guide.        */
  rates: {
    currency: 'PHP',
    lcl:  { eastasia: [2800, 4200], seasia: [2500, 3800], far: [5500, 8500], domestic: [1800, 2800], min: 1 },
    fcl:  { eastasia: [38000, 65000], seasia: [35000, 60000], far: [140000, 220000], domestic: [28000, 45000], fortyFactor: 1.6 },
    air:  { eastasia: [180, 260], seasia: [160, 240], far: [320, 480], domestic: [60, 95], minKg: 45 },
    customs: [8000, 15000],
    trucking: { '4w': [3500, 5500], '6w': [6000, 9500], '10w': [9000, 14000], trailer: [12000, 18000] },
    note: 'Demo estimate, not Novus’s published rates. Novus confirms the real rate for your shipment.'
  },

  /* General BOC document guide (not from nfiph.com; Novus confirms per shipment). */
  documents: {
    sea:     { title: 'Sea shipment documents (general guide)', items: ['Commercial invoice', 'Packing list', 'Bill of lading (B/L)', 'Import permit, if the goods are regulated', 'Certificate of origin, if claiming lower duties'] },
    air:     { title: 'Air shipment documents (general guide)', items: ['Commercial invoice', 'Packing list', 'Air waybill (AWB)', 'Import permit, if the goods are regulated'] },
    customs: { title: 'Customs clearance documents (general BOC guide)', items: ['Commercial invoice', 'Packing list', 'Bill of lading or air waybill', 'Importer accreditation with BOC', 'Permits for regulated goods', 'Certificate of origin, if claiming lower duties'] },
    peza:    { title: 'PEZA cargo documents (general guide)', items: ['Commercial invoice', 'Packing list', 'Bill of lading or air waybill', 'PEZA permit / boat note', 'Locator registration'] }
  },

  /* ---------------- FAQs (answers use only facts from nfiph.com) ---------------- */
  faqs: [
    { id: 'founded', q: 'When did Novus Freight start?', keys: ['founded', 'start', 'started', 'history', 'since when', 'kailan nagsimula', 'how old', 'established', 'jbc', 'origin', 'how long have you been', 'years in business', 'ilang taon'], a: 'Novus began in 2017 as JBC Customs Brokerage, founded by two Licensed Customs Brokers and registered with the DTI. It rebranded in September 2020 as Novus Cargo Logistics Inc. and became Novus Freight Inc. in July 2021, registered with the SEC.' },
    { id: 'accredited', q: 'Is Novus licensed and accredited?', keys: ['accredited', 'accreditation', 'accreditations', 'licensed', 'license', 'legit', 'registered', 'sec', 'peza accredited', 'cab', 'civil aeronautics', 'pmtlai', 'privacy', 'dole', 'department of finance'], a: 'Yes. Novus lists these local licenses and accreditations: PEZA, Department of Finance, PMTLAI, Civil Aeronautics Board, DOLE, DTI and the National Privacy Commission. Novus Freight Inc. is registered with the SEC.' },
    { id: 'networks', q: 'Which international networks is Novus part of?', keys: ['network', 'networks', 'wca', 'jc trans', 'jctrans', 'all world shipping', 'agents', 'partners abroad', 'overseas partner'], a: 'Novus is connected to the WCA World, JC Trans and All World Shipping networks, which link it to logistics partners worldwide.' },
    { id: 'mission', q: 'What is Novus’s mission?', keys: ['mission', 'misyon'], a: 'To provide customer satisfaction by delivering quality services in a cost-effective and reliable solution resulting in a long-term partnership with our client.' },
    { id: 'vision', q: 'What is Novus’s vision?', keys: ['vision', 'bisyon'], a: 'The organization envisions one of the most reliable and valued logistics providers, providing clients with the best quality and efficient service possible, with continual development.' },
    { id: 'values', q: 'What are Novus’s values?', keys: ['values', 'core values', 'why choose', 'why novus', 'bakit novus', 'principles'], a: 'Accountability, Integrity, Quality and Innovation. Novus takes full responsibility for its work, acts ethically, holds itself to high standards and keeps improving to meet clients’ most demanding needs.' },
    { id: 'incoterms', q: 'Which trade terms does Novus handle?', keys: ['incoterm', 'incoterms', 'trade terms', 'cif', 'cfr', 'ddp', 'ddu'], a: 'Novus’s customs clearance covers shipments under CIF, CFR, DDP and DDU.' },
    { id: 'countries', q: 'How many countries does Novus serve?', keys: ['how many countries', 'countries', 'ilang bansa', 'worldwide', 'coverage', 'saan kayo nag ship', 'where do you ship'], a: 'Novus’s website lists 50+ countries, served through its international networks (WCA World, JC Trans and All World Shipping). For a specific port or route, the team confirms the routing.' },
    { id: 'support', q: 'Is support available 24/7?', keys: ['24 7', '24/7', 'support', 'anytime', 'kahit anong oras', 'weekend', 'sunday', 'saturday'], a: 'Novus’s website lists 24/7 support. You can also reach the team at (+63) 02 8637-7930 or inquirynovus@nfiph.com.' },
    { id: 'quote', q: 'How do I get a quote?', keys: ['get a quote', 'quotation', 'quote', 'rate request', 'paano magpa quote', 'request quote'], a: 'Send your shipment details through the quote form or email inquirynovus@nfiph.com. Novus replies with the actual rate for your shipment.' },
    { id: 'track', q: 'How do I track my shipment?', keys: ['how to track', 'paano i track', 'tracking number', 'where is my shipment'], a: 'In this demo, type a tracking number (it starts with NVF-) on the Track page or here in the chat. The live version reads the status straight from Novus’s Logi-Sys records.' },
    { id: 'assessment', q: 'What does “assessment” or “lane” mean in customs?', keys: ['assessment', 'green lane', 'yellow lane', 'red lane', 'lane', 'examination', 'inspection', 'ano ibig sabihin'], a: 'After an entry is lodged, BOC assesses it and assigns a lane. Green means no inspection; yellow is a document check; red is a physical exam of the cargo. Novus’s Licensed Customs Brokers follow up at every step.' }
  ],

  /* ---------------- SAMPLE TRACKING (operational demo data) ---------------- */
  shipments: [
    {
      no: 'NVF-24117', mode: 'Sea · FCL 1x40HC', service: 'nvocc', direction: 'Import',
      origin: 'Shanghai, China', destination: 'Manila (MICP)', consignee: 'Sample importer · Valenzuela',
      vessel: 'Sample vessel · V.118S', container: 'SMPL 482117-0', stage: 'customs', eta: 'Release expected 28 Nov',
      events: [
        ['Booked', '12 Nov', 'Booking confirmed with the shipping line', 'done'],
        ['In transit', '15 Nov', 'Loaded and departed Shanghai', 'done'],
        ['Arrived', '22 Nov', 'Vessel arrived at MICP, container discharged', 'done'],
        ['Customs', '24 Nov', 'Import entry lodged in BOC e2m', 'done'],
        ['Customs', '26 Nov', 'Assessment done (green lane), duties computed', 'done'],
        ['Customs', '27 Nov', 'Waiting for duty payment confirmation', 'now'],
        ['Released', '', 'Release and gate pass', 'next'],
        ['Delivered', '', 'Trailer truck delivery to Valenzuela warehouse', 'next']
      ]
    },
    {
      no: 'NVF-24093', mode: 'Air · 312 kg', service: 'international', direction: 'Export',
      origin: 'Manila (NAIA)', destination: 'Tokyo Narita, Japan', consignee: 'Sample buyer · Tokyo',
      vessel: 'Sample flight', container: 'AWB 000-SAMPLE1', stage: 'delivered', eta: 'Delivered 21 Nov',
      events: [
        ['Booked', '17 Nov', 'Space booked, AWB issued', 'done'],
        ['Customs', '18 Nov', 'Export declaration cleared by BOC', 'done'],
        ['In transit', '19 Nov', 'Departed Manila', 'done'],
        ['Arrived', '20 Nov', 'Arrived Narita, handed to the consignee’s broker', 'done'],
        ['Delivered', '21 Nov', 'Signed for by consignee', 'done']
      ]
    },
    {
      no: 'NVF-24130', mode: 'Domestic sea · 6.4 CBM', service: 'domestic', direction: 'Domestic',
      origin: 'Manila', destination: 'Cebu', consignee: 'Sample retailer · Mandaue',
      vessel: 'Sample domestic vessel', container: 'SMPL-CEB-31', stage: 'transit', eta: 'Arrives 29 Nov',
      events: [
        ['Booked', '23 Nov', 'Cargo received in Manila', 'done'],
        ['In transit', '26 Nov', 'Sailed from Manila', 'now'],
        ['Arrived', '', 'Arrival at Port of Cebu', 'next'],
        ['Delivered', '', 'Closed van delivery to Mandaue store', 'next']
      ]
    },
    {
      no: 'NVF-24102', mode: 'Sea · LCL 3.2 CBM · PEZA cargo', service: 'customs', direction: 'Import',
      origin: 'Busan, South Korea', destination: 'Manila → Laguna ecozone', consignee: 'Sample PEZA locator · Laguna',
      vessel: 'Sample vessel · V.207W', container: 'SMPL-BUS-07', stage: 'released', eta: 'Delivery today',
      events: [
        ['Booked', '10 Nov', 'Booked on LCL consolidation from Busan', 'done'],
        ['In transit', '13 Nov', 'Departed Busan', 'done'],
        ['Arrived', '19 Nov', 'Arrived Manila, devanned', 'done'],
        ['Customs', '20 Nov', 'PEZA documents and entry lodged', 'done'],
        ['Customs', '25 Nov', 'Cleared, transfer to ecozone approved', 'done'],
        ['Released', '27 Nov', 'Released, wing van dispatched', 'now'],
        ['Delivered', '', 'Delivery to Laguna locator', 'next']
      ]
    }
  ]
};
