// Novus demo build: regenerates everything that must exist WITHOUT JavaScript
// (for Google, ChatGPT, Claude, Gemini and Perplexity crawlers) from data/novus-kb.js:
//   - schema.org JSON-LD (Organization + Service + FAQPage) in index.html
//   - static service cards, FAQ, ports and contact HTML in index.html
//   - llms.txt
// Usage (from the repo root):  node novus/tools/build.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ctx = {}; ctx.window = ctx; ctx.globalThis = ctx;
vm.createContext(ctx);
for (const f of ['data/novus-kb.js', 'js/templates.js']) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
const N = ctx.NOVUS, T = ctx.NovusT;

const idxPath = path.join(root, 'index.html');
let html = fs.readFileSync(idxPath, 'utf8');
const blocks = {
  jsonld: '<script type="application/ld+json">\n' + T.jsonld(N).replace(/</g, '\\u003c') + '\n</script>',
  services: T.servicesHTML(N),
  faq: T.faqHTML(N),
  accred: T.accredHTML(N),
  history: T.historyHTML(N),
  values: T.valuesHTML(N),
  contact: T.contactHTML(N)
};
for (const [k, v] of Object.entries(blocks)) {
  const re = new RegExp('<!--KB:' + k + '-->[\\s\\S]*?<!--/KB:' + k + '-->');
  if (!re.test(html)) throw new Error('Marker missing in index.html: ' + k);
  html = html.replace(re, () => '<!--KB:' + k + '-->' + v + '<!--/KB:' + k + '-->');
}
fs.writeFileSync(idxPath, html);
fs.writeFileSync(path.join(root, 'llms.txt'), T.llms(N));
console.log('Built from data/novus-kb.js:', N.services.length, 'services,', N.faqs.length, 'FAQs. Updated index.html + llms.txt');
