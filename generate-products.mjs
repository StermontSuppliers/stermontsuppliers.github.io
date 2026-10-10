// Stermont Arcade - builds a real web page for every product + category, and a sitemap for Google.
// Runs automatically on GitHub (see .github/workflows/product-pages.yml). No installs needed (Node 18+).
import { writeFileSync, mkdirSync, rmSync, readFileSync, existsSync } from 'node:fs';

const SITE = 'https://stermontarcade.co.ke';
const SB = 'https://oewvtbnmyombbtggamor.supabase.co';
const KEY = 'sb_publishable_CQiZr-INuot9C4fbdJDz1Q_4OiWEQL7';
const WHATSAPP = '254748888230';
const BRAND = 'Stermont Arcade';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = n => 'KSh ' + Math.round(Number(n) || 0).toLocaleString('en-KE');
const clip = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s; };
const jsonLd = o => '<script type="application/ld+json">' + JSON.stringify(o).replace(/</g, '\\u003c') + '</script>';

async function getProducts() {
  if (process.env.PRODUCTS_JSON) return JSON.parse(readFileSync(process.env.PRODUCTS_JSON, 'utf8'));   // for local testing only
  const cols = ['id,name,price,old_price,unit,variant_group,variant_label,stock,images,description,categories(name,slug)',
                'id,name,price,old_price,unit,stock,images,description,categories(name,slug)',
                'id,name,price,stock,images,description,categories(name,slug)'];
  for (const c of cols) {
    const r = await fetch(`${SB}/rest/v1/products?active=eq.true&select=${c}&order=created_at.asc`, { headers: { apikey: KEY } });
    if (r.ok) return r.json();
  }
  throw new Error('Could not read products from Supabase');
}

const CSS = `*{box-sizing:border-box}body{margin:0;font:16px/1.55 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#1f1b2e;background:#faf9fd}
a{color:#6d28d9}header{background:#7c3aed;color:#fff;padding:.8rem 1rem}header a{color:#fff;text-decoration:none;font-weight:800;font-size:1.15rem}
main{max-width:920px;margin:0 auto;padding:1rem}nav.bc{font-size:.85rem;color:#6b6b80;margin:.3rem 0 1rem}
.pg{display:grid;gap:1.2rem}@media(min-width:720px){.pg{grid-template-columns:1fr 1fr}}
.pg img{width:100%;height:auto;max-height:480px;object-fit:contain;background:#fff;border:1px solid #e6e1f5;border-radius:14px}
h1{font-size:1.5rem;line-height:1.25;margin:.2rem 0 .6rem}.pr{font-size:1.7rem;font-weight:800;color:#5b21b6}.pr s{font-size:1rem;font-weight:500;color:#6b6b80}
.ok{color:#15803d;font-weight:700}.no{color:#b91c1c;font-weight:700}.btn{display:block;text-align:center;background:#16a34a;color:#fff;text-decoration:none;font-weight:800;padding:.85rem;border-radius:12px;margin:.8rem 0 .4rem}
.btn.alt{background:#fff;color:#6d28d9;border:2px solid #7c3aed}.box{background:#fff;border:1px solid #e6e1f5;border-radius:14px;padding:.9rem 1rem;margin:1rem 0}
.desc{white-space:pre-line}ul.g{list-style:none;padding:0;display:grid;gap:.5rem;grid-template-columns:repeat(auto-fill,minmax(210px,1fr))}
ul.g li{background:#fff;border:1px solid #e6e1f5;border-radius:12px;padding:.7rem}ul.g a{text-decoration:none;font-weight:600;color:#1f1b2e}ul.g span{display:block;color:#5b21b6;font-weight:800}
footer{max-width:920px;margin:2rem auto;padding:1rem;color:#6b6b80;font-size:.85rem;border-top:1px solid #e6e1f5}`;

const shell = ({ title, desc, path, og, body, ld }) => `<!doctype html>
<html lang="en-KE"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE}${path}"><meta name="robots" content="index, follow, max-image-preview:large">
<meta property="og:type" content="website"><meta property="og:site_name" content="${BRAND}"><meta property="og:locale" content="en_KE">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${SITE}${path}">
<meta property="og:image" content="${esc(og || SITE + '/logo.png')}"><meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#7c3aed"><style>${CSS}</style>${ld || ''}</head><body>
<header><a href="${SITE}/">${BRAND}</a></header><main>${body}</main>
<footer>${BRAND} · The Sarit Centre (Westlands), Nairobi · Pay by M-Pesa · Delivery to all 47 counties · <a href="https://wa.me/${WHATSAPP}">WhatsApp +254 748 888 230</a>
· <a href="${SITE}/shipping.html">Shipping</a> · <a href="${SITE}/returns.html">Returns</a> · <a href="${SITE}/privacy.html">Privacy</a></footer></body></html>`;

const products = (await getProducts()).filter(p => p && p.id && p.name);
const byCat = {};
products.forEach(p => { const s = p.categories?.slug; if (s) (byCat[s] = byCat[s] || { name: p.categories.name, items: [] }).items.push(p); });

