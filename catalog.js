/* Stermont Arcade · Catalog, Restock & Ledger module. Mount: STMCatalog.mount(containerEl) */
(function () {
  var SB = 'https://oewvtbnmyombbtggamor.supabase.co', KEY = 'sb_publishable_CQiZr-INuot9C4fbdJDz1Q_4OiWEQL7', SK = 'stm_admin_session';
  var S = { cats: [], prods: [], st: {}, cat: 'all', q: '', range: 'all' }, root, D = document, view = function () { render(); };
  var LIME = '#84cc16';
  var css = '.cx-k{display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-bottom:.8rem}.cx-k div{background:#fff;border:1px solid var(--ln);border-radius:12px;padding:.6rem .8rem}.cx-k small{color:var(--mu);display:block;font-size:.74rem;font-weight:600}.cx-k b{font-size:1.05rem}' +
    '.cx-k .hi{background:var(--p);color:#fff;border-color:var(--p)}.cx-k .hi small{color:#e9ddff}.cx-k .lime{background:' + LIME + ';border-color:' + LIME + ';color:#1a2e05}.cx-k .lime small{color:#365314}' +
    '.cx-p{display:flex;gap:.8rem}.cx-p img,.cx-ph{width:72px;height:72px;border-radius:10px;object-fit:cover;background:#eceaf5;flex:none;display:flex;align-items:center;justify-content:center;font-size:1.6rem}' +
    '.cx-g{display:grid;grid-template-columns:1fr 1fr;gap:.3rem .8rem;margin:.6rem 0;font-size:.9rem}.cx-g span{color:var(--mu)}.cx-g b{float:right}' +
    '.b-low{background:#fef3c7;color:#92400e}.b-ad{background:' + LIME + ';color:#1a2e05}.cx-f{border:1px solid var(--ln);border-radius:10px;padding:.6rem .7rem;width:100%;font:inherit;background:#fff}' +
    '.cx-r{display:grid;grid-template-columns:1fr 1fr;gap:.6rem}.cx-th{display:flex;gap:.4rem;flex-wrap:wrap;margin:.4rem 0}.cx-th div{position:relative}.cx-th img{width:64px;height:64px;border-radius:8px;object-fit:cover}' +
    '.cx-th button{position:absolute;top:-6px;right:-6px;border:0;background:var(--no);color:#fff;border-radius:50%;width:20px;height:20px;line-height:1}' +
    '.cx-t{width:100%;border-collapse:collapse;font-size:.84rem}.cx-t th,.cx-t td{padding:.45rem .5rem;text-align:right;border-bottom:1px solid var(--ln);white-space:nowrap}.cx-t th:first-child,.cx-t td:first-child{text-align:left;position:sticky;left:0;background:#fff;max-width:150px;overflow:hidden;text-overflow:ellipsis}' +
    '.cx-t th{background:#f3eefc;color:var(--pd);font-size:.74rem;text-transform:uppercase}.cx-t .sub td{background:#f6f4fb;font-weight:700}.cx-t .tot td{background:var(--p);color:#fff;font-weight:800}.cx-t .neg{color:var(--no)}.cx-w{overflow-x:auto;border:1px solid var(--ln);border-radius:12px}' +
    '.modal .card{max-height:92vh;overflow:auto}.cx-pl{background:#fff;border:1px solid var(--ln);border-radius:12px;padding:.5rem .6rem;margin-bottom:.8rem}.cx-pl summary{font-weight:700;cursor:pointer;padding:.3rem .2rem}.cx-pl .cx-t td:last-child{text-align:right;white-space:nowrap}.cx-pl .cx-t td:first-child{position:static;white-space:normal;max-width:none}.cx-pv{background:#f3eefc;border-radius:10px;padding:.5rem .7rem;margin:.6rem 0;font-size:.9rem}' +
    '.cx-pr{background:linear-gradient(135deg,#f5efff,#fff);border:1px solid #d9c9fb;border-radius:14px;padding:.7rem .8rem;margin:.8rem 0}.cx-pt{font-weight:800;color:var(--pd)}' +
    '.cx-r3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:.5rem}.cx-r3 label{font-size:.78rem;margin:.4rem 0 .2rem}' +
    '.cx-quick{display:flex;gap:.35rem;flex-wrap:wrap;margin:.6rem 0 .2rem}.cx-chip{border:1px solid #d9c9fb;background:#fff;color:var(--pd);border-radius:999px;padding:.3rem .7rem;font:inherit;font-size:.82rem;font-weight:700;cursor:pointer}.cx-chip.alt{color:var(--mu);border-color:var(--ln)}' +
    '.cx-pvc{background:#fff;border:1px dashed #b794f6;border-radius:12px;padding:.6rem .8rem;margin-top:.5rem}.cx-pvc s{color:var(--mu)}.cx-pvc b{font-size:1.2rem;color:var(--pd)}.cx-pvc .bad{color:var(--no);font-weight:600;font-size:.9rem}' +
    '.cx-bd{display:inline-block;background:#dc2626;color:#fff;border-radius:6px;padding:.05rem .4rem;font-size:.75rem;font-weight:800}';

    /* ---------- ledger + responsive KPI ---------- */
    var LG = '.cx-k{grid-template-columns:repeat(2,1fr)}@media(min-width:700px){.cx-k{grid-template-columns:repeat(4,1fr);gap:.7rem}.cx-k div{padding:.8rem 1rem}.cx-k b{font-size:1.25rem}}' +
    '.cx-k small{text-transform:uppercase;letter-spacing:.02em}.cx-k b{display:block;margin-top:.15rem;word-break:break-word}' +
    '.lg{--lgb:var(--ln,#e3dff0);--lgp:var(--p,#7c3aed);--lgm:var(--mu,#6b6b6b);--lgn:var(--no,#dc2626);color:inherit;min-width:0}' +
    '.lg-hd{display:flex;flex-wrap:wrap;gap:.3rem 1.2rem;background:#f3eefc;border:1px solid var(--lgb);border-radius:12px;padding:.6rem .8rem;margin-bottom:.8rem;font-size:.86rem;color:#2a0e5c}' +
    '.lg-neg{color:var(--lgn)!important}.lg em{font-style:normal;font-size:.68rem;background:#fef3c7;color:#92400e;border-radius:6px;padding:.05rem .35rem;vertical-align:middle}' +
    '.lg-desk{display:none}.lg-mob{display:block}' +
    '.lg-scroll{overflow:auto;max-height:75vh;border:1px solid var(--lgb);border-radius:12px;background:#fff}' +
    '.lg-t{width:100%;border-collapse:separate;border-spacing:0;font-size:.88rem;font-variant-numeric:tabular-nums}.lg-t th,.lg-t td{padding:.55rem .7rem;text-align:right;white-space:nowrap;border-bottom:1px solid var(--lgb)}' +
    '.lg-t .l{text-align:left;white-space:normal;min-width:190px;position:sticky;left:0;background:inherit}.lg-t td.l{background:#fff}' +
    '.lg-t thead th{position:sticky;top:0;z-index:2;background:#ece3fb;color:#3b0f8c;font-size:.72rem;text-transform:uppercase;letter-spacing:.03em}.lg-t thead th.l{z-index:3}' +
    '.lg-t tbody tr:hover td{background:#faf7ff}.lg-t tr.lg-cat td{background:#f3eefc!important;font-weight:800;color:#2a0e5c}.lg-t tr.lg-cat small{font-weight:500;color:var(--lgm)}' +
    '.lg-t tfoot td{position:sticky;bottom:0;background:var(--lgp);color:#fff;font-weight:800;border:0}.lg-t tfoot td.l{background:var(--lgp)}.lg-t tfoot .lg-neg{color:#fff!important}' +
    '.lg-g{background:#fff;border:1px solid var(--lgb);border-radius:12px;margin-bottom:.7rem;overflow:hidden}.lg-g summary{display:flex;justify-content:space-between;gap:.6rem;padding:.7rem .8rem;background:#f3eefc;font-weight:800;color:#2a0e5c;cursor:pointer;list-style:none}.lg-g summary::-webkit-details-marker{display:none}' +
    '.lg-c{padding:.7rem .8rem;border-top:1px solid var(--lgb)}.lg-c h4,.lg-tot h4{font-size:.95rem;margin:0 0 .45rem;word-break:break-word}' +
    '.lg-kv{display:grid;grid-template-columns:1fr 1fr;gap:.35rem .9rem;font-size:.85rem}.lg-kv div{display:flex;justify-content:space-between;gap:.4rem;border-bottom:1px dotted var(--lgb);padding-bottom:.2rem;min-width:0}.lg-kv span{color:var(--lgm)}.lg-kv b{text-align:right;word-break:break-word}' +
    '.lg-sub{padding:.7rem .8rem;background:#faf7ff;border-top:2px solid var(--lgb)}.lg-tot{background:var(--lgp);color:#fff;border-radius:12px;padding:.8rem}.lg-tot .lg-kv span{color:#e9ddff}.lg-tot .lg-kv div{border-color:rgba(255,255,255,.3)}.lg-tot .lg-neg{color:#fff!important}' +
    '.lg-chk{background:#f7fee7;border:1px solid #bef264;border-radius:12px;padding:.7rem .8rem;margin:.8rem 0;font-size:.88rem;line-height:1.5}' +
    '.lg-sec{background:#fff;border:1px solid var(--lgb);border-radius:12px;margin-top:.8rem}.lg-sec summary{padding:.7rem .8rem;font-weight:800;cursor:pointer}.lg-n{background:#c8f31d;color:#2a0e5c;border-radius:999px;padding:.05rem .5rem;font-size:.75rem;margin-left:.3rem}' +
    '.lg-empty{padding:.2rem .8rem .8rem;color:var(--lgm);font-size:.88rem}.lg-lst{padding:0 .8rem .6rem}.lg-lh{display:none}' +
    '.lg-lr{display:grid;grid-template-columns:1fr 1fr;gap:.2rem .8rem;padding:.6rem 0;border-top:1px solid var(--lgb);font-size:.86rem}.lg-lr span::before{content:attr(data-l) ": ";color:var(--lgm);font-size:.76rem}' +
    '@media(min-width:900px){.lg-desk{display:block}.lg-mob{display:none}.lg-lh,.lg-lr{display:grid;grid-template-columns:1.3fr 1.5fr 1fr 1fr 1fr 1.4fr;gap:.6rem;align-items:center}.lg-lh{padding:.4rem 0;font-size:.72rem;text-transform:uppercase;color:var(--lgm);font-weight:700}.lg-lr span::before{content:none}.lg-lr{padding:.55rem 0}}';
    css += LG;

  /* ---------- helpers ---------- */
  function $(id) { return D.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function money(n) { n = Math.round(Number(n || 0)); return (n < 0 ? '-' : '') + 'KSh ' + Math.abs(n).toLocaleString('en-KE'); }
  function slug(t) { return String(t).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function el(t, c, h) { var e = D.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; }
  function toast(msg) { var e = $('cx-err'); if (e) { e.textContent = msg; e.hidden = false; } }

  /* ---------- Supabase (re-uses the admin's saved session) ---------- */
  function token() {
    var s; try { s = JSON.parse(localStorage.getItem(SK)); } catch (e) {}
    if (!s) return Promise.reject(new Error('Signed out'));
    if (Date.now() < s.exp) return Promise.resolve(s.access_token);
    return fetch(SB + '/auth/v1/token?grant_type=refresh_token', { method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: s.refresh_token }) })
      .then(function (r) { if (!r.ok) throw new Error('Session expired, sign in again'); return r.json(); })
      .then(function (j) { s.access_token = j.access_token; s.refresh_token = j.refresh_token; s.exp = Date.now() + (j.expires_in || 3600) * 1000 - 60000; localStorage.setItem(SK, JSON.stringify(s)); return s.access_token; });
  }
  function call(path, o) {
    o = o || {};
    return token().then(function (t) {
      var hd = Object.assign({ apikey: KEY, Authorization: 'Bearer ' + t }, o.h || {}), body = o.body;
      if (body !== undefined && !(body instanceof Blob)) { hd['Content-Type'] = 'application/json'; body = JSON.stringify(body); }
      return fetch(SB + path, { method: o.m || 'GET', headers: hd, body: body }).then(function (r) {
        if (!r.ok) return r.text().then(function (x) { var m = x; try { m = JSON.parse(x).message || x; } catch (e) {} throw new Error(m); });
        return r.text().then(function (x) { return x ? JSON.parse(x) : null; });
      });
    });
  }
  var RANGES = [['all', 'All time'], ['today', 'Today'], ['7d', '7 days'], ['30d', '30 days'], ['month', 'This month']];
  function bounds() {
    var d = new Date(), t = new Date(d.getFullYear(), d.getMonth(), d.getDate()), r = S.range;
    if (r === 'today') return [t, null];
    if (r === '7d') return [new Date(t - 6 * 864e5), null];
    if (r === '30d') return [new Date(t - 29 * 864e5), null];
    if (r === 'month') return [new Date(d.getFullYear(), d.getMonth(), 1), null];
    return null;
  }
  function statsCall() {
    var b = bounds(); if (!b) return call('/rest/v1/product_stats?select=*');
    return call('/rest/v1/rpc/product_stats_range', { m: 'POST', body: { p_from: b[0].toISOString(), p_to: b[1] ? b[1].toISOString() : null } });
  }
  function logsCall() {
    var b = bounds(), f = b ? '&created_at=gte.' + encodeURIComponent(b[0].toISOString()) : '';
    return call('/rest/v1/loss_logs?select=product_id,reason,loss,qty,note,created_at' + f + '&order=created_at.desc&limit=2000').catch(function () { return []; });
  }
  function restCall() {
    var b = bounds(), f = b ? '&created_at=gte.' + encodeURIComponent(b[0].toISOString()) : '';
    return call('/rest/v1/stock_restocks?select=product_id,qty,unit_cost,supplier,created_at' + f + '&order=created_at.desc&limit=2000').catch(function () { return []; });
  }
  function load() {
    return Promise.all([call('/rest/v1/categories?select=*&order=name'), call('/rest/v1/products?select=*&order=created_at.desc'), statsCall(), logsCall(), restCall()])
      .then(function (r) { S.cats = r[0]; S.prods = r[1].map(function (p) { p.base = p.name; if (p.variant_label) p.name = p.base + ' \u2013 ' + p.variant_label; return p; }); S.st = {}; r[2].forEach(function (x) { S.st[x.product_id] = x; }); S.logs = r[3] || []; S.rest = r[4] || []; });
  }
  /* orders the admin declined / cancelled in the chosen period (never counted as sales) */
  function cancelled() {
    var os = window.STM_orders || [], b = bounds(), n = 0, v = 0;
    os.forEach(function (o) {
      if (o.status !== 'declined' && o.status !== 'cancelled') return;
      if (b && new Date(o.handled_at || o.created_at) < b[0]) return;
      n++; v += Number(o.subtotal || 0);
    });
    return { n: n, value: v };
  }
  function stat(p) { var s = S.st[p.id] || {}; var sales = +s.sales || 0, cogs = +s.cogs || 0; return { sold: +s.sold || 0, sales: sales, cogs: cogs, profit: sales - cogs, loss: +s.loss || 0 }; }
  var ICONS = { agrovet: '🌾', 'phones-tablets': '📱', 'tvs-audio': '📺', appliances: '🧺', fashion: '👕', 'home-office': '🛋️', computing: '💻', supermarket: '🛒', 'health-beauty': '💄', gaming: '🎮', 'baby-products': '🍼', shoes: '👟', bags: '🎒', 'watches-jewellery': '⌚', automotive: '🚗', 'music-audio': '🎸' };
  var UNITS = [['Weight', ['g', 'kg', 'tonne']], ['Volume', ['ml', 'litre']], ['Count', ['piece', 'pair', 'dozen', 'set', 'bundle']],
    ['Packaging', ['pack', 'bag', '50 kg bag', 'bottle', 'carton', 'box', 'crate', 'sachet', 'tin']], ['Length', ['metre', 'roll']]];
  function catIcon(id) { var c = S.cats.filter(function (x) { return x.id === id; })[0]; return (c && ICONS[c.slug]) || '📦'; }
  function catName(id) { var c = S.cats.filter(function (x) { return x.id === id; })[0]; return c ? c.name : 'Uncategorised'; }
  function discPct(p) { var o = Number(p.old_price), n = Number(p.price); return o > n && n >= 0 ? Math.max(1, Math.round((o - n) / o * 100)) : 0; }
  function priceHtml(p) {
    var d = discPct(p);
    return (d ? '<s style="color:var(--mu);font-weight:500;font-size:.78rem">' + money(p.old_price) + '</s> ' : '') + money(p.price) + (d ? ' <span class="cx-bd">-' + d + '%</span>' : '') + (p.unit ? ' <span style="color:var(--mu);font-weight:500;font-size:.78rem">/ ' + esc(p.unit) + '</span>' : '');
  }

  /* ---------- generic modal ---------- */
  function modal(title, bodyHtml, okText, onOk, onMount) {
    var m = el('div', 'modal'), c = el('div', 'card');
    c.innerHTML = '<h2 style="margin-top:0">' + title + '</h2><div id="cx-mb">' + bodyHtml + '</div><div class="err" id="cx-me" hidden></div><div class="acts"><button class="btn alt" type="button" id="cx-mn">Cancel</button><button class="btn" type="button" id="cx-my">' + okText + '</button></div>';
    m.appendChild(c); D.body.appendChild(m);
    var close = function () { m.remove(); }, ok = c.querySelector('#cx-my'), er = c.querySelector('#cx-me');
    c.querySelector('#cx-mn').onclick = close;
    ok.onclick = function () {
      er.hidden = true; ok.disabled = true;
      Promise.resolve().then(onOk).then(function () { close(); return load(); }).then(function () { view(); })
        .catch(function (e) { ok.disabled = false; er.textContent = e.message || 'Something went wrong'; er.hidden = false; });
    };
    if (onMount) onMount(c);
  }
  function v(id) { return $(id).value; }
  function num(id) { return Number(v(id)); }

  /* ---------- image upload (resized client-side, stored in Supabase Storage) ---------- */
  function shrink(file) {
    return new Promise(function (res, rej) {
      var img = new Image(); img.onload = function () {
        var k = Math.min(1, 1600 / Math.max(img.width, img.height)), c = D.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        c.toBlob(function (b) { b ? res(b) : rej(new Error('Image failed')); }, 'image/jpeg', 0.9);
      }; img.onerror = function () { rej(new Error('Not an image')); }; img.src = URL.createObjectURL(file);
    });
  }
  function upload(file, base) {
    return shrink(file).then(function (b) {
      var path = base + '-' + Date.now() + Math.floor(Math.random() * 99) + '.jpg';
      return call('/storage/v1/object/product-images/' + path, { m: 'POST', body: b, h: { 'Content-Type': 'image/jpeg' } }).then(function () { return SB + '/storage/v1/object/public/product-images/' + path; });
    });
  }

  /* ---------- Add / Edit item ---------- */
  function itemForm(p, from) {
    var edit = !!p, tpl = !edit && from ? from : null, imgs = edit ? (p.images || []).slice() : (tpl ? (tpl.images || []).slice() : []);
    var opts = S.cats.map(function (c) { return '<option value="' + c.id + '"' + (edit && p.category_id === c.id ? ' selected' : '') + '>' + (ICONS[c.slug] ? ICONS[c.slug] + ' ' : '') + esc(c.name) + '</option>'; }).join('');
    var curU = edit && p.unit ? String(p.unit) : '', knownU = UNITS.some(function (g) { return g[1].indexOf(curU) > -1; });
    var unitHtml = '<label>Unit of sale</label><select class="cx-f" id="cx-unit"><option value="">No unit (sold per item)</option>' +
      UNITS.map(function (g) { return '<optgroup label="' + g[0] + '">' + g[1].map(function (u) { return '<option value="' + esc(u) + '"' + (curU === u ? ' selected' : '') + '>' + esc(u) + '</option>'; }).join('') + '</optgroup>'; }).join('') +
      '<option value="__custom"' + (curU && !knownU ? ' selected' : '') + '>Custom…</option></select>' +
      '<input class="cx-f" id="cx-unitc" maxlength="30" placeholder="Type the unit, e.g. 250 g tin" value="' + esc(curU && !knownU ? curU : '') + '"' + (curU && !knownU ? '' : ' hidden') + ' style="margin-top:.4rem">' +
      '<div class="meta">Customers see it next to the price, e.g. "Per kg" or "Per litre".</div>';
    var packHtml = (tpl && !tpl.variant_label ? '<div class="cx-pr" style="margin-top:.6rem"><div class="cx-pt">\ud83d\udce6 Pack size of the existing item</div><input class="cx-f" id="cx-vl0" maxlength="30" placeholder="e.g. 1 Litre"><div class="meta">The item you are copying (' + esc(tpl.name) + ') has no pack size yet. Type its size so buyers can choose between the two.</div></div>' : '') +
      '<div class="cx-pr" style="margin-top:.6rem"><div class="cx-pt">\ud83d\udce6 Pack size (what buyers choose)</div><input class="cx-f" id="cx-vl" maxlength="30" placeholder="e.g. 1 Litre, 250 mL, 50 kg bag" value="' + esc(edit && p.variant_label ? p.variant_label : '') + '">' +
      '<div class="meta">Leave empty if this item has only one size. To sell the same product in other sizes, save it, then tap <b>\uff0b Pack size</b> on its card. Each size has its own price, cost and stock below.</div></div>';
    var body = '<label>Category</label><select class="cx-f" id="cx-cat">' + opts + '<option value="__new">＋ Create new category…</option></select>' +
      '<input class="cx-f" id="cx-newcat" placeholder="New category name" hidden style="margin-top:.4rem">' +
      '<label>Item name</label><input class="cx-f" id="cx-name" maxlength="120" value="' + esc(edit ? (p.base || p.name) : '') + '">' + packHtml +
      '<label>Description (shown on the product page)</label><textarea class="cx-f" id="cx-desc" rows="9" maxlength="4000" placeholder="One point per line.\nPut a section title on its own line, e.g.\nKey Features\nSpecifications\nBrand: Hisense\nWhat is in the box?">' + esc(edit ? p.description || '' : '') + '</textarea>' +
      unitHtml + '<div class="cx-pr"><div class="cx-pt">🏷️ Pricing &amp; discount</div><div class="cx-r3">' +
      '<div><label>Previous price</label><input class="cx-f" id="cx-old" type="number" min="0" inputmode="decimal" placeholder="optional" value="' + (edit && p.old_price ? p.old_price : '') + '"></div>' +
      '<div><label>Current price *</label><input class="cx-f" id="cx-price" type="number" min="0" inputmode="decimal" value="' + (edit ? p.price : '') + '"></div>' +
      '<div><label>Discount %</label><input class="cx-f" id="cx-pct" type="number" min="0" max="95" step="any" inputmode="decimal" placeholder="auto"></div></div>' +
      '<div class="meta" style="margin:.4rem 0 0">Fill any two and the third is worked out for you. Customers see the old price crossed out, the new price and the % off.</div>' +
      '<div class="cx-quick" id="cx-quick"></div><div class="cx-pvc" id="cx-pvc"></div></div>' +
      '<div class="cx-r">' +
      '<div><label>Cost price per unit · COGS (KSh)</label><input class="cx-f" id="cx-cost" type="number" min="0" inputmode="decimal" value="' + (edit ? p.cost : '') + '"></div>' +
      '<div><label>' + (edit ? 'Pieces in stock' : 'Initial pieces') + '</label><input class="cx-f" id="cx-stock" type="number" min="0" inputmode="numeric" value="' + (edit ? p.stock : '') + '"' + (edit ? ' disabled' : '') + '></div>' +
      '<div><label>Low-stock alert below</label><input class="cx-f" id="cx-low" type="number" min="0" value="' + (edit ? p.low_at : 5) + '"></div></div>' +
      '<label style="display:flex;gap:.5rem;align-items:center"><input type="checkbox" id="cx-feat"' + (edit && p.featured ? ' checked' : '') + '> Feature as advert / top banner</label>' +
      '<label>Photos</label><input type="file" id="cx-file" accept="image/*" multiple><div class="cx-th" id="cx-th"></div><div class="meta" id="cx-up"></div>';
    modal(edit ? 'Edit item' : 'Add new item', body, edit ? 'Save changes' : 'Publish to website', function () {
      if ($('cx-up').textContent) throw new Error('Wait for photos to finish uploading');
      var name = v('cx-name').trim(), price = num('cx-price'), cost = num('cx-cost'), stock = edit ? p.stock : parseInt(v('cx-stock') || 0, 10);
      if (!name) throw new Error('Enter an item name'); if (!(price >= 0) || v('cx-price') === '') throw new Error('Enter the current price');
      var vl = v('cx-vl').trim(), vl0 = tpl && !tpl.variant_label ? v('cx-vl0').trim() : ''; if (tpl && !vl) throw new Error('Type the pack size for this new item, e.g. 250 mL'); if (tpl && !tpl.variant_label && !vl0) throw new Error('Type the pack size of the existing item too');
      var unit = v('cx-unit') === '__custom' ? v('cx-unitc').trim() : v('cx-unit'); if (v('cx-unit') === '__custom' && !unit) throw new Error('Type the custom unit, or choose one from the list');
      var oldP = v('cx-old') === '' ? null : num('cx-old'); if (oldP != null && !(oldP > price)) throw new Error('Previous price must be higher than the current price (or leave it empty)');
      if (!(cost >= 0) || v('cx-cost') === '') throw new Error('Enter the cost price'); if (!(stock >= 0)) throw new Error('Enter pieces in stock');
      var catP = v('cx-cat') === '__new' ? (function () {
        var cn = v('cx-newcat').trim(); if (!cn) throw new Error('Enter the new category name');
        return call('/rest/v1/categories?on_conflict=slug', { m: 'POST', h: { Prefer: 'resolution=merge-duplicates,return=representation' }, body: { name: cn, slug: slug(cn) } }).then(function (r) { return r[0].id; });
      })() : Promise.resolve(parseInt(v('cx-cat'), 10));
      return catP.then(function (cid) {
        var row = { category_id: cid, name: name, price: price, cost: cost, low_at: parseInt(v('cx-low') || 5, 10), featured: $('cx-feat').checked, images: imgs };
        if (oldP != null || (edit && p.old_price != null)) row.old_price = oldP;
        if (unit || (edit && p.unit)) row.unit = unit || null;
        var grp = tpl ? (tpl.variant_group || slug(tpl.base || tpl.name)) : (edit && p.variant_group) || slug(name);
        if (vl || (edit && (p.variant_label || p.variant_group))) { row.variant_label = vl || null; row.variant_group = vl ? grp : null; }
        var desc = v('cx-desc').trim(); if (desc || (edit && p.description)) row.description = desc;
        if (edit) return call('/rest/v1/products?id=eq.' + encodeURIComponent(p.id), { m: 'PATCH', h: { Prefer: 'return=minimal' }, body: row });
        var id = slug(name + (vl ? ' ' + vl : '')) || 'item', n = 2, base = id; while (S.prods.some(function (x) { return x.id === id; })) id = base + '-' + n++;
        row.id = id; row.stock = stock;
        var first = tpl && !tpl.variant_label ? call('/rest/v1/products?id=eq.' + encodeURIComponent(tpl.id), { m: 'PATCH', h: { Prefer: 'return=minimal' }, body: { variant_label: vl0, variant_group: grp } }) : Promise.resolve();
        return first.then(function () { return call('/rest/v1/products', { m: 'POST', h: { Prefer: 'return=minimal' }, body: row }); });
      }).catch(function (e) {
        if (/old_price/.test(e.message || '')) throw new Error('Run setup-pricing.sql in Supabase first to enable previous prices, then save again.');
        if (/\bunit\b/.test(e.message || '')) throw new Error('Units are not set up yet. Run this once in the Supabase SQL editor, then save again: alter table products add column if not exists unit text;');
        if (/variant_/.test(e.message || '')) throw new Error('Pack sizes are not set up yet. Run this once in the Supabase SQL editor, then save again: alter table products add column if not exists variant_group text, add column if not exists variant_label text;');
        throw e;
      });
    }, function (c) {
      if (tpl) {
        c.querySelector('#cx-name').value = tpl.base || tpl.name; c.querySelector('#cx-name').readOnly = true;
        c.querySelector('#cx-desc').value = tpl.description || ''; c.querySelector('#cx-cat').value = String(tpl.category_id);
        var u0 = c.querySelector('#cx-unit'), uc0 = c.querySelector('#cx-unitc'); if (tpl.unit) { u0.value = tpl.unit; if (u0.value !== tpl.unit) { u0.value = '__custom'; uc0.value = tpl.unit; uc0.hidden = false; } }
      }
      var eo = c.querySelector('#cx-old'), ep = c.querySelector('#cx-price'), eq = c.querySelector('#cx-pct'), pvc = c.querySelector('#cx-pvc'), qk = c.querySelector('#cx-quick');
      function fv(e) { var x = parseFloat(e.value); return x > 0 ? x : 0; }
      function pctOf(o, n) { return Math.round((o - n) / o * 1000) / 10; }
      function paint() {
        var o = fv(eo), n = fv(ep), h = '';
        if (!n && !o) h = '<span class="meta">Enter the current price to preview how customers will see it.</span>';
        else if (o && n && o <= n) h = '<span class="bad">Previous price must be higher than the current price.</span>';
        else if (o && n) h = '<span class="cx-bd">-' + Math.max(1, Math.round((o - n) / o * 100)) + '%</span> <s>' + money(o) + '</s> <b>' + money(n) + '</b><div class="meta">Customers save ' + money(o - n) + '</div>';
        else if (n) h = '<b>' + money(n) + '</b><div class="meta">No discount shown. Add a previous price or a discount %.</div>';
        pvc.innerHTML = h;
      }
      function onPrices(e) {
        var t = e && e.target, o = fv(eo), n = fv(ep), d = parseFloat(eq.value), okd = d > 0 && d < 100;
        if (t === ep && !o && n && okd) { eo.value = Math.round(n / (1 - d / 100)); o = fv(eo); }
        else if (t === eo && o && !n && okd) { ep.value = Math.round(o * (1 - d / 100)); n = fv(ep); }
        eq.value = o > n && n ? pctOf(o, n) : '';
        paint();
      }
      function fromPct(d) {
        d = parseFloat(d); if (!(d > 0) || d >= 100) { paint(); return; }
        var o = fv(eo), n = fv(ep);
        if (o) ep.value = Math.round(o * (1 - d / 100)); else if (n) eo.value = Math.round(n / (1 - d / 100));
        paint();
      }
      eo.oninput = ep.oninput = onPrices; eq.oninput = function () { fromPct(eq.value); };
      [5, 10, 15, 20, 25, 30, 40, 50].forEach(function (d) { var b = el('button', 'cx-chip', d + '% off'); b.type = 'button'; b.onclick = function () { eq.value = d; fromPct(d); }; qk.appendChild(b); });
      var nd = el('button', 'cx-chip alt', 'No discount'); nd.type = 'button'; nd.onclick = function () { eo.value = ''; eq.value = ''; paint(); }; qk.appendChild(nd);
      onPrices();
      var us = c.querySelector('#cx-unit'), uc = c.querySelector('#cx-unitc'); us.onchange = function () { uc.hidden = us.value !== '__custom'; if (!uc.hidden) uc.focus(); };
      var sel = c.querySelector('#cx-cat'), th = c.querySelector('#cx-th');
      if (!S.cats.length) { sel.value = '__new'; } sel.onchange = function () { c.querySelector('#cx-newcat').hidden = sel.value !== '__new'; }; sel.onchange();
      function thumbs() {
        th.innerHTML = ''; imgs.forEach(function (u, i) { var d = el('div', '', '<img src="' + esc(u) + '" alt=""><button type="button" aria-label="Remove">×</button>'); d.querySelector('button').onclick = function () { imgs.splice(i, 1); thumbs(); }; th.appendChild(d); });
      } thumbs();
      c.querySelector('#cx-file').onchange = function (e) {
        var fs = [].slice.call(e.target.files), up = c.querySelector('#cx-up'); if (!fs.length) return; up.textContent = 'Uploading ' + fs.length + ' photo(s)…';
        var base = slug(v('cx-name')) || 'item';
        Promise.all(fs.map(function (f) { return upload(f, base); })).then(function (us) { imgs.push.apply(imgs, us); up.textContent = ''; thumbs(); })
          .catch(function (er) { up.textContent = ''; var x = c.querySelector('#cx-me'); x.textContent = 'Upload failed: ' + er.message; x.hidden = false; });
        e.target.value = '';
      };
    });
  }

  /* ---------- Restock ---------- */
  function restockForm(p) {
    var today = new Date().toISOString().slice(0, 10);
    var body = '<p class="meta"><b>' + esc(p.name) + '</b> · ' + p.stock + ' in stock at ' + money(p.cost) + ' each</p>' +
      '<div class="cx-r"><div><label>+ Pieces</label><input class="cx-f" id="cx-q" type="number" min="1" inputmode="numeric"></div>' +
      '<div><label>Cost per unit (KSh)</label><input class="cx-f" id="cx-c" type="number" min="0" inputmode="decimal" value="' + p.cost + '"></div></div>' +
      '<label>Supplier</label><input class="cx-f" id="cx-s" maxlength="100"><label>Restock date</label><input class="cx-f" id="cx-d" type="date" value="' + today + '">' +
      '<div class="cx-pv" id="cx-pv">Enter pieces to preview new stock and average cost.</div>';
    modal('Restock item', body, 'Save restock', function () {
      var q = parseInt(v('cx-q'), 10), c = num('cx-c'); if (!(q > 0)) throw new Error('Enter pieces to add'); if (!(c >= 0)) throw new Error('Enter the unit cost');
      return call('/rest/v1/rpc/restock_product', { m: 'POST', body: { p_id: p.id, p_qty: q, p_cost: c, p_supplier: v('cx-s').trim() || null, p_date: v('cx-d') || null } });
    }, function () {
      function pv() { var q = parseInt(v('cx-q'), 10) || 0, c = num('cx-c') || 0; if (q < 1) return;
        var avg = (p.stock * p.cost + q * c) / (p.stock + q); $('cx-pv').innerHTML = 'New stock: <b>' + (p.stock + q) + '</b> pcs · Average cost: <b>' + money(avg) + '</b> · Outlay: <b>' + money(q * c) + '</b>'; }
      $('cx-q').oninput = $('cx-c').oninput = pv;
    });
  }

  /* ---------- Loss / write-off ---------- */
  function lossForm(p) {
    var body = '<p class="meta"><b>' + esc(p.name) + '</b> · ' + p.stock + ' in stock at ' + money(p.cost) + ' each</p>' +
      '<div class="cx-r"><div><label>Pieces lost</label><input class="cx-f" id="cx-q" type="number" min="1" max="' + p.stock + '" inputmode="numeric"></div>' +
      '<div><label>Reason</label><select class="cx-f" id="cx-r"><option>Damaged</option><option>Transit loss</option><option>Returned</option><option>Expired</option><option>Other</option></select></div></div>' +
      '<label>Note (optional)</label><input class="cx-f" id="cx-n" maxlength="200"><div class="cx-pv" id="cx-pv">Loss = pieces × cost</div>';
    modal('Log loss / write-off', body, 'Log loss', function () {
      var q = parseInt(v('cx-q'), 10); if (!(q > 0)) throw new Error('Enter pieces lost'); if (q > p.stock) throw new Error('Only ' + p.stock + ' in stock');
      return call('/rest/v1/rpc/record_loss', { m: 'POST', body: { p_id: p.id, p_qty: q, p_reason: v('cx-r'), p_note: v('cx-n').trim() || null } });
    }, function () { $('cx-q').oninput = function () { var q = parseInt(v('cx-q'), 10) || 0; $('cx-pv').innerHTML = 'Write-off cost: <b>' + money(q * p.cost) + '</b>'; }; });
  }

  /* ---------- Restock & loss history ---------- */
  function history(p) {
    Promise.all([call('/rest/v1/stock_restocks?select=*&product_id=eq.' + encodeURIComponent(p.id) + '&order=created_at.desc&limit=25'),
                 call('/rest/v1/loss_logs?select=*&product_id=eq.' + encodeURIComponent(p.id) + '&order=created_at.desc&limit=25')]).then(function (r) {
      var ev = r[0].map(function (x) { return { t: x.created_at, h: '<b style="color:var(--ok)">+' + x.qty + ' pcs</b> @ ' + money(x.unit_cost) + (x.supplier ? ' · ' + esc(x.supplier) : '') + '<small> · avg cost was ' + money(x.cost_before) + '</small>' }; })
        .concat(r[1].map(function (x) { return { t: x.created_at, h: '<b style="color:var(--no)">−' + x.qty + ' pcs</b> ' + esc(x.reason) + ' · ' + money(x.loss) + (x.note ? '<small> · ' + esc(x.note) + '</small>' : '') }; }))
        .sort(function (a, b) { return a.t < b.t ? 1 : -1; });
      var html = '<p class="meta"><b>' + esc(p.name) + '</b></p>' + (ev.length ? '<div class="tl">' + ev.map(function (e) { return '<div class="st" style="color:var(--tx)">' + e.h + '<small>' + new Date(e.t).toLocaleString('en-KE') + '</small></div>'; }).join('') + '</div>' : '<div class="empty">No restocks or write-offs yet.</div>');
      modal('Stock history', html, 'Close', function () {});
    }).catch(function (e) { toast(e.message); });
  }

  /* ---------- render ---------- */
  function totals(list) {
    return list.reduce(function (a, p) { var s = stat(p); a.stock += p.stock; a.sold += s.sold; a.sales += s.sales; a.cogs += s.cogs; a.profit += s.profit; a.loss += s.loss; a.value += p.stock * p.cost; return a; }, { stock: 0, sold: 0, sales: 0, cogs: 0, profit: 0, loss: 0, value: 0 });
  }
  function plBox(T, X) {
    var by = {}, rets = 0;
    (S.logs || []).forEach(function (l) { var k = l.reason || 'Other'; by[k] = by[k] || { q: 0, v: 0 }; by[k].q += +l.qty || 0; by[k].v += +l.loss || 0; });
    var rows = Object.keys(by).sort().map(function (k) { return '<tr><td>&nbsp;&nbsp;' + esc(k) + (k === 'Returned' ? ' (returns)' : '') + ' · ' + by[k].q + ' pcs</td><td class="neg">−' + money(by[k].v) + '</td></tr>'; }).join('');
    var net = T.profit - T.loss;
    return '<details class="cx-pl" open><summary>Profit &amp; loss breakdown</summary><table class="cx-t">' +
      '<tr><td>Total sales</td><td>' + money(T.sales) + '</td></tr>' +
      '<tr><td>− Cost of goods sold (COGS)</td><td class="neg">−' + money(T.cogs) + '</td></tr>' +
      '<tr class="sub"><td>= Total profit</td><td>' + money(T.profit) + '</td></tr>' +
      '<tr><td>Losses logged:</td><td></td></tr>' + (rows || '<tr><td>&nbsp;&nbsp;None</td><td>' + money(0) + '</td></tr>') +
      '<tr class="sub"><td>= Total loss (write-offs &amp; returns)</td><td class="neg">−' + money(T.loss) + '</td></tr>' +
      '<tr class="tot"><td>NET PROFIT</td><td>' + money(net) + '</td></tr>' +
      '<tr><td>Cancelled / declined orders · ' + X.n + '</td><td class="neg">' + money(X.value) + '</td></tr>' +
      '<tr class="sub"><td>Total loss incl. cancelled orders</td><td class="neg">−' + money(T.loss + X.value) + '</td></tr></table>' +
      '<p class="meta" style="margin:.4rem .2rem">Cancelled or declined orders were never counted as sales, so they are shown as lost sales and are not deducted from profit. Log returned goods with <b>Log loss → Returned</b> so they count as a loss.</p></details>';
  }
  function neg(n) { return n < 0 ? ' class="neg"' : ''; }
  function render() {
    var all = S.prods, T = totals(all), X = cancelled(), rl = S.range === 'all' ? '' : ' · ' + RANGES.filter(function (r) { return r[0] === S.range; })[0][1].toUpperCase(), low = all.filter(function (p) { return p.active && p.stock < p.low_at; });
    var q = S.q.trim().toLowerCase();
    var shown = all.filter(function (p) { return (S.cat === 'all' || String(p.category_id) === S.cat) && (!q || p.name.toLowerCase().indexOf(q) > -1); });
    root.innerHTML = '<div class="err" id="cx-err" hidden></div><div class="tabs" id="cx-rg"></div>' +
      '<div class="cx-k"><div class="hi"><small>TOTAL SALES' + rl + '</small><b>' + money(T.sales) + '</b></div>' +
      '<div><small>COST OF GOODS SOLD (COGS)</small><b>' + money(T.cogs) + '</b></div>' +
      '<div class="lime"><small>TOTAL PROFIT (sales − COGS)</small><b>' + money(T.profit) + '</b></div>' +
      '<div><small>TOTAL LOSS (write-offs &amp; returns)</small><b style="color:var(--no)">' + money(T.loss) + '</b></div>' +
      '<div><small>NET PROFIT (profit − loss)</small><b' + neg(T.profit - T.loss) + '>' + money(T.profit - T.loss) + '</b></div>' +
      '<div><small>CANCELLED / DECLINED ORDERS</small><b>' + X.n + ' · ' + money(X.value) + '</b></div>' +
      '<div><small>PIECES LEFT · SOLD</small><b>' + T.stock + ' · ' + T.sold + '</b></div><div><small>STOCK VALUE (AT COST)</small><b>' + money(T.value) + '</b></div></div>' +
      plBox(T, X) +
      (low.length ? '<div class="err" style="background:#fef3c7;color:#92400e">⚠ ' + low.length + ' item' + (low.length > 1 ? 's' : '') + ' low on stock: ' + low.slice(0, 4).map(function (p) { return esc(p.name) + ' (' + p.stock + ')'; }).join(', ') + (low.length > 4 ? '…' : '') + '</div>' : '') +
      '<p style="margin:0 0 .7rem"><button class="btn" id="cx-add" type="button" style="width:100%">＋ Add new item</button></p>' +
      '<div class="tabs" id="cx-chips"></div><input id="cx-q" type="search" placeholder="Search items" value="' + esc(S.q) + '" style="width:100%;padding:.7rem .8rem;border:1px solid var(--ln);border-radius:10px;font:inherit;margin-bottom:.8rem">' +
      '<div id="cx-list"></div><h2 style="font-size:1.05rem;margin:1.2rem 0 .5rem">Financial ledger' + (S.range === 'all' ? '' : ' · ' + RANGES.filter(function (r) { return r[0] === S.range; })[0][1]) + '</h2><div class="lg" id="cx-led"></div>';
    $('cx-add').onclick = function () { itemForm(); };
    RANGES.forEach(function (r) { var b = el('button', S.range === r[0] ? 'on' : '', r[1]); b.type = 'button'; b.onclick = function () { S.range = r[0]; load().then(render).catch(function (x) { toast(x.message + ' (run setup-catalog-2.sql?)'); }); }; $('cx-rg').appendChild(b); });
    var chips = $('cx-chips'); [{ id: 'all', name: 'All (' + all.length + ')' }].concat(S.cats.map(function (c) { return { id: String(c.id), name: c.name }; })).forEach(function (c) {
      var cc = S.cats.filter(function (x) { return String(x.id) === c.id; })[0], b = el('button', S.cat === c.id ? 'on' : '', (cc && ICONS[cc.slug] ? ICONS[cc.slug] + ' ' : '') + esc(c.name)); b.type = 'button'; b.onclick = function () { S.cat = c.id; render(); }; chips.appendChild(b); });
    $('cx-q').oninput = function (e) { S.q = e.target.value; var pos = e.target.selectionStart; render(); var n = $('cx-q'); n.focus(); n.setSelectionRange(pos, pos); };
    var L = $('cx-list'); if (!shown.length) L.appendChild(el('div', 'empty', all.length ? 'No items match.' : 'No items yet. Tap “Add new item” to publish your first product.'));
    shown.forEach(function (p) {
      var s = stat(p), lowS = p.stock < p.low_at, c = el('div', 'card'), margin = p.price ? Math.round((p.price - p.cost) / p.price * 100) : 0;
      c.innerHTML = '<div class="cx-p">' + (p.images && p.images[0] ? '<img src="' + esc(p.images[0]) + '" alt="">' : '<div class="cx-ph">' + catIcon(p.category_id) + '</div>') +
        '<div style="min-width:0"><div class="ref">' + esc(p.name) + '</div><div class="when">' + esc(catName(p.category_id)) + '</div><div style="margin-top:.3rem">' +
        (p.stock === 0 ? '<span class="badge b-declined">Out of stock</span> ' : lowS ? '<span class="badge b-low">Low · ' + p.stock + ' left</span> ' : '<span class="badge b-paid">In stock</span> ') +
        (p.featured ? '<span class="badge b-ad">Advert</span> ' : '') + (p.active ? '' : '<span class="badge b-pending">Hidden</span>') + '</div></div></div>' +
        (p.description ? '<div class="meta" style="margin:.5rem 0 0;white-space:pre-line">' + esc(p.description.length > 140 ? p.description.slice(0, 140) + '…' : p.description) + '</div>' : '<div class="meta" style="margin:.5rem 0 0;color:#b45309">No description yet. Tap Edit to add one.</div>') +
        '<div class="cx-g"><div><span>Price</span><b>' + priceHtml(p) + '</b></div><div><span>COGS / unit</span><b>' + money(p.cost) + '</b></div>' +
        '<div><span>Left / Sold</span><b>' + p.stock + ' / ' + s.sold + '</b></div><div><span>Margin</span><b>' + margin + '%</b></div>' +
        '<div><span>Sales</span><b>' + money(s.sales) + '</b></div><div><span>COGS (sold)</span><b>' + money(s.cogs) + '</b></div>' +
        '<div><span>Profit</span><b>' + money(s.profit) + '</b></div><div><span>Loss / returns</span><b' + (s.loss ? ' style="color:var(--no)"' : '') + '>' + money(s.loss) + '</b></div></div>' +
        '<div class="acts"><button class="btn ok sm" data-a="r" type="button">＋ Restock</button><button class="btn alt sm" data-a="l" type="button">Log loss</button><button class="btn alt sm" data-a="y" type="button">History</button><button class="btn alt sm" data-a="f" type="button">' + (p.featured ? 'Remove advert' : '★ Advert') + '</button><button class="btn alt sm" data-a="e" type="button">Edit</button><button class="btn alt sm" data-a="v" type="button">＋ Pack size</button><button class="btn alt sm" data-a="h" type="button">' + (p.active ? 'Hide' : 'Show') + '</button></div>';
      c.onclick = function (e) { var a = e.target.getAttribute && e.target.getAttribute('data-a'); if (!a) return;
        if (a === 'r') restockForm(p); else if (a === 'l') lossForm(p); else if (a === 'e') itemForm(p); else if (a === 'v') itemForm(null, p); else if (a === 'y') history(p);
        else if (a === 'f') { e.target.disabled = true; call('/rest/v1/products?id=eq.' + encodeURIComponent(p.id), { m: 'PATCH', h: { Prefer: 'return=minimal' }, body: { featured: !p.featured } }).then(load).then(render).catch(function (x) { toast(x.message); }); }
        else { e.target.disabled = true; call('/rest/v1/products?id=eq.' + encodeURIComponent(p.id), { m: 'PATCH', h: { Prefer: 'return=minimal' }, body: { active: !p.active } }).then(load).then(render).catch(function (x) { toast(x.message); }); } };
      L.appendChild(c);
    });
    ledger(all);
  }
  function ledger(all) {
    var per = S.range === 'all' ? 'All time' : RANGES.filter(function (r) { return r[0] === S.range; })[0][1];
    var X = cancelled(), G = totals(all), names = {};
    all.forEach(function (p) { names[p.id] = p.name; });
    function pct(a, b) { return b ? Math.round(a / b * 1000) / 10 + '%' : '0%'; }
    function cls(n) { return n < 0 ? ' lg-neg' : ''; }
    function row(p) {
      var s = stat(p);
      return { n: p.name, price: +p.price || 0, cost: +p.cost || 0, mg: p.price ? Math.round((p.price - p.cost) / p.price * 100) : 0, left: p.stock, sold: s.sold, sales: s.sales, cogs: s.cogs, profit: s.profit, loss: s.loss, net: s.profit - s.loss, val: p.stock * p.cost, hid: !p.active };
    }
    var groups = S.cats.concat([{ id: null, name: 'Uncategorised' }]).map(function (c) {
      var ps = all.filter(function (p) { return p.category_id === c.id; }); if (!ps.length) return null;
      var t = totals(ps); t.net = t.profit - t.loss; return { name: c.name, icon: c.slug ? (ICONS[c.slug] || '📦') : '📦', t: t, rows: ps.map(row) };
    }).filter(Boolean);
    G.net = G.profit - G.loss;

    /* ---- desktop table ---- */
    var d = '<div class="lg-desk lg-scroll"><table class="lg-t"><thead><tr><th class="l">Item</th><th>Price</th><th>Cost / unit</th><th>Margin</th><th>Left</th><th>Sold</th><th>Sales</th><th>COGS</th><th>Profit</th><th>Loss</th><th>Net</th><th>Stock value</th></tr></thead><tbody>';
    groups.forEach(function (g) {
      d += '<tr class="lg-cat"><td class="l">' + g.icon + ' ' + esc(g.name) + ' <small>(' + g.rows.length + ' item' + (g.rows.length > 1 ? 's' : '') + ')</small></td><td></td><td></td><td>' + pct(g.t.profit, g.t.sales) + '</td><td>' + g.t.stock + '</td><td>' + g.t.sold + '</td><td>' + money(g.t.sales) + '</td><td>' + money(g.t.cogs) + '</td><td class="' + cls(g.t.profit) + '">' + money(g.t.profit) + '</td><td>' + money(g.t.loss) + '</td><td class="' + cls(g.t.net) + '">' + money(g.t.net) + '</td><td>' + money(g.t.value) + '</td></tr>';
      g.rows.forEach(function (r) {
        d += '<tr><td class="l">' + esc(r.n) + (r.hid ? ' <em>hidden</em>' : '') + '</td><td>' + money(r.price) + '</td><td>' + money(r.cost) + '</td><td>' + r.mg + '%</td><td>' + r.left + '</td><td>' + r.sold + '</td><td>' + money(r.sales) + '</td><td>' + money(r.cogs) + '</td><td class="' + cls(r.profit) + '">' + money(r.profit) + '</td><td>' + (r.loss ? money(r.loss) : '–') + '</td><td class="' + cls(r.net) + '">' + money(r.net) + '</td><td>' + money(r.val) + '</td></tr>';
      });
    });
    d += '</tbody><tfoot><tr><td class="l">ALL ITEMS</td><td></td><td></td><td>' + pct(G.profit, G.sales) + '</td><td>' + G.stock + '</td><td>' + G.sold + '</td><td>' + money(G.sales) + '</td><td>' + money(G.cogs) + '</td><td>' + money(G.profit) + '</td><td>' + money(G.loss) + '</td><td>' + money(G.net) + '</td><td>' + money(G.value) + '</td></tr></tfoot></table></div>';

    /* ---- mobile cards ---- */
    function kv(k, v, c) { return '<div><span>' + k + '</span><b class="' + (c || '') + '">' + v + '</b></div>'; }
    var m = '<div class="lg-mob">';
    groups.forEach(function (g) {
      m += '<details class="lg-g" open><summary><span>' + g.icon + ' ' + esc(g.name) + '</span><b class="' + cls(g.t.net) + '">' + money(g.t.net) + '</b></summary>';
      g.rows.forEach(function (r) {
        m += '<div class="lg-c"><h4>' + esc(r.n) + (r.hid ? ' <em>hidden</em>' : '') + '</h4><div class="lg-kv">' +
          kv('Price', money(r.price)) + kv('Cost / unit', money(r.cost)) + kv('Margin', r.mg + '%') + kv('Left · Sold', r.left + ' · ' + r.sold) +
          kv('Sales', money(r.sales)) + kv('COGS', money(r.cogs)) + kv('Profit', money(r.profit), cls(r.profit)) + kv('Loss', r.loss ? money(r.loss) : '–') +
          kv('Net', money(r.net), cls(r.net)) + kv('Stock value', money(r.val)) + '</div></div>';
      });
      m += '<div class="lg-sub"><div class="lg-kv">' + kv('Category sales', money(g.t.sales)) + kv('COGS', money(g.t.cogs)) + kv('Profit', money(g.t.profit), cls(g.t.profit)) + kv('Loss', money(g.t.loss)) + kv('Net', money(g.t.net), cls(g.t.net)) + kv('Stock value', money(g.t.value)) + '</div></div></details>';
    });
    m += '<div class="lg-tot"><h4>ALL ITEMS · ' + esc(per) + '</h4><div class="lg-kv">' + kv('Sales', money(G.sales)) + kv('COGS', money(G.cogs)) + kv('Profit', money(G.profit)) + kv('Loss', money(G.loss)) + kv('Net profit', money(G.net)) + kv('Stock value', money(G.value)) + kv('Left · Sold', G.stock + ' · ' + G.sold) + kv('Margin', pct(G.profit, G.sales)) + '</div></div></div>';

    /* ---- supporting records ---- */
    function dt(x) { return x ? new Date(x).toLocaleString('en-KE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '–'; }
    function list(title, head, rows, empty) {
      var h = '<details class="lg-sec" open><summary>' + title + ' <span class="lg-n">' + rows.length + '</span></summary>';
      if (!rows.length) return h + '<div class="lg-empty">' + empty + '</div></details>';
      h += '<div class="lg-lst"><div class="lg-lh">' + head.map(function (x) { return '<span>' + x + '</span>'; }).join('') + '</div>';
      rows.forEach(function (r) { h += '<div class="lg-lr">' + r.map(function (x, i) { return '<span data-l="' + esc(head[i]) + '">' + x + '</span>'; }).join('') + '</div>'; });
      return h + '</div></details>';
    }
    var losses = (S.logs || []).slice().sort(function (a, b) { return a.created_at < b.created_at ? 1 : -1; }).map(function (l) { return [dt(l.created_at), esc(names[l.product_id] || 'Item'), esc(l.reason || 'Other'), (+l.qty || 0) + ' pcs', '<b class="lg-neg">−' + money(l.loss) + '</b>', esc(l.note || '')]; });
    var rests = (S.rest || []).slice().sort(function (a, b) { return a.created_at < b.created_at ? 1 : -1; }).map(function (r) { return [dt(r.created_at), esc(names[r.product_id] || 'Item'), '+' + (+r.qty || 0) + ' pcs', money(r.unit_cost), '<b>' + money((+r.qty || 0) * (+r.unit_cost || 0)) + '</b>', esc(r.supplier || '')]; });
    var spent = (S.rest || []).reduce(function (a, r) { return a + (+r.qty || 0) * (+r.unit_cost || 0); }, 0);
    var canc = (window.STM_orders || []).filter(function (o) { var b = bounds(); return (o.status === 'declined' || o.status === 'cancelled') && !(b && new Date(o.handled_at || o.created_at) < b[0]); })
      .map(function (o) { return [dt(o.handled_at || o.created_at), esc(o.ref || o.order_ref || o.id || ''), esc(o.name || o.customer_name || o.customer || ''), esc(o.status), '<b class="lg-neg">' + money(o.subtotal) + '</b>']; });

    $('cx-led').innerHTML =
      '<div class="lg-hd"><div><b>Period:</b> ' + esc(per) + '</div><div><b>Items:</b> ' + all.length + '</div><div><b>Generated:</b> ' + dt(new Date()) + '</div></div>' +
      d + m +
      '<div class="lg-chk"><b>How it adds up</b><br>Sales ' + money(G.sales) + ' − COGS ' + money(G.cogs) + ' = Profit ' + money(G.profit) + '. Profit − Losses ' + money(G.loss) + ' = <b class="' + cls(G.net) + '">Net ' + money(G.net) + '</b>. Cancelled/declined orders (' + X.n + ') worth ' + money(X.value) + ' were never counted as sales.</div>' +
      list('Losses &amp; returns', ['Date', 'Item', 'Reason', 'Qty', 'Loss', 'Note'], losses, 'No losses or returns logged for this period.') +
      list('Restocks (money spent on stock · ' + money(spent) + ')', ['Date', 'Item', 'Qty', 'Unit cost', 'Total', 'Supplier'], rests, 'No restocks recorded for this period.') +
      list('Cancelled / declined orders', ['Date', 'Order', 'Customer', 'Status', 'Value'], canc, 'No cancelled or declined orders for this period.');
  }

  /* ---------- Stock tab (live products: pieces left, restock, loss) ---------- */
  function renderStockView() {
    var all = S.prods.slice().sort(function (a, b) { return a.stock - b.stock; }), T = totals(all);
    root.innerHTML = '<div class="err" id="cx-err" hidden></div><p class="meta">Pieces left for every item on the website. An item shows <b>Sold out</b> to customers when it reaches 0. Use Restock when new stock arrives.</p>' +
      '<div class="cx-k"><div><small>ITEMS</small><b>' + all.length + '</b></div><div><small>PIECES LEFT</small><b>' + T.stock + '</b></div></div><div id="cx-list"></div>';
    var L = $('cx-list'); if (!all.length) L.appendChild(el('div', 'empty', 'No items yet. Add your first product in the Catalog tab.'));
    all.forEach(function (p) {
      var lowS = p.stock < p.low_at, c = el('div', 'card'), s = stat(p);
      c.innerHTML = '<div class="cx-p">' + (p.images && p.images[0] ? '<img src="' + esc(p.images[0]) + '" alt="">' : '<div class="cx-ph">' + catIcon(p.category_id) + '</div>') +
        '<div style="min-width:0"><div class="ref">' + esc(p.name) + '</div><div class="when">' + esc(catName(p.category_id)) + '</div><div style="margin-top:.3rem">' +
        (p.stock <= 0 ? '<span class="badge b-declined">Sold out</span> ' : lowS ? '<span class="badge b-low">Low · ' + p.stock + ' left</span> ' : '<span class="badge b-paid">In stock · ' + p.stock + ' left</span> ') +
        (p.active ? '' : '<span class="badge b-pending">Hidden</span>') + '</div><div class="meta" style="margin-top:.3rem">' + s.sold + ' sold · alert below ' + p.low_at + '</div></div></div>' +
        '<div class="acts"><button class="btn ok sm" data-a="r" type="button">＋ Restock</button><button class="btn alt sm" data-a="l" type="button">Log loss</button><button class="btn alt sm" data-a="y" type="button">History</button></div>';
      c.onclick = function (e) { var a = e.target.getAttribute && e.target.getAttribute('data-a'); if (a === 'r') restockForm(p); else if (a === 'l') lossForm(p); else if (a === 'y') history(p); };
      L.appendChild(c);
    });
  }

  window.STMCatalog = {
    mountStock: function (c) {
      root = c; view = renderStockView; if (!D.getElementById('cx-css')) { var s = el('style'); s.id = 'cx-css'; s.textContent = css; D.head.appendChild(s); }
      root.innerHTML = '<div class="empty">Loading stock…</div>';
      load().then(renderStockView).catch(function (e) { root.innerHTML = '<div class="err">Could not load stock (' + esc(e.message) + ').</div>'; });
    },
    mount: function (c) {
      root = c; view = render; if (!D.getElementById('cx-css')) { var s = el('style'); s.id = 'cx-css'; s.textContent = css; D.head.appendChild(s); }
      root.innerHTML = '<div class="empty">Loading catalog…</div>';
      load().then(render).catch(function (e) { root.innerHTML = '<div class="err">Could not load the catalog (' + esc(e.message) + '). Run setup-catalog.sql in Supabase first.</div>'; });
    }
  };
})();
