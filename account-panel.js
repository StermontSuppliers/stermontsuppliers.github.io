/* Stermont Arcade · Jumia-style "My account" panel.
   Add at the end of index.html, AFTER storefront-live.js:  <script src="account-panel.js" defer></script>
   Replaces the old account panel (same #ac container) with: Orders (Ongoing/Delivered + Canceled/Returned),
   Inbox, Ratings & Reviews, Vouchers, Wishlist, Recently viewed, Address book. */
(function () {
  var D = document, NS = 'http://www.w3.org/2000/svg', REF = 'oewvtbnmyombbtggamor', SBU = 'https://' + REF + '.supabase.co',
      KEY = 'sb_publishable_CQiZr-INuot9C4fbdJDz1Q_4OiWEQL7', SK = 'sb-' + REF + '-auth-token', WA = '254748888230';
  var AC, AB, view = 'main', tab = 'ongoing', orders = null, loading = false, loadErr = '';

  function el(t, c, x) { var e = D.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function get(k) { try { return JSON.parse(localStorage.getItem(k)) || null; } catch (e) { return null; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function sess() { var x = get(SK); return x && x.user && x.access_token && (!x.expires_at || x.expires_at * 1000 > Date.now()) ? x : null; }
  function money(n) { return 'KSh ' + Math.round(Number(n) || 0).toLocaleString('en-KE'); }
  function dmy(d) { d = new Date(d); if (isNaN(d)) return ''; var p = function (n) { return (n < 10 ? '0' : '') + n; }; return p(d.getDate()) + '-' + p(d.getMonth() + 1) + '-' + d.getFullYear(); }
  function ico(d) { var s = D.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 24 24'); var p = D.createElementNS(NS, 'path'); p.setAttribute('d', d); s.appendChild(p); return s; }
  function card(id) { return D.getElementById(id); }

  /* ---------- styles for the new pieces ---------- */
  var st = el('style'); st.textContent =
    '.ac-tabs{display:flex;border-bottom:1px solid var(--line);position:sticky;top:0;background:var(--paper);z-index:2}' +
    '.ac-tabs button{flex:1;border:0;background:none;color:var(--muted);font:inherit;font-weight:800;font-size:.85rem;padding:.95rem .3rem;border-bottom:3px solid transparent;cursor:pointer;text-transform:uppercase}' +
    '.ac-tabs button.on{color:var(--orange);border-color:var(--orange)}' +
    '.ac-oc{display:flex;gap:.8rem;padding:.9rem 1rem;border-bottom:8px solid var(--panel);cursor:pointer}' +
    '.ac-oc img,.ac-oc .ph{width:84px;height:84px;object-fit:contain;background:#fff;border-radius:8px;flex:none;display:grid;place-items:center;font-size:2rem}' +
    '.ac-oc b{display:block;font-size:.95rem;line-height:1.3;margin-bottom:.15rem}.ac-oc small{display:block;color:var(--muted)}' +
    '.ac-bd{display:inline-block;margin:.35rem 0;padding:.2rem .6rem;border-radius:5px;font-weight:800;font-size:.8rem;color:#fff;background:#6b6b6b}' +
    '.ac-bd.ok{background:#5db01b}.ac-bd.go{background:#f68b1e}.ac-bd.no{background:#6b6b6b}.ac-bd.wait{background:#c8a000}' +
    '.ac-on{font-weight:800;font-size:.95rem}' +
    '.ac-msg{padding:.9rem 1rem;border-bottom:1px solid var(--line)}.ac-msg b{display:block}.ac-msg small{color:var(--muted)}' +
    '.ac-st{display:inline-flex;gap:.15rem;margin-top:.3rem}.ac-st button{border:0;background:none;font-size:1.7rem;line-height:1;color:#c9c4d8;cursor:pointer;padding:0 .1rem}.ac-st button.on{color:#f6a800}' +
    '.ac-hd{padding:.8rem 1rem;font-weight:800;border-bottom:1px solid var(--line)}';
  D.head.appendChild(st);

  /* ---------- data ---------- */
  function loadOrders(done) {
    var S = sess(); if (!S) { orders = []; return done(); }
    loading = true; loadErr = '';
    fetch(SBU + '/rest/v1/orders?select=ref,items,subtotal,status,created_at,handled_at,method,pay_code&user_id=eq.' + encodeURIComponent(S.user.id) + '&order=created_at.desc&limit=100',
      { headers: { apikey: KEY, Authorization: 'Bearer ' + S.access_token } })
      .then(function (r) { if (!r.ok) throw new Error('status ' + r.status); return r.json(); })
      .then(function (rows) { orders = rows || []; })
      .catch(function () { orders = []; loadErr = 'Could not load your orders. Check your connection and try again.'; })
      .then(function () { loading = false; done(); });
  }
  function kind(o) {
    var s = String(o.status || '').toLowerCase();
    if (s === 'declined' || s === 'cancelled' || s === 'canceled' || s === 'returned') return 'no';
    if (s === 'delivered' || s === 'completed' || s === 'collected') return 'ok';
    if (s === 'out_for_delivery' || s === 'shipped') return 'go';
    return 'wait';
  }
  function label(o) {
    var s = String(o.status || 'pending').toLowerCase(), m = { pending: 'Pending verification', paid: 'Payment confirmed', confirmed: 'Confirmed', packed: 'Packed', out_for_delivery: 'On the way', delivered: 'Delivered', declined: 'Declined', cancelled: 'Canceled', canceled: 'Canceled', returned: 'Returned' };
    return (m[s] || s.replace(/_/g, ' ')).toUpperCase();
  }
  function imgFor(name) {
    var cs = D.querySelectorAll('.pcard[id^="p-"]');
    for (var i = 0; i < cs.length; i++) { var h = cs[i].querySelector('h3'); if (h && h.textContent.trim() === String(name).trim()) { var im = cs[i].querySelector('img'); if (im) return im.src; } }
    return '';
  }

  /* ---------- UI helpers ---------- */
  function open() { view = 'main'; render(); AC.classList.add('on'); D.body.style.overflow = 'hidden'; }
  function shut() { AC.classList.remove('on'); D.body.style.overflow = ''; }
  function row(label, path, fn, count, href) {
    var r = href ? el('a', 'ac-row') : el('button', 'ac-row'); if (href) r.href = href; else r.type = 'button';
    r.appendChild(ico(path)); r.appendChild(el('span', 'l', label)); if (count != null) r.appendChild(el('span', 'c', count));
    if (fn) r.addEventListener('click', fn); AB.appendChild(r); return r;
  }
  function go(v) { view = v; if (v === 'orders' || v === 'inbox' || v === 'reviews') { if (orders === null) { render(); return loadOrders(render); } } render(); }
  function sub(title, node) {
    var bk = el('button', 'ac-row', '\u2190 Back'); bk.type = 'button'; bk.style.fontWeight = '700'; bk.style.setProperty('--x', 0);
    bk.addEventListener('click', function () { view = 'main'; render(); });
    AB.appendChild(bk); AB.appendChild(el('div', 'ac-sec', title)); AB.appendChild(node);
  }
  function needLogin() {
    var w = D.createDocumentFragment(); w.appendChild(el('p', 'ac-empty', 'Log in to see this.'));
    var a = el('a', 'ac-login', 'Log in or create account'); a.href = 'account.html'; w.appendChild(a); return w;
  }
  function itemsOf(o) { return Array.isArray(o.items) ? o.items : []; }

  /* ---------- views ---------- */
  function vOrders() {
    var f = D.createDocumentFragment();
    if (!sess()) return needLogin();
    var tabs = el('div', 'ac-tabs');
    [['ongoing', 'Ongoing/Delivered'], ['cancelled', 'Canceled/Returned']].forEach(function (t) {
      var b = el('button', tab === t[0] ? 'on' : '', t[1]); b.type = 'button'; b.addEventListener('click', function () { tab = t[0]; render(); }); tabs.appendChild(b);
    });
    f.appendChild(tabs);
    if (loading || orders === null) { f.appendChild(el('p', 'ac-empty', 'Loading your orders\u2026')); return f; }
    if (loadErr) { f.appendChild(el('p', 'ac-empty', loadErr)); return f; }
    var list = orders.filter(function (o) { return (kind(o) === 'no') === (tab === 'cancelled'); });
    if (!list.length) { f.appendChild(el('p', 'ac-empty', tab === 'cancelled' ? 'No canceled or returned orders.' : 'You have no orders yet.')); return f; }
    list.forEach(function (o) {
      var its = itemsOf(o), first = its[0] || {}, c = el('div', 'ac-oc'), src = imgFor(first.name), m = el('div');
      if (src) { var im = el('img'); im.src = src; im.alt = ''; c.appendChild(im); } else c.appendChild(el('div', 'ph', '\uD83D\uDCE6'));
      m.appendChild(el('b', null, (first.name || 'Order') + (its.length > 1 ? ' + ' + (its.length - 1) + ' more' : '')));
      m.appendChild(el('small', null, 'Order #' + o.ref));
      m.appendChild(el('span', 'ac-bd ' + kind(o), label(o)));
      m.appendChild(el('div', 'ac-on', 'On ' + dmy(o.handled_at || o.created_at)));
      c.appendChild(m); c.addEventListener('click', function () { view = 'order:' + o.ref; render(); }); f.appendChild(c);
    });
    return f;
  }
  function vOrder(ref) {
    var o = (orders || []).filter(function (x) { return x.ref === ref; })[0], f = D.createDocumentFragment();
    if (!o) { f.appendChild(el('p', 'ac-empty', 'Order not found.')); return f; }
    var h = el('div', 'ac-kv'); h.appendChild(el('small', null, 'Order #' + o.ref)); h.appendChild(el('span', 'ac-bd ' + kind(o), label(o))); h.appendChild(el('small', null, 'Placed ' + dmy(o.created_at))); f.appendChild(h);
    itemsOf(o).forEach(function (i) {
      var d = el('div', 'ac-it'), src = imgFor(i.name), m = el('div', 'm');
      if (src) { var im = el('img'); im.src = src; im.alt = ''; d.appendChild(im); }
      m.appendChild(el('b', null, i.name)); m.appendChild(el('small', null, (i.qty || 1) + ' \u00d7 ' + money(i.price) + ' = ' + money(i.total))); d.appendChild(m); f.appendChild(d);
    });
    var t = el('div', 'ac-kv'); t.appendChild(el('small', null, 'Items total')); t.appendChild(el('b', null, money(o.subtotal))); f.appendChild(t);
    var a = el('a', 'ac-login', 'Ask about this order on WhatsApp'); a.target = '_blank'; a.rel = 'noopener';
    a.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent('Hello Stermont Arcade, about my order ' + o.ref); f.appendChild(a);
    return f;
  }
  var INBOX = { pending: 'We received your M-Pesa code and are verifying your payment.', paid: 'Your payment is confirmed. We are preparing your order.', confirmed: 'Your order is confirmed.', packed: 'Your order has been packed.', out_for_delivery: 'Your order is on the way. Keep your phone on.', delivered: 'Your order was delivered. Enjoy!', declined: 'We could not verify the payment, so the order was declined. Message us on WhatsApp.', cancelled: 'Your order was canceled.', canceled: 'Your order was canceled.', returned: 'Your order was returned.' };
  function vInbox() {
    var f = D.createDocumentFragment(); if (!sess()) return needLogin();
    if (orders === null || loading) { f.appendChild(el('p', 'ac-empty', 'Loading\u2026')); return f; }
    if (!orders.length) { f.appendChild(el('p', 'ac-empty', 'No messages yet. Updates about your orders will show here.')); return f; }
    orders.forEach(function (o) {
      var d = el('div', 'ac-msg'), s = String(o.status || 'pending').toLowerCase();
      d.appendChild(el('b', null, label(o) + ' \u00b7 Order #' + o.ref)); d.appendChild(el('span', null, INBOX[s] || 'Order update.')); d.appendChild(el('small', null, dmy(o.handled_at || o.created_at)));
      d.style.cursor = 'pointer'; d.addEventListener('click', function () { view = 'order:' + o.ref; render(); }); f.appendChild(d);
    });
    return f;
  }
  function vReviews() {
    var f = D.createDocumentFragment(); if (!sess()) return needLogin();
    if (orders === null || loading) { f.appendChild(el('p', 'ac-empty', 'Loading\u2026')); return f; }
    var rv = get('stm_ratings') || {}, any = false;
    orders.filter(function (o) { return kind(o) === 'ok'; }).forEach(function (o) {
      itemsOf(o).forEach(function (i) {
        any = true; var d = el('div', 'ac-msg'), key = o.ref + '|' + i.name, cur = rv[key] || 0, sw = el('div', 'ac-st');
        d.appendChild(el('b', null, i.name)); d.appendChild(el('small', null, 'Order #' + o.ref));
        for (var s = 1; s <= 5; s++) (function (n) { var b = el('button', n <= cur ? 'on' : '', '\u2605'); b.type = 'button'; b.setAttribute('aria-label', n + ' stars'); b.addEventListener('click', function () { rv[key] = n; put('stm_ratings', rv); render(); }); sw.appendChild(b); })(s);
        d.appendChild(sw); f.appendChild(d);
      });
    });
    if (!any) f.appendChild(el('p', 'ac-empty', 'Delivered items you can rate will show here.'));
    else f.appendChild(el('p', 'ac-empty', 'Ratings are saved on this device.'));
    return f;
  }
  function vVouchers() { var f = D.createDocumentFragment(); f.appendChild(el('p', 'ac-empty', 'You have no vouchers yet. Offers and discount codes will show here.')); return f; }
  function vItems(key) {
    var f = D.createDocumentFragment(), list = (get(key) || []).filter(card);
    if (!list.length) { f.appendChild(el('p', 'ac-empty', key === 'stm_wish' ? 'Nothing saved yet. Tap the \u2661 on any product.' : 'Products you open will show here.')); return f; }
    list.forEach(function (id) {
      var c = card(id), d = el('div', 'ac-it'), im = el('img'), m = el('div', 'm'); im.src = (c.querySelector('img') || {}).src || ''; im.alt = '';
      m.appendChild(el('b', null, c.querySelector('h3').textContent)); m.appendChild(el('small', null, c.querySelector('.price').textContent)); d.appendChild(im); d.appendChild(m);
      if (key === 'stm_wish') { var x = el('button', null, '\u00d7'); x.setAttribute('aria-label', 'Remove'); x.addEventListener('click', function (e) { e.stopPropagation(); put('stm_wish', (get('stm_wish') || []).filter(function (i) { return i !== id; })); render(); }); d.appendChild(x); }
      d.addEventListener('click', function () { shut(); if (window.STM_openView) window.STM_openView(c); else c.click(); });
      f.appendChild(d);
    });
    return f;
  }
  function vAddr() {
    var f = D.createDocumentFragment(), c = get('stm_cust') || {};
    [['Name', c.name], ['Phone', c.phone], ['Email', c.email], ['County', c.county], ['Address', c.addr]].forEach(function (k) { if (k[1]) { var d = el('div', 'ac-kv'); d.appendChild(el('small', null, k[0])); d.appendChild(el('b', null, k[1])); f.appendChild(d); } });
    if (!f.childNodes.length) f.appendChild(el('p', 'ac-empty', 'No saved address yet. It is saved when you place your first order.'));
    else { var cl = el('button', 'ac-out', 'Clear saved details'); cl.type = 'button'; cl.addEventListener('click', function () { try { localStorage.removeItem('stm_cust'); } catch (e) {} render(); }); f.appendChild(cl); }
    return f;
  }

  function render() {
    AB.textContent = ''; var S = sess();
    if (view.indexOf('order:') === 0) return sub('Order details', vOrder(view.slice(6)));
    var map = { orders: ['Orders', vOrders], inbox: ['Inbox', vInbox], reviews: ['Ratings & Reviews', vReviews], vouchers: ['Vouchers', vVouchers], wish: ['My wishlist', function () { return vItems('stm_wish'); }], recent: ['Recently viewed', function () { return vItems('stm_recent'); }], addr: ['Address book', vAddr] };
    if (map[view]) return sub(map[view][0], map[view][1]());

    var md = S ? (S.user.user_metadata || {}) : {}, hi = el('div', 'ac-hi');
    if (S) { hi.appendChild(el('h3', null, 'Welcome ' + ((md.full_name || '').split(' ')[0] || 'back') + '!')); hi.appendChild(el('p', null, S.user.email || '')); }
    else { hi.appendChild(el('h3', null, 'Welcome to Stermont Arcade')); hi.appendChild(el('p', null, 'Log in to see your orders.')); }
    AB.appendChild(hi);
    if (!S) { var lg = el('a', 'ac-login', 'Log in or create account'); lg.href = 'account.html'; AB.appendChild(lg); }
    var bt = el('div', 'ac-btns'), a1 = el('a', 'ac-call', 'Call us'), a2 = el('a', 'ac-wa', 'WhatsApp');
    a1.href = 'tel:+254748888230'; a2.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent('Hello Stermont Arcade'); a2.target = '_blank'; a2.rel = 'noopener';
    bt.appendChild(a1); bt.appendChild(a2); AB.appendChild(bt);

    AB.appendChild(el('div', 'ac-sec', 'Need assistance?'));
    row('Help & Support', 'M12 17v-5M12 8h.01M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', function () { shut(); if (window.Tawk_API && window.Tawk_API.maximize) window.Tawk_API.maximize(); else D.getElementById('contact').scrollIntoView({ behavior: 'smooth' }); });

    AB.appendChild(el('div', 'ac-sec', 'My Stermont Account'));
    var wc = (get('stm_wish') || []).filter(card).length, rc = (get('stm_recent') || []).filter(card).length;
    row('Orders', 'M4 8l2-4h12l2 4v12H4zM4 8h16M9 12h6', function () { go('orders'); });
    row('Inbox', 'M3 6h18v12H3zM3 7l9 7 9-7', function () { go('inbox'); });
    row('Ratings & Reviews', 'M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.2 6.5 20.2l1-6.2L3 9.6l6.2-.9z', function () { go('reviews'); });
    row('Vouchers', 'M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4zM9 6v12', function () { go('vouchers'); });
    row('Wishlist', 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z', function () { go('wish'); }, wc || null);
    row('Recently viewed', 'M3 12a9 9 0 1 0 3-6.7M3 4v5h5M12 8v4l3 2', function () { go('recent'); }, rc || null);

    AB.appendChild(el('div', 'ac-sec', 'My settings'));
    row('Address book', 'M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z', function () { go('addr'); });
    row('Account management', 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 21c0-4 3.6-6 8-6s8 2 8 6', null, null, 'account.html');
    row('Privacy policy', 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z', null, null, 'privacy.html');
    if (S) { var lo = el('button', 'ac-out', 'Logout'); lo.type = 'button'; lo.addEventListener('click', function () { try { localStorage.removeItem(SK); } catch (e) {} shut(); location.reload(); }); AB.appendChild(lo); }
  }

  function init() {
    AC = D.getElementById('ac'); AB = D.getElementById('ac-b'); if (!AC || !AB) return;
    var h2 = AC.querySelector('.ac-h h2'); if (h2) h2.textContent = 'My Stermont Account';
    /* capture on document so this runs before the old panel's handlers */
    D.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('#acctbtn,#bar-acct,nav.desk a[href="account.html"]');
      if (!a) return; e.preventDefault(); e.stopImmediatePropagation(); orders = null; open();
    }, true);
    /* keep the order list fresh whenever the panel opens */
    var mo = new MutationObserver(function () { if (!AC.classList.contains('on')) { orders = null; } }); mo.observe(AC, { attributes: true, attributeFilter: ['class'] });
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', init); else init();
})();