rmSync('p', { recursive: true, force: true }); rmSync('c', { recursive: true, force: true });
mkdirSync('p', { recursive: true }); mkdirSync('c', { recursive: true });
const urls = [];

const card = p => `<li><a href="/p/${encodeURIComponent(p.id)}.html">${esc(p.name)}</a><span>${money(p.price)}</span></li>`;

for (const p of products) {
  const path = `/p/${encodeURIComponent(p.id)}.html`, cat = p.categories, img = (p.images || []).filter(Boolean);
  const inStock = p.stock == null || Number(p.stock) > 0, hasOld = Number(p.old_price) > Number(p.price);
  const plain = clip(p.description, 150);
  const desc = clip(`Buy ${p.name} at ${money(p.price)} in Kenya. ${plain ? plain + ' ' : ''}Pay by M-Pesa, delivery to all 47 counties. ${BRAND}, Westlands Nairobi.`, 158);
  const title = clip(`${p.name} Price in Kenya | Buy Online | ${BRAND}`, 70);
  const related = cat ? (byCat[cat.slug]?.items || []).filter(x => x.id !== p.id).slice(0, 6) : [];
  const wa = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hello ${BRAND}, I want to order: ${p.name} (${money(p.price)}) ${SITE}${path}`)}`;
  const ld = jsonLd({
    '@context': 'https://schema.org', '@type': 'Product', name: p.name, image: img.length ? img : undefined,
    description: clip(p.description, 500) || `${p.name} available at ${BRAND}, Kenya.`, sku: String(p.id), category: cat?.name,
    brand: { '@type': 'Brand', name: BRAND },
    offers: { '@type': 'Offer', url: SITE + path, priceCurrency: 'KES', price: String(Math.round(Number(p.price) || 0)),
      availability: 'https://schema.org/' + (inStock ? 'InStock' : 'OutOfStock'), itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: BRAND } }
  });
  const body = `<nav class="bc"><a href="${SITE}/">Home</a>${cat ? ` › <a href="/c/${encodeURIComponent(cat.slug)}.html">${esc(cat.name)}</a>` : ''} › ${esc(p.name)}</nav>
<div class="pg"><div>${img[0] ? `<img src="${esc(img[0])}" alt="${esc(p.name)}" fetchpriority="high">` : ''}</div>
<div><h1>${esc(p.name)}</h1><div class="pr">${hasOld ? `<s>${money(p.old_price)}</s> ` : ''}${money(p.price)}${p.unit ? ` <small>/ ${esc(p.unit)}</small>` : ''}</div>
<p class="${inStock ? 'ok' : 'no'}">${inStock ? 'In stock' : 'Currently sold out'}</p>
<a class="btn" href="${esc(wa)}">Order on WhatsApp</a><a class="btn alt" href="${SITE}/">Shop all products and add to cart</a>
<div class="box">✔ Pay by M-Pesa &nbsp; ✔ Delivery to all 47 counties &nbsp; ✔ 48-hour returns on faulty items</div></div></div>
${p.description ? `<div class="box"><h2 style="margin-top:0">Product details</h2><div class="desc">${esc(p.description)}</div></div>` : ''}
${related.length ? `<h2>More in ${esc(cat.name)}</h2><ul class="g">${related.map(card).join('')}</ul>` : ''}`;
  writeFileSync(`.${path}`.replace(/%[0-9A-F]{2}/gi, m => decodeURIComponent(m)), shell({ title, desc, path, og: img[0], body, ld }));
  urls.push(path);
}

for (const [slug, c] of Object.entries(byCat)) {
  const path = `/c/${encodeURIComponent(slug)}.html`;
  const title = clip(`Buy ${c.name} in Kenya | Prices &amp; Delivery | ${BRAND}`.replace(/&amp;/g, '&'), 70);
  const desc = clip(`Shop ${c.name} online in Kenya. ${c.items.length} products, pay by M-Pesa, delivery to all 47 counties. ${BRAND}, Westlands Nairobi.`, 158);
  const ld = jsonLd({ '@context': 'https://schema.org', '@type': 'ItemList', name: c.name, itemListElement: c.items.slice(0, 50).map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/p/${encodeURIComponent(p.id)}.html`, name: p.name })) });
  const body = `<nav class="bc"><a href="${SITE}/">Home</a> › ${esc(c.name)}</nav><h1>${esc(c.name)} in Kenya</h1>
<p>Order online and pay by M-Pesa. We deliver to all 47 counties.</p><ul class="g">${c.items.map(card).join('')}</ul>`;
  writeFileSync(`.${path}`.replace(/%[0-9A-F]{2}/gi, m => decodeURIComponent(m)), shell({ title, desc, path, body, ld }));
  urls.push(path);
}

const today = new Date().toISOString().slice(0, 10);
writeFileSync('sitemap-products.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map(u => `<url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n') + `\n</urlset>\n`);
console.log(`Built ${products.length} product pages and ${Object.keys(byCat).length} category pages.`);
