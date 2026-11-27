/* =====================================================================
   NOVUS FREIGHT · KNOWLEDGE BASE (the ONLY place company facts live)
   ---------------------------------------------------------------------
   Everything on the Novus demo (website text, the Novus AI answers,
   quote estimates, llms.txt and the schema.org JSON-LD) is read from
   this one file.

   STATUS: SAMPLE DATA. Typical Philippine forwarder content until
   Novus confirms its real details. Fields marked "sample" MUST be
   replaced before anything goes public.

   To swap in real facts:
     1. Edit the values below (keep the field names).
     2. Run:  node novus/tools/build.mjs
        (rewrites the JSON-LD + static service/FAQ HTML in index.html
         and regenerates novus/llms.txt)
     3. Set  meta.sample = false  to hide the "sample data" ribbon.
   ===================================================================== */
window.NOVUS = {
  meta: {
    sample: true,                         // true = show "Demo · sample data" ribbon
    kbVersion: 'sample-2026-11-27',
    siteUrl: 'https://garciaralphlawrence-svg.github.io/LogiSys-Demo/novus/'
  },

  company: {
    name: 'Novus Freight',
    shortName: 'Novus',
    legalName: '',                        // e.g. 'Novus Freight Logistics Inc.' (unknown yet)
    type: 'Freight forwarder and customs broker',
    oneLiner: 'Novus Freight moves cargo by sea, air and land, clears it through the Bureau of Customs and delivers it to your door, across the Philippines and abroad.',
    story: [
      'Novus Freight is a Philippine freight forwarder. We help importers, exporters and growing businesses move goods by sea, air and land without having to deal with ten different providers.',
      'One Novus team books the space with the carrier, prepares and lodges your customs entry with the Bureau of Customs (BOC), arranges the truck and keeps you updated until the cargo reaches your warehouse.',
      'Day to day we run on Logi-Sys, a cloud freight ERP, so every job, document and invoice sits in one system. That is what lets this assistant tell you where your shipment is in seconds.'
    ],
    founded: null,                        // unknown: never invent years in business
    address: 'Sample address · Port Area, Manila, Philippines',   // sample
    city: 'Manila',
    region: 'Metro Manila',
    country: 'PH',
    hours: 'Monday to Friday, 8:00 AM to 5:00 PM · Saturday 8:00 AM to 12:00 NN',   // sample
    hoursShort: 'Mon to Fri 8 AM to 5 PM, Sat 8 AM to 12 NN'
  },

  contacts: {
    phone: '+63 2 8555 0100',             // sample
    mobile: '+63 917 555 0100',           // sample (Viber / WhatsApp)
    email: 'hello@novusfreight.example',  // sample
    quotesEmail: 'quotes@novusfreight.example',
    facebook: '',                         // e.g. 'https://facebook.com/...'
    website: ''                           // real website when confirmed
  },

  /* ---------------- SERVICES ----------------
     aliases: words people type (English, Tagalog, Taglish, common typos).
     handles: true = "Yes, we handle this".                                */
  services: [
    {
      id: 'sea-fcl', name: 'Sea freight · FCL', group: 'Sea',
      aliases: ['fcl', 'full container', 'full container load', 'container', 'containers', 'kontainer', '20ft', '40ft', '20 footer', '40 footer', 'twenty footer', 'forty footer', 'reefer', 'buong container'],
      handles: true,
      summary: 'Full container loads (20ft, 40ft, 40ft high cube and reefer) for import and export, door to door or port to port.',
      details: ['Space booking with major shipping lines', 'Import and export, Asia, US and Europe lanes', 'Container pickup, stuffing and return', 'Reefer for chilled and frozen cargo (on request)'],
      docs: 'sea', unit: 'per container', estimate: 'fcl'
    },
    {
      id: 'sea-lcl', name: 'Sea freight · LCL consolidation', group: 'Sea',
      aliases: ['lcl', 'less than container', 'less container', 'consolidation', 'consol', 'shared container', 'small shipment', 'ilang kahon', 'kaunting cargo', 'konting cargo', 'loose cargo', 'by cbm', 'per cbm'],
      handles: true,
      summary: 'Pay only for the space you use. Your cargo shares a container with other shippers, priced per cubic meter (CBM).',
      details: ['Weekly consolidation from major Asian ports', 'Domestic LCL from Manila to Cebu and Davao', 'Minimum of 1 CBM', 'Good for SMEs and first-time importers'],
      docs: 'sea', unit: 'per CBM', estimate: 'lcl'
    },
    {
      id: 'air', name: 'Air freight', group: 'Air',
      aliases: ['air', 'air freight', 'airfreight', 'air cargo', 'by air', 'eroplano', 'plane', 'flight', 'urgent', 'express', 'mabilis', 'fast shipping', 'naia', 'clark airport'],
      handles: true,
      summary: 'Fast import and export by air through NAIA and Clark, priced per chargeable kilogram.',
      details: ['Consolidated and direct flights', 'Next-flight-out for urgent cargo', 'Dangerous goods on request, with proper declaration', 'Airport pickup and delivery'],
      docs: 'air', unit: 'per kg', estimate: 'air'
    },
    {
      id: 'customs', name: 'Customs brokerage (BOC e2m)', group: 'Customs',
      aliases: ['customs', 'customs broker', 'customs brokerage', 'broker', 'brokerage', 'boc', 'bureau of customs', 'e2m', 'clearance', 'customs clearance', 'clear', 'release', 'declaration', 'entry', 'import entry', 'duties', 'taxes', 'duty', 'tax', 'aduana', 'customs release', 'mag clear', 'paclear', 'pa clear', 'ma release', 'pa release'],
      handles: true,
      summary: 'Licensed customs brokers prepare and lodge your import or export entry in BOC e2m, compute duties and taxes and follow it through to release.',
      details: ['Import and export entries lodged in BOC e2m', 'Duty and tax computation before you pay', 'Assessment, payment and release follow-up', 'Gate pass and pull-out coordination'],
      docs: 'customs', unit: 'per entry', estimate: 'customs'
    },
    {
      id: 'trucking', name: 'Trucking and delivery', group: 'Land',
      aliases: ['truck', 'trucking', 'trak', 'delivery', 'deliver', 'hatid', 'ihatid', 'pickup', 'pick up', 'kuha', 'closed van', 'wing van', 'trailer', 'haulage', 'land transport', 'hakot', 'hauling'],
      handles: true,
      summary: 'Container haulage and closed-van trucking from the port or airport to your warehouse, across Luzon and in Cebu and Davao.',
      details: ['4-wheel and 6-wheel closed vans, 10-wheel wing vans', '20ft and 40ft container trailers', 'Port and airport pull-outs', 'Proof of delivery photo per drop'],
      docs: null, unit: 'per trip', estimate: 'trucking'
    },
    {
      id: 'warehousing', name: 'Warehousing', group: 'Land',
      aliases: ['warehouse', 'warehousing', 'storage', 'bodega', 'imbakan', 'store', 'pallet', 'stock', 'inventory', 'fulfillment', 'fulfilment'],
      handles: true,
      summary: 'Short and long-term storage near the Manila ports, with pallet in and out and inventory reports.',
      details: ['Pallet storage, billed per pallet per month', 'Receiving, put-away and picking', 'Monthly inventory report', 'Short-term storage while customs clears'],
      docs: null, unit: 'per pallet per month', estimate: 'warehousing'
    },
    {
      id: 'door-to-door', name: 'Door-to-door', group: 'Land',
      aliases: ['door to door', 'door2door', 'd2d', 'all in', 'all-in', 'balikbayan', 'from supplier to my warehouse', 'hanggang bahay', 'hanggang pinto', 'deliver to my door', 'one stop'],
      handles: true,
      summary: 'One quote, one contact: pickup from your supplier abroad, freight, customs clearance and delivery to your door.',
      details: ['Supplier pickup through our overseas partners', 'Freight by sea or air', 'Customs clearance and duties handled', 'Delivery to your warehouse or store'],
      docs: 'customs', unit: 'per shipment', estimate: 'lcl'
    },
    {
      id: 'project-cargo', name: 'Project and heavy cargo', group: 'Special',
      aliases: ['project cargo', 'heavy cargo', 'heavy equipment', 'oversized', 'out of gauge', 'oog', 'machinery', 'machine', 'makina', 'breakbulk', 'break bulk', 'flat rack', 'heavy lift', 'generator', 'crane'],
      handles: true,
      summary: 'Machinery, oversized and heavy-lift cargo, planned end to end, from flat racks and break-bulk to site delivery.',
      details: ['Route survey and lifting plan', 'Flat rack, open top and break-bulk', 'Permits and escorts for oversized trucks', 'Site delivery and coordination'],
      docs: 'sea', unit: 'per project', estimate: null
    },
    {
      id: 'peza', name: 'PEZA and ecozone shipments', group: 'Customs',
      aliases: ['peza', 'ecozone', 'eco zone', 'economic zone', 'freeport', 'free port', 'subic freeport', 'clark freeport', 'bonded', 'sez', 'export processing zone', 'locator', 'laguna technopark', 'cavite ecozone'],
      handles: true,
      summary: 'Shipments for PEZA and Freeport locators, with the boat note, transfer and ecozone permits handled together with customs.',
      details: ['Ecozone transfer and boat note processing', 'Laguna, Cavite, Batangas and Clark ecozones', 'Subic and Clark Freeport shipments', 'Bonded trucking'],
      docs: 'peza', unit: 'per shipment', estimate: 'customs'
    },
    {
      id: 'permits', name: 'Import and export permits', group: 'Customs',
      aliases: ['permit', 'permits', 'import permit', 'export permit', 'license', 'lisensya', 'fda', 'bpi', 'dti', 'bfar', 'sra', 'ntc', 'dti ps', 'icc', 'regulated', 'regulated goods', 'clearance permit', 'phytosanitary', 'certificate of origin'],
      handles: true,
      summary: 'We help secure the permits regulated goods need before they ship: FDA, BPI, BFAR, NTC, DTI PS/ICC and similar.',
      details: ['Check which agency covers your product', 'Prepare and file permit applications', 'Follow up until the permit is out', 'Link the permit to your customs entry'],
      docs: 'permits', unit: 'per permit', estimate: null
    }
  ],

  /* Things Novus does NOT do (answered with a clear "No"). */
  notHandled: [
    { id: 'travel', name: 'Passenger tickets and travel', aliases: ['plane ticket', 'airline ticket', 'ticket', 'tickets', 'travel', 'tour', 'passenger', 'booking flight for me', 'visa'], answer: 'Novus handles cargo, not passenger travel, so we can’t book plane tickets, tours or visas.' },
    { id: 'remittance', name: 'Money remittance', aliases: ['remittance', 'padala pera', 'send money', 'money transfer', 'pera'], answer: 'Novus moves cargo, not money, so we don’t offer remittance or money transfer.' }
  ],

  /* ---------------- PORTS & COVERAGE ---------------- */
  ports: [
    { id: 'micp', name: 'Manila International Container Port (MICP)', city: 'Manila', code: 'PHMNL', mode: 'Sea', aliases: ['micp', 'manila international container port', 'tondo', 'north harbor'], note: 'Main container port for FCL and LCL imports and exports.' },
    { id: 'south-harbor', name: 'Port of Manila · South Harbor', city: 'Manila', code: 'PHMNS', mode: 'Sea', aliases: ['south harbor', 'south harbour', 'port area', 'pier', 'manila south harbor'], note: 'Container and break-bulk cargo, including project cargo.' },
    { id: 'naia', name: 'NAIA (Manila airport cargo)', city: 'Pasay', code: 'MNL', mode: 'Air', aliases: ['naia', 'manila airport', 'paircargo', 'airport'], note: 'Air import and export.' },
    { id: 'cebu', name: 'Port of Cebu', city: 'Cebu', code: 'PHCEB', mode: 'Sea and air', aliases: ['cebu', 'sugbo', 'mactan', 'mandaue'], note: 'Domestic LCL and FCL from Manila, plus international via Cebu.' },
    { id: 'davao', name: 'Port of Davao (Sasa)', city: 'Davao', code: 'PHDVO', mode: 'Sea', aliases: ['davao', 'sasa', 'mindanao'], note: 'Domestic LCL and FCL from Manila, plus international via Davao.' },
    { id: 'subic', name: 'Subic Bay Freeport', city: 'Subic', code: 'PHSFS', mode: 'Sea', aliases: ['subic', 'subic bay', 'olongapo', 'zambales'], note: 'Freeport and container cargo for Central and North Luzon.' },
    { id: 'clark', name: 'Clark (Freeport and airport)', city: 'Clark', code: 'CRK', mode: 'Air', aliases: ['clark', 'pampanga', 'angeles', 'crk'], note: 'Air cargo and Freeport locators.' }
  ],
  otherPortsNote: 'Other Philippine ports are handled through partner haulers on request.',

  /* Destinations people ask about (sample transit times, origin Manila). */
  destinations: [
    { id: 'japan', name: 'Japan', region: 'eastasia', aliases: ['japan', 'japon', 'hapon', 'tokyo', 'osaka', 'nagoya', 'yokohama', 'narita', 'kobe'], sea: '5 to 8 days', air: '1 to 2 days' },
    { id: 'china', name: 'China', region: 'eastasia', aliases: ['china', 'tsina', 'shanghai', 'shenzhen', 'guangzhou', 'ningbo', 'xiamen', 'yiwu', 'qingdao'], sea: '4 to 7 days', air: '1 to 2 days' },
    { id: 'hongkong', name: 'Hong Kong', region: 'eastasia', aliases: ['hong kong', 'hongkong', 'hk'], sea: '3 to 4 days', air: '1 day' },
    { id: 'korea', name: 'South Korea', region: 'eastasia', aliases: ['korea', 'south korea', 'busan', 'seoul', 'incheon', 'korean'], sea: '5 to 7 days', air: '1 to 2 days' },
    { id: 'taiwan', name: 'Taiwan', region: 'eastasia', aliases: ['taiwan', 'kaohsiung', 'taipei', 'keelung'], sea: '3 to 5 days', air: '1 day' },
    { id: 'singapore', name: 'Singapore', region: 'seasia', aliases: ['singapore', 'sg', 'singapur'], sea: '4 to 6 days', air: '1 day' },
    { id: 'vietnam', name: 'Vietnam', region: 'seasia', aliases: ['vietnam', 'ho chi minh', 'hcmc', 'hanoi', 'haiphong'], sea: '4 to 7 days', air: '1 to 2 days' },
    { id: 'thailand', name: 'Thailand', region: 'seasia', aliases: ['thailand', 'bangkok', 'laem chabang'], sea: '5 to 8 days', air: '1 to 2 days' },
    { id: 'malaysia', name: 'Malaysia', region: 'seasia', aliases: ['malaysia', 'port klang', 'kuala lumpur', 'penang'], sea: '4 to 7 days', air: '1 to 2 days' },
    { id: 'indonesia', name: 'Indonesia', region: 'seasia', aliases: ['indonesia', 'jakarta', 'surabaya'], sea: '6 to 9 days', air: '1 to 2 days' },
    { id: 'usa', name: 'United States', region: 'far', aliases: ['usa', 'us', 'america', 'united states', 'states', 'amerika', 'los angeles', 'la', 'long beach', 'new york', 'california'], sea: '18 to 25 days (West Coast)', air: '2 to 4 days' },
    { id: 'europe', name: 'Europe', region: 'far', aliases: ['europe', 'europa', 'germany', 'rotterdam', 'hamburg', 'netherlands', 'uk', 'united kingdom', 'london', 'france', 'italy', 'spain'], sea: '28 to 35 days', air: '2 to 4 days' },
    { id: 'australia', name: 'Australia', region: 'far', aliases: ['australia', 'sydney', 'melbourne', 'brisbane'], sea: '12 to 16 days', air: '1 to 3 days' },
    { id: 'middleeast', name: 'Middle East', region: 'far', aliases: ['dubai', 'uae', 'saudi', 'jeddah', 'riyadh', 'middle east', 'qatar', 'doha'], sea: '14 to 20 days', air: '1 to 2 days' },
    /* domestic */
    { id: 'cebu', name: 'Cebu', region: 'domestic', aliases: ['cebu', 'sugbo', 'mactan', 'mandaue'], sea: '3 to 5 days', air: '1 day' },
    { id: 'davao', name: 'Davao', region: 'domestic', aliases: ['davao', 'sasa', 'mindanao'], sea: '4 to 6 days', air: '1 day' },
    { id: 'subic', name: 'Subic', region: 'domesticland', aliases: ['subic', 'olongapo', 'zambales'], sea: 'same or next day by truck', air: 'n/a' },
    { id: 'clark', name: 'Clark', region: 'domesticland', aliases: ['clark', 'pampanga', 'angeles'], sea: 'same or next day by truck', air: 'n/a' },
    { id: 'manila', name: 'Manila', region: 'home', aliases: ['manila', 'maynila', 'metro manila', 'ncr', 'quezon city', 'makati', 'pasig', 'taguig', 'caloocan', 'valenzuela', 'paranaque', 'pasay'], sea: '', air: '' },
    { id: 'laguna', name: 'Laguna / Cavite / Batangas', region: 'domesticland', aliases: ['laguna', 'cavite', 'batangas', 'calabarzon', 'sta rosa', 'santa rosa', 'binan', 'calamba', 'lipa'], sea: 'same or next day by truck', air: 'n/a' }
  ],

  /* ---------------- SAMPLE BALLPARK RATES (PHP) ----------------
     Used ONLY for the "estimate" on the quote form and the AI.
     Ranges are low-high. Replace with Novus's real rate guide.        */
  rates: {
    currency: 'PHP',
    lcl:  { eastasia: [2800, 4200], seasia: [2500, 3800], far: [5500, 8500], domestic: [1800, 2800], min: 1 },           // per CBM, min 1 CBM
    fcl:  { eastasia: [38000, 65000], seasia: [35000, 60000], far: [140000, 220000], domestic: [28000, 45000], fortyFactor: 1.6 }, // per 20ft
    air:  { eastasia: [180, 260], seasia: [160, 240], far: [320, 480], domestic: [60, 95], minKg: 45 },                   // per chargeable kg
    customs: [8000, 15000],                                                                                                   // brokerage per entry, excl. duties & taxes
    trucking: { '4w': [3500, 5500], '6w': [6000, 9500], '10w': [9000, 14000], trailer: [12000, 18000] },                      // Metro Manila per trip
    warehousing: [450, 750],                                                                                                  // per pallet per month
    note: 'Ballpark only. Excludes duties and taxes, origin charges and special handling. Novus confirms the final rate in writing.'
  },

  /* ---------------- DOCUMENTS REQUIRED ---------------- */
  documents: {
    sea:     { title: 'Sea shipment documents', items: ['Commercial invoice', 'Packing list', 'Bill of lading (B/L)', 'Import permit, if the goods are regulated', 'Certificate of origin (for lower duties under trade agreements)'] },
    air:     { title: 'Air shipment documents', items: ['Commercial invoice', 'Packing list', 'Air waybill (AWB)', 'Import permit, if the goods are regulated', 'MSDS for chemicals or batteries'] },
    customs: { title: 'Customs clearance (BOC) documents', items: ['Commercial invoice', 'Packing list', 'Bill of lading or air waybill', 'Importer accreditation (BOC Client Profile Registration)', 'TIN of the importer', 'Permits for regulated goods (FDA, BPI, NTC, etc.)', 'Certificate of origin, if claiming lower duties'] },
    peza:    { title: 'PEZA / ecozone shipment documents', items: ['Commercial invoice', 'Packing list', 'Bill of lading or air waybill', 'PEZA permit / boat note', 'Locator certificate of registration', 'Transfer documents for bonded trucking'] },
    permits: { title: 'Typical permit requirements', items: ['Product details and photos', 'Company registration (SEC or DTI)', 'Supplier details and invoice', 'Agency-specific forms (FDA, BPI, BFAR, NTC, DTI)', 'Laboratory or test reports, if required'] }
  },

  /* ---------------- FAQs ---------------- */
  faqs: [
    { id: 'small', q: 'Do you handle small shipments?', keys: ['small', 'maliit', 'konti', 'kaunti', 'few boxes', 'ilang kahon', 'minimum', 'small business', 'sme', 'online seller'], a: 'Yes. Use sea LCL from 1 CBM, or air freight from 45 kg. Many of our clients are SMEs and online sellers importing for the first time.' },
    { id: 'first', q: 'I’m importing for the first time. Where do I start?', keys: ['first time', 'first-time', 'unang beses', 'paano mag import', 'how to import', 'beginner', 'start importing', 'new importer', 'how do i import'], a: 'Send us your supplier’s invoice and packing list. We check if your goods need a permit, register you as an importer with BOC if needed, and give you an all-in quote before anything ships.' },
    { id: 'duties', q: 'Can you compute my duties and taxes?', keys: ['duties', 'duty', 'tax', 'taxes', 'vat', 'buwis', 'compute', 'landed cost', 'how much tax'], a: 'Yes. Our brokers compute duties, VAT and other taxes from your invoice and the tariff code before you pay, so there are no surprises at release.' },
    { id: 'clearance-time', q: 'How long does customs clearance take?', keys: ['how long customs', 'clearance time', 'gaano katagal customs', 'ilang araw customs', 'release time', 'how many days customs', 'customs days'], a: 'Most complete, green-lane entries clear in 2 to 4 working days after the vessel arrives. Yellow or red lane, missing permits or holds take longer, and we tell you the moment that happens.' },
    { id: 'assessment', q: 'What does “assessment” or “lane” mean in customs?', keys: ['assessment', 'green lane', 'yellow lane', 'red lane', 'lane', 'examination', 'inspection', 'ano ibig sabihin'], a: 'After your entry is lodged, BOC assesses it and assigns a lane. Green lane means no inspection, so it moves straight to duty payment and release. Yellow means a document check; red means a physical exam of the cargo. Novus follows up at every step.' },
    { id: 'payment', q: 'How do I pay?', keys: ['pay', 'payment', 'bayad', 'magbayad', 'bank', 'gcash', 'credit terms', 'terms', 'invoice'], a: 'We bill per shipment by bank transfer. Credit terms are available for regular accounts after review.' },
    { id: 'insurance', q: 'Can my cargo be insured?', keys: ['insurance', 'insure', 'insured', 'seguro', 'damage', 'lost cargo', 'nasira'], a: 'Yes. We can arrange cargo insurance on request. Ask for it when you request your quote.' },
    { id: 'dg', q: 'Do you ship dangerous goods?', keys: ['dangerous', 'dangerous goods', 'hazardous', 'dg', 'chemical', 'chemicals', 'battery', 'batteries', 'lithium', 'flammable', 'imo'], a: 'Yes, on request, with the proper safety data sheet (MSDS), packing and declaration. Some classes need carrier approval first, so tell us early.' },
    { id: 'track', q: 'How do I track my shipment?', keys: ['how to track', 'paano i-track', 'tracking number', 'where is my shipment', 'tracking'], a: 'Type your Novus tracking number (it starts with NVF-) on the Track page or right here in the chat. You’ll see every step, including the BOC customs steps.' },
    { id: 'quote-time', q: 'How fast can I get a quote?', keys: ['quote time', 'how fast quote', 'kailan quote', 'quotation', 'rate request'], a: 'You get a ballpark right away on our quote page. A confirmed written quote usually follows within one working day.' }
  ],

  /* ---------------- SAMPLE TRACKING ---------------- */
  shipments: [
    {
      no: 'NVF-24117', mode: 'Sea · FCL 1x40HC', service: 'sea-fcl', direction: 'Import',
      origin: 'Shanghai, China', destination: 'Manila (MICP)', consignee: 'Sample importer · Valenzuela',
      vessel: 'Sample vessel · V.118S', container: 'SMPL 482117-0', stage: 'customs', eta: 'Released expected 28 Nov',
      events: [
        ['Booked', '12 Nov', 'Booking confirmed with the shipping line', 'done'],
        ['In transit', '15 Nov', 'Loaded and departed Shanghai', 'done'],
        ['Arrived', '22 Nov', 'Vessel arrived at MICP, container discharged', 'done'],
        ['Customs', '24 Nov', 'Import entry lodged in BOC e2m', 'done'],
        ['Customs', '26 Nov', 'Assessment done (green lane), duties computed', 'done'],
        ['Customs', '27 Nov', 'Waiting for duty payment confirmation', 'now'],
        ['Released', '', 'Release and gate pass', 'next'],
        ['Delivered', '', 'Delivery to Valenzuela warehouse', 'next']
      ]
    },
    {
      no: 'NVF-24093', mode: 'Air · 312 kg', service: 'air', direction: 'Export',
      origin: 'Clark (CRK)', destination: 'Tokyo Narita, Japan', consignee: 'Sample buyer · Tokyo',
      vessel: 'Sample flight · 2 legs', container: 'AWB 000-SAMPLE1', stage: 'delivered', eta: 'Delivered 21 Nov',
      events: [
        ['Booked', '17 Nov', 'Space booked, AWB issued', 'done'],
        ['Customs', '18 Nov', 'Export declaration cleared by BOC', 'done'],
        ['In transit', '19 Nov', 'Departed Clark', 'done'],
        ['Arrived', '20 Nov', 'Arrived Narita, handed to consignee’s broker', 'done'],
        ['Delivered', '21 Nov', 'Signed for by consignee', 'done']
      ]
    },
    {
      no: 'NVF-24130', mode: 'Sea · Domestic LCL 6.4 CBM', service: 'sea-lcl', direction: 'Domestic',
      origin: 'Manila', destination: 'Cebu', consignee: 'Sample retailer · Mandaue',
      vessel: 'Sample domestic vessel · V.031', container: 'Consol box SMPL-CEB-31', stage: 'transit', eta: 'Arrives 29 Nov',
      events: [
        ['Booked', '23 Nov', 'Cargo received at our Manila CFS', 'done'],
        ['In transit', '26 Nov', 'Consolidated and sailed from Manila', 'now'],
        ['Arrived', '', 'Arrival at Port of Cebu', 'next'],
        ['Delivered', '', 'Delivery to Mandaue store', 'next']
      ]
    },
    {
      no: 'NVF-24102', mode: 'Sea · LCL 3.2 CBM', service: 'peza', direction: 'Import',
      origin: 'Busan, South Korea', destination: 'Manila South Harbor → Laguna ecozone', consignee: 'Sample PEZA locator · Laguna',
      vessel: 'Sample vessel · V.207W', container: 'Consol box SMPL-BUS-07', stage: 'released', eta: 'Delivery today',
      events: [
        ['Booked', '10 Nov', 'Booked on weekly Busan consolidation', 'done'],
        ['In transit', '13 Nov', 'Departed Busan', 'done'],
        ['Arrived', '19 Nov', 'Arrived Manila South Harbor, devanned at CFS', 'done'],
        ['Customs', '20 Nov', 'PEZA boat note and entry lodged', 'done'],
        ['Customs', '25 Nov', 'Cleared, transfer to ecozone approved', 'done'],
        ['Released', '27 Nov', 'Released, bonded truck dispatched', 'now'],
        ['Delivered', '', 'Delivery to Laguna locator', 'next']
      ]
    }
  ]
};
