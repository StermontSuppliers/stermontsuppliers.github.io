/* Stermont Arcade · Catalog, Restock & Ledger module. Mount: STMCatalog.mount(containerEl) */
(function () {
  var SB = 'https://oewvtbnmyombbtggamor.supabase.co', KEY = 'sb_publishable_CQiZr-INuot9C4fbdJDz1Q_4OiWEQL7', SK = 'stm_admin_session';
  var S = { cats: [], prods: [], st: {}, cat: 'all', q: '', range: 'all' }, root, D = document;
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
    '.modal .card{max-height:92vh;overflow:auto}.cx-pv{background:#f3eefc;border-radius:10px;padding:.5rem .7rem;margin:.6rem 0;font-size:.9rem}';

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
  function load() {
    return Promise.all([call('/rest/v1/categories?select=*&order=name'), call('/rest/v1/products?select=*&order=created_at.desc'), statsCall()])
      .then(function (r) { S.cats = r[0]; S.prods = r[1]; S.st = {}; r[2].forEach(function (x) { S.st[x.product_id] = x; }); });
  }
  function stat(p) { var s = S.st[p.id] || {}; var sales = +s.sales || 0, cogs = +s.cogs || 0; return { sold: +s.sold || 0, sales: sales, profit: sales - cogs, loss: +s.loss || 0 }; }
  function catName(id) { var c = S.cats.filter(function (x) { return x.id === id; })[0]; return c ? c.name : 'Uncategorised'; }

  /* ---------- generic modal ---------- */
  function modal(title, bodyHtml, okText, onOk, onMount) {
    var m = el('div', 'modal'), c = el('div', 'card');
    c.innerHTML = '<h2 style="margin-top:0">' + title + '</h2><div id="cx-mb">' + bodyHtml + '</div><div class="err" id="cx-me" hidden></div><div class="acts"><button class="btn alt" type="button" id="cx-mn">Cancel</button><button class="btn" type="button" id="cx-my">' + okText + '</button></div>';
    m.appendChild(c); D.body.appendChild(m);
    var close = function () { m.remove(); }, ok = c.querySelector('#cx-my'), er = c.querySelector('#cx-me');
    c.querySelector('#cx-mn').onclick = close;
    ok.onclick = function () {
      er.hidden = true; ok.disabled = true;
      Promise.resolve().then(onOk).then(function () { close(); return load(); }).then(render)
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
        var k = Math.min(1, 900 / Math.max(img.width, img.height)), c = D.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        c.toBlob(function (b) { b ? res(b) : rej(new Error('Image failed')); }, 'image/jpeg', 0.82);
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
  function itemForm(p) {
    var edit = !!p, imgs = edit ? (p.images || []).slice() : [];
    var opts = S.cats.map(function (c) { return '<option value="' + c.id + '"' + (edit && p.category_id === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>'; }).join('');
    var body = '<label>Category</label><select class="cx-f" id="cx-cat">' + opts + '<option value="__new">＋ Create new category…</option></select>' +
      '<input class="cx-f" id="cx-newcat" placeholder="New category name" hidden style="margin-top:.4rem">' +
      '<label>Item name</label><input class="cx-f" id="cx-name" maxlength="120" value="' + esc(edit ? p.name : '') + '">' +
      '<div class="cx-r"><div><label>Price (KSh)</label><input class="cx-f" id="cx-price" type="number" min="0" inputmode="decimal" value="' + (edit ? p.price : '') + '"></div>' +
      '<div><label>Cost / COGS (KSh)</label><input class="cx-f" id="cx-cost" type="number" min="0" inputmode="decimal" value="' + (edit ? p.cost : '') + '"></div>' +
      '<div><label>' + (edit ? 'Pieces in stock' : 'Initial pieces') + '</label><input class="cx-f" id="cx-stock" type="number" min="0" inputmode="numeric" value="' + (edit ? p.stock : '') + '"' + (edit ? ' disabled' : '') + '></div>' +
      '<div><label>Low-stock alert below</label><input class="cx-f" id="cx-low" type="number" min="0" value="' + (edit ? p.low_at : 5) + '"></div></div>' +
      '<label style="display:flex;gap:.5rem;align-items:center"><input type="checkbox" id="cx-feat"' + (edit && p.featured ? ' checked' : '') + '> Feature as advert / top banner</label>' +
      '<label>Photos</label><input type="file" id="cx-file" accept="image/*" multiple><div class="cx-th" id="cx-th"></div><div class="meta" id="cx-up"></div>';
    modal(edit ? 'Edit item' : 'Add new item', body, edit ? 'Save changes' : 'Publish to website', function () {
      if ($('cx-up').textContent) throw new Error('Wait for photos to finish uploading');
      var name = v('cx-name').trim(), price = num('cx-price'), cost = num('cx-cost'), stock = edit ? p.stock : parseInt(v('cx-stock') || 0, 10);
      if (!name) throw new Error('Enter an item name'); if (!(price >= 0) || v('cx-price') === '') throw new Error('Enter a selling price');
      if (!(cost >= 0) || v('cx-cost') === '') throw new Error('Enter the cost price'); if (!(stock >= 0)) throw new Error('Enter pieces in stock');
      var catP = v('cx-cat') === '__new' ? (function () {
        var cn = v('cx-newcat').trim(); if (!cn) throw new Error('Enter the new category name');
        return call('/rest/v1/categories?on_conflict=slug', { m: 'POST', h: { Prefer: 'resolution=merge-duplicates,return=representation' }, body: { name: cn, slug: slug(cn) } }).then(function (r) { return r[0].id; });
      })() : Promise.resolve(parseInt(v('cx-cat'), 10));
      return catP.then(function (cid) {
        var row = { category_id: cid, name: name, price: price, cost: cost, low_at: parseInt(v('cx-low') || 5, 10), featured: $('cx-feat').checked, images: imgs };
        if (edit) return call('/rest/v1/products?id=eq.' + encodeURIComponent(p.id), { m: 'PATCH', h: { Prefer: 'return=minimal' }, body: row });
        var id = slug(name) || 'item', n = 2, base = id; while (S.prods.some(function (x) { return x.id === id; })) id = base + '-' + n++;
        row.id = id; row.stock = stock; return call('/rest/v1/products', { m: 'POST', h: { Prefer: 'return=minimal' }, body: row });
      });
    }, function (c) {
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
    return list.reduce(function (a, p) { var s = stat(p); a.stock += p.stock; a.sold += s.sold; a.sales += s.sales; a.profit += s.profit; a.loss += s.loss; a.value += p.stock * p.cost; return a; }, { stock: 0, sold: 0, sales: 0, profit: 0, loss: 0, value: 0 });
  }
  function neg(n) { return n < 0 ? ' class="neg"' : ''; }
  function render() {
    var all = S.prods, T = totals(all), low = all.filter(function (p) { return p.active && p.stock < p.low_at; });
    var q = S.q.trim().toLowerCase();
    var shown = all.filter(function (p) { return (S.cat === 'all' || String(p.category_id) === S.cat) && (!q || p.name.toLowerCase().indexOf(q) > -1); });
    root.innerHTML = '<div class="err" id="cx-err" hidden></div><div class="tabs" id="cx-rg"></div>' +
      '<div class="cx-k"><div class="hi"><small>TOTAL SALES' + (S.range === 'all' ? '' : ' · ' + RANGES.filter(function (r) { return r[0] === S.range; })[0][1].toUpperCase()) + '</small><b>' + money(T.sales) + '</b></div><div class="lime"><small>PROFIT</small><b>' + money(T.profit) + '</b></div>' +
      '<div><small>LOSS / WRITE-OFFS</small><b style="color:var(--no)">' + money(T.loss) + '</b></div><div><small>NET PROFIT</small><b>' + money(T.profit - T.loss) + '</b></div>' +
      '<div><small>PIECES LEFT · SOLD</small><b>' + T.stock + ' · ' + T.sold + '</b></div><div><small>STOCK VALUE (AT COST)</small><b>' + money(T.value) + '</b></div></div>' +
      (low.length ? '<div class="err" style="background:#fef3c7;color:#92400e">⚠ ' + low.length + ' item' + (low.length > 1 ? 's' : '') + ' low on stock: ' + low.slice(0, 4).map(function (p) { return esc(p.name) + ' (' + p.stock + ')'; }).join(', ') + (low.length > 4 ? '…' : '') + '</div>' : '') +
      '<p style="margin:0 0 .7rem"><button class="btn" id="cx-add" type="button" style="width:100%">＋ Add new item</button></p>' +
      '<div class="tabs" id="cx-chips"></div><input id="cx-q" type="search" placeholder="Search items" value="' + esc(S.q) + '" style="width:100%;padding:.7rem .8rem;border:1px solid var(--ln);border-radius:10px;font:inherit;margin-bottom:.8rem">' +
      '<div id="cx-list"></div><h2 style="font-size:1.05rem;margin:1.2rem 0 .5rem">Financial ledger' + (S.range === 'all' ? '' : ' · ' + RANGES.filter(function (r) { return r[0] === S.range; })[0][1]) + '</h2><div class="cx-w" id="cx-led"></div>';
    $('cx-add').onclick = function () { itemForm(); };
    RANGES.forEach(function (r) { var b = el('button', S.range === r[0] ? 'on' : '', r[1]); b.type = 'button'; b.onclick = function () { S.range = r[0]; load().then(render).catch(function (x) { toast(x.message + ' (run setup-catalog-2.sql?)'); }); }; $('cx-rg').appendChild(b); });
    var chips = $('cx-chips'); [{ id: 'all', name: 'All (' + all.length + ')' }].concat(S.cats.map(function (c) { return { id: String(c.id), name: c.name }; })).forEach(function (c) {
      var b = el('button', S.cat === c.id ? 'on' : '', esc(c.name)); b.type = 'button'; b.onclick = function () { S.cat = c.id; render(); }; chips.appendChild(b); });
    $('cx-q').oninput = function (e) { S.q = e.target.value; var pos = e.target.selectionStart; render(); var n = $('cx-q'); n.focus(); n.setSelectionRange(pos, pos); };
    var L = $('cx-list'); if (!shown.length) L.appendChild(el('div', 'empty', all.length ? 'No items match.' : 'No items yet. Tap “Add new item” to publish your first product.'));
    shown.forEach(function (p) {
      var s = stat(p), lowS = p.stock < p.low_at, c = el('div', 'card'), margin = p.price ? Math.round((p.price - p.cost) / p.price * 100) : 0;
      c.innerHTML = '<div class="cx-p">' + (p.images && p.images[0] ? '<img src="' + esc(p.images[0]) + '" alt="">' : '<div class="cx-ph">📦</div>') +
        '<div style="min-width:0"><div class="ref">' + esc(p.name) + '</div><div class="when">' + esc(catName(p.category_id)) + '</div><div style="margin-top:.3rem">' +
        (p.stock === 0 ? '<span class="badge b-declined">Out of stock</span> ' : lowS ? '<span class="badge b-low">Low · ' + p.stock + ' left</span> ' : '<span class="badge b-paid">In stock</span> ') +
        (p.featured ? '<span class="badge b-ad">Advert</span> ' : '') + (p.active ? '' : '<span class="badge b-pending">Hidden</span>') + '</div></div></div>' +
        '<div class="cx-g"><div><span>Price</span><b>' + money(p.price) + '</b></div><div><span>Cost</span><b>' + money(p.cost) + '</b></div>' +
        '<div><span>Left / Sold</span><b>' + p.stock + ' / ' + s.sold + '</b></div><div><span>Margin</span><b>' + margin + '%</b></div>' +
        '<div><span>Sales</span><b>' + money(s.sales) + '</b></div><div><span>Profit</span><b>' + money(s.profit) + '</b></div></div>' +
        '<div class="acts"><button class="btn ok sm" data-a="r" type="button">＋ Restock</button><button class="btn alt sm" data-a="l" type="button">Log loss</button><button class="btn alt sm" data-a="y" type="button">History</button><button class="btn alt sm" data-a="e" type="button">Edit</button><button class="btn alt sm" data-a="h" type="button">' + (p.active ? 'Hide' : 'Show') + '</button></div>';
      c.onclick = function (e) { var a = e.target.getAttribute && e.target.getAttribute('data-a'); if (!a) return;
        if (a === 'r') restockForm(p); else if (a === 'l') lossForm(p); else if (a === 'e') itemForm(p); else if (a === 'y') history(p);
        else { e.target.disabled = true; call('/rest/v1/products?id=eq.' + encodeURIComponent(p.id), { m: 'PATCH', h: { Prefer: 'return=minimal' }, body: { active: !p.active } }).then(load).then(render).catch(function (x) { toast(x.message); }); } };
      L.appendChild(c);
    });
    ledger(all);
  }
  function ledger(all) {
    var rows = '<table class="cx-t"><tr><th>Item</th><th>Left</th><th>Sold</th><th>Sales</th><th>Profit</th><th>Loss</th></tr>';
    function line(cls, name, t) { return '<tr class="' + cls + '"><td>' + name + '</td><td>' + t.stock + '</td><td>' + t.sold + '</td><td>' + money(t.sales) + '</td><td' + neg(t.profit) + '>' + money(t.profit) + '</td><td>' + money(t.loss) + '</td></tr>'; }
    S.cats.concat([{ id: null, name: 'Uncategorised' }]).forEach(function (c) {
      var ps = all.filter(function (p) { return p.category_id === c.id; }); if (!ps.length) return;
      rows += line('sub', esc(c.name), totals(ps)); ps.forEach(function (p) { rows += line('', esc(p.name), totals([p])); });
    });
    $('cx-led').innerHTML = rows + line('tot', 'ALL ITEMS', totals(all)) + '</table>';
  }

  window.STMCatalog = {
    mount: function (c) {
      root = c; if (!D.getElementById('cx-css')) { var s = el('style'); s.id = 'cx-css'; s.textContent = css; D.head.appendChild(s); }
      root.innerHTML = '<div class="empty">Loading catalog…</div>';
      load().then(render).catch(function (e) { root.innerHTML = '<div class="err">Could not load the catalog (' + esc(e.message) + '). Run setup-catalog.sql in Supabase first.</div>'; });
    }
  };
})();
