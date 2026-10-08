/* Stermont Arcade · publishes products added in the admin onto the storefront (cards + Jumia-style product view).
   Loaded at the end of index.html:  <script src="storefront-live.js" defer></script> */
(function () {
  var SB = 'https://oewvtbnmyombbtggamor.supabase.co', KEY = 'sb_publishable_CQiZr-INuot9C4fbdJDz1Q_4OiWEQL7', D = document, WA = '254748888230';
  function money(n) { return 'KSh ' + Math.round(n).toLocaleString('en-KE'); }
  function mk(t, c, x) { var e = D.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  /* discount helpers: a product has a deal when old_price (previous price) is higher than price (current price) */
  function disc(p) { var o = Number(p.old_price), n = Number(p.price); if (!(o > n) || !(n >= 0)) return null; return { was: o, now: n, pct: Math.max(1, Math.round((o - n) / o * 100)), save: o - n }; }
  function badge(d) { return mk('span', 'dbadge', '-' + d.pct + '%'); }
  function wasEl(d) { var w = mk('div', 'was'); w.appendChild(mk('s', '', money(d.was))); w.appendChild(mk('b', '', 'Save ' + money(d.save))); return w; }
  var PCSS = '.dbadge{background:#dc2626;color:#fff;font-weight:800;font-size:.72rem;border-radius:999px;padding:.18rem .55rem;line-height:1.2;box-shadow:0 2px 6px rgba(220,38,38,.35)}' +
    '.pcard .img .dbadge{position:absolute;top:.5rem;left:.5rem;z-index:2}.pcard .was{display:flex;align-items:center;gap:.4rem;flex-wrap:wrap;font-size:.82rem;color:var(--muted)}.pcard .was b{color:#15803d;font-weight:700}.pcard .price.sale{color:var(--orange)}' +
    '#stm-pd .pdw{display:flex;align-items:center;gap:.55rem;flex-wrap:wrap;margin:-.1rem 0 .6rem}#stm-pd .pdw s{color:#8b86a0;font-size:1.05rem}#stm-pd .pdw .sv{color:#15803d;font-weight:700;font-size:.9rem}#stm-pd .pdw[hidden]{display:none}' +
    '#deals{padding:1.4rem 0 .2rem}#deals .dh2{display:flex;align-items:center;justify-content:space-between;gap:.5rem;margin-bottom:.2rem}#deals h2{font-size:1.5rem;font-weight:800;letter-spacing:-.02em}#deals h2 span{background:linear-gradient(135deg,#ef4444,#f97316);-webkit-background-clip:text;background-clip:text;color:transparent}' +
    '.drow{display:flex;gap:.75rem;overflow-x:auto;scroll-snap-type:x mandatory;padding:.3rem .2rem 1rem;scrollbar-width:none}.drow::-webkit-scrollbar{display:none}' +
    '.dtile{flex:0 0 164px;scroll-snap-align:start;background:var(--card);border:1px solid var(--line);border-radius:16px;overflow:hidden;cursor:pointer;display:flex;flex-direction:column;transition:transform .2s,box-shadow .2s}.dtile:hover{transform:translateY(-3px);box-shadow:0 10px 24px rgba(91,33,182,.16)}' +
    '.dtile .im{aspect-ratio:1;background:#fff;position:relative}.dtile img{width:100%;height:100%;object-fit:contain;display:block}.dtile .dbadge{position:absolute;top:.45rem;left:.45rem}' +
    '.dtile .t{padding:.6rem .65rem .7rem;display:flex;flex-direction:column;gap:.15rem;flex:1}.dtile h3{font-size:.85rem;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}' +
    '.dtile .np{font-weight:800;font-size:1.05rem}.dtile .op{color:var(--muted);font-size:.8rem}.dtile button{margin-top:auto;border:0;border-radius:10px;background:var(--orange);color:#fff;font:inherit;font-weight:700;padding:.5rem;cursor:pointer}@media(min-width:760px){.dtile{flex-basis:200px}}' +
    '.tbar{display:flex;gap:.5rem;flex-wrap:wrap;align-items:center;margin:.2rem 0 1rem}.tbar select,.tbar .chip{font:inherit;color:var(--ink);background:var(--panel);border:1px solid var(--line);border-radius:999px;padding:.5rem 1rem;cursor:pointer}.tbar .chip{font-weight:600}.tbar .chip.on{background:var(--orange);border-color:var(--orange);color:#fff}.dealhide{display:none!important}' +
    '.rv{opacity:0;transform:translateY(16px);transition:opacity .5s ease,transform .5s ease}.rv.in{opacity:1;transform:none}@media(prefers-reduced-motion:reduce){.rv{opacity:1;transform:none;transition:none}}' +
    '#totop{position:fixed;right:14px;bottom:calc(150px + env(safe-area-inset-bottom,0px));z-index:35;width:44px;height:44px;border-radius:50%;border:0;background:#2a0e5c;color:#fff;font-size:1.2rem;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.3);opacity:0;pointer-events:none;transition:opacity .2s}#totop.on{opacity:1;pointer-events:auto}@media(min-width:760px){#totop{bottom:24px}}';
  (function () { var s = mk('style'); s.textContent = PCSS; D.head.appendChild(s); })();

  /* ---------- wishlist (saved on this device; shown in My account > Wishlist) ---------- */
  function wl() { try { return JSON.parse(localStorage.getItem('stm_wish')) || []; } catch (e) { return []; } }
  function inWish(id) { return wl().indexOf(id) > -1; }
  function toggleWish(id) {
    var w = wl(), i = w.indexOf(id); if (i > -1) w.splice(i, 1); else w.unshift(id);
    try { localStorage.setItem('stm_wish', JSON.stringify(w)); } catch (e) {}
    paintHearts(); return i === -1;
  }
  function paintHearts() {
    [].forEach.call(D.querySelectorAll('.wl-h'), function (b) { var on = inWish(b.getAttribute('data-id')); b.classList.toggle('on', on); b.textContent = on ? '♥' : '♡'; b.setAttribute('aria-label', on ? 'Remove from wishlist' : 'Save to wishlist'); });
  }
  function heart(id, cls) {
    var b = mk('button', 'wl-h' + (cls ? ' ' + cls : '')); b.type = 'button'; b.setAttribute('data-id', id);
    b.onclick = function (e) { e.stopPropagation(); e.preventDefault(); var on = toggleWish(id); var t = D.getElementById('toast'); if (t) { t.textContent = on ? 'Saved to wishlist' : 'Removed from wishlist'; t.classList.add('on'); clearTimeout(heart.t); heart.t = setTimeout(function () { t.classList.remove('on'); }, 1400); } };
    return b;
  }
  var HCSS = '.wl-h{border:0;background:rgba(255,255,255,.92);color:#5b21b6;width:36px;height:36px;border-radius:50%;font-size:1.3rem;line-height:1;cursor:pointer;display:grid;place-items:center;box-shadow:0 2px 8px rgba(0,0,0,.18);padding:0}.wl-h.on{color:#d92d20}' +
    '.pcard .img .wl-h{position:absolute;top:.4rem;right:.4rem;z-index:2}#stm-pd .bar .wl-h{margin-left:auto;flex:none;box-shadow:none;background:#f1ecfc}';
  (function () { var s = mk('style'); s.textContent = HCSS; D.head.appendChild(s); })();

  /* ---------- product card (compact; tap to open the full view) ---------- */
  function card(p) {
    var c = mk('div', 'pcard'), sold = p.stock <= 0; c.id = 'p-' + p.id; c._p = p; c.style.cursor = 'pointer';
    var img = mk('span', 'img'); img.style.position = 'relative';
    if (p.images && p.images[0]) { var i = new Image(); i.src = p.images[0]; i.alt = p.name; i.width = i.height = 288; i.loading = 'lazy'; img.appendChild(i); }
    var d = disc(p); if (d) img.appendChild(badge(d));
    img.appendChild(heart(c.id)); setTimeout(paintHearts, 0);
    c.dataset.price = p.price; c.dataset.disc = d ? d.pct : 0; c.dataset.i = (card.n = (card.n || 0) + 1);
    var b = mk('div', 'b'), h = mk('h3', '', p.name), pr = mk('p', 'price' + (d ? ' sale' : ''), money(p.price));
    var btn = mk('button', 'btn btn-main'); btn.type = 'button';
    if (sold) { btn.textContent = 'Sold out'; btn.disabled = true; btn.dataset.sold = '1'; btn.style.opacity = '.55'; }
    else { btn.textContent = 'Add to cart'; btn.onclick = function (e) { e.stopPropagation(); window.STM && STM.add(c, btn); }; }
    b.appendChild(h); b.appendChild(pr); if (d) b.appendChild(wasEl(d)); b.appendChild(btn); c.appendChild(img); c.appendChild(b);
    c.onclick = function (e) { if (e.target.closest && e.target.closest('button,a')) return; openView(c); };
    return c;
  }

  /* ---------- product view (opens over the page; Back / swipe-back / Esc minimises it) ---------- */
  var CSS = '#stm-pd{position:fixed;inset:0;z-index:2147483000;display:none;background:rgba(20,10,45,.55);overscroll-behavior:contain}#stm-pd.on{display:block}' +
    '#stm-pd .pd{position:absolute;inset:0;background:#fff;color:#1b1230;overflow-y:auto;-webkit-overflow-scrolling:touch;font-family:inherit}' +
    '#stm-pd .bar{position:sticky;top:0;z-index:3;display:flex;align-items:center;gap:.7rem;background:#fff;border-bottom:1px solid #ece8f6;padding:.65rem .9rem}' +
    '#stm-pd .back{border:0;background:#f1ecfc;color:#5b21b6;border-radius:999px;padding:.55rem 1rem;font:inherit;font-weight:700;cursor:pointer;flex:none}' +
    '#stm-pd .bar b{font-size:.98rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '#stm-pd .body{padding:1rem;max-width:980px;margin:0 auto}' +
    '#stm-pd .main{aspect-ratio:1;background:#fff;border:1px solid #ece8f6;border-radius:14px;display:flex;align-items:center;justify-content:center;overflow:hidden;touch-action:pan-y}' +
    '#stm-pd .main img{width:100%;height:100%;object-fit:contain}#stm-pd .ph{font-size:4rem}' +
    '#stm-pd .thumbs{display:flex;gap:.5rem;overflow-x:auto;margin-top:.6rem;padding-bottom:.2rem}' +
    '#stm-pd .thumbs img{width:62px;height:62px;object-fit:cover;border-radius:10px;border:2px solid transparent;cursor:pointer;flex:none;background:#fff}#stm-pd .thumbs img.on{border-color:#7c3aed}' +
    '#stm-pd h2{font-size:1.25rem;line-height:1.3;margin:.9rem 0 .35rem}#stm-pd .pr{font-size:1.7rem;font-weight:800;color:#5b21b6;margin:.1rem 0 .4rem}' +
    '#stm-pd .st{display:inline-block;font-size:.8rem;font-weight:700;border-radius:999px;padding:.25rem .7rem;background:#dcfce7;color:#166534}#stm-pd .st.low{background:#fef3c7;color:#92400e}#stm-pd .st.out{background:#fee2e2;color:#991b1b}' +
    '#stm-pd .wa{display:inline-block;margin:.7rem 0 0;color:#166534;font-weight:700;font-size:.92rem;text-decoration:none}' +
    '#stm-pd .dh{font-size:1.05rem;margin:1.1rem 0 .4rem;padding-top:.9rem;border-top:1px solid #ece8f6}' +
    '#stm-pd .desc{position:relative;overflow:hidden;font-size:.95rem;line-height:1.55}#stm-pd .desc.clip{max-height:230px}' +
    '#stm-pd .desc.clip::after{content:"";position:absolute;left:0;right:0;bottom:0;height:70px;background:linear-gradient(rgba(255,255,255,0),#fff)}' +
    '#stm-pd .desc h4{margin:.9rem 0 .25rem;font-size:.98rem;color:#5b21b6}#stm-pd .desc p{margin:.25rem 0}' +
    '#stm-pd .more{border:0;background:none;color:#5b21b6;font:inherit;font-weight:700;padding:.5rem 0;cursor:pointer}' +
    '#stm-pd .act{position:sticky;bottom:0;z-index:3;display:flex;gap:.6rem;align-items:center;background:#fff;border-top:1px solid #ece8f6;padding:.7rem .9rem calc(.7rem + env(safe-area-inset-bottom,0px))}' +
    '#stm-pd .q{display:flex;align-items:center;border:1px solid #d9d2ee;border-radius:12px;overflow:hidden;flex:none}#stm-pd .q button{border:0;background:#f6f3fd;width:38px;height:42px;font-size:1.2rem;cursor:pointer}#stm-pd .q span{min-width:34px;text-align:center;font-weight:700}' +
    '#stm-pd .add{flex:1;border:0;border-radius:12px;background:#7c3aed;color:#fff;font:inherit;font-weight:800;padding:.8rem;cursor:pointer}#stm-pd .add[disabled]{opacity:.55;cursor:default}' +
    '#stm-pd .cart{border:1px solid #d9d2ee;background:#fff;border-radius:12px;height:44px;padding:0 .9rem;font:inherit;font-weight:700;cursor:pointer;flex:none}' +
    '@media(min-width:760px){#stm-pd .pd{inset:auto;top:4vh;bottom:4vh;left:50%;transform:translateX(-50%);width:min(980px,94vw);border-radius:18px;box-shadow:0 20px 60px rgba(0,0,0,.35)}' +
    '#stm-pd .body{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:1.6rem;align-items:start}#stm-pd .body h2:first-child{margin-top:0}#stm-pd .full{grid-column:1/-1}}';
  var pd, cur = null, qty = 1, imgs = [], idx = 0;
  function build() {
    if (pd) return;
    var st = mk('style'); st.textContent = CSS; D.head.appendChild(st);
    pd = mk('div'); pd.id = 'stm-pd'; pd.setAttribute('role', 'dialog'); pd.setAttribute('aria-modal', 'true');
    pd.innerHTML = '<div class="pd"><div class="bar"><button type="button" class="back">← Back</button><b></b></div><div class="body"><div class="gal"><div class="main"></div><div class="thumbs"></div></div>' +
      '<div class="info"><h2></h2><div class="pr"></div><div class="pdw" hidden></div><span class="st"></span><div><a class="wa" target="_blank" rel="noopener">Ask about this item on WhatsApp</a></div></div>' +
      '<div class="full"><h3 class="dh">Product details</h3><div class="desc"></div><button type="button" class="more" hidden>Show more ▾</button></div></div>' +
      '<div class="act"><div class="q"><button type="button" class="mn" aria-label="Less">−</button><span>1</span><button type="button" class="pl" aria-label="More">+</button></div><button type="button" class="add">Add to cart</button><button type="button" class="cart">🛒 Cart</button></div></div>';
    D.body.appendChild(pd);
    var q = function (s) { return pd.querySelector(s); };
    q('.bar').appendChild(heart('', 'pd-h'));
    q('.back').onclick = closeView;
    pd.addEventListener('click', function (e) { if (e.target === pd) closeView(); });
    q('.mn').onclick = function () { setQty(qty - 1); };
    q('.pl').onclick = function () { setQty(qty + 1); };
    q('.cart').onclick = function () { hide(); window.STM && STM.open(); };
    q('.add').onclick = function () {
      if (!cur || !window.STM) return; STM.add(cur, null, qty); var b = q('.add'); b.textContent = '✓ Added to cart'; setTimeout(function () { if (cur && cur._p.stock > 0) b.textContent = 'Add to cart'; }, 1600);
    };
    q('.more').onclick = function () { var d = q('.desc'), c = d.classList.toggle('clip'); this.textContent = c ? 'Show more ▾' : 'Show less ▴'; };
    var sx = 0, main = q('.main');
    main.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    main.addEventListener('touchend', function (e) { var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40 && imgs.length > 1) show(idx + (dx < 0 ? 1 : -1)); }, { passive: true });
    D.addEventListener('keydown', function (e) { if (e.key === 'Escape' && pd.classList.contains('on')) closeView(); });
    window.addEventListener('popstate', function () { if (pd.classList.contains('on')) hide(); });
  }
  function setQty(n) { var max = Math.max(1, Math.min(99, cur ? cur._p.stock : 1)); qty = Math.max(1, Math.min(max, n)); pd.querySelector('.q span').textContent = qty; }
  function show(n) {
    idx = (n + imgs.length) % imgs.length; var m = pd.querySelector('.main'); m.textContent = '';
    if (imgs.length) { var i = new Image(); i.src = imgs[idx]; i.alt = cur ? cur._p.name : ''; m.appendChild(i); } else { m.appendChild(mk('div', 'ph', '📦')); }
    [].forEach.call(pd.querySelectorAll('.thumbs img'), function (t, k) { t.classList.toggle('on', k === idx); });
  }
  function fmtDesc(text) {
    var box = mk('div');
    String(text || '').split(/\r?\n/).forEach(function (line) {
      line = line.trim(); if (!line) return;
      var kv = line.match(/^([^:]{2,40}):\s*(.+)$/), el;
      if (kv) { el = mk('p'); el.appendChild(mk('b', '', kv[1] + ': ')); el.appendChild(D.createTextNode(kv[2])); }
      else if (line.length <= 34 && !/[.,;:]$/.test(line) && !/^\d+\s*x\s/i.test(line)) { el = mk('h4', '', line); }
      else { el = mk('p', '', line); }
      box.appendChild(el);
    });
    return box;
  }
  function openView(c, noPush) {
    var p = c._p; if (!p) return; build(); cur = c; var q = function (s) { return pd.querySelector(s); };
    q('.pd-h').setAttribute('data-id', c.id); paintHearts(); if (window.STM_track) window.STM_track(c.id);
    imgs = (p.images || []).filter(Boolean); q('.bar b').textContent = p.name; q('h2').textContent = p.name; q('.pr').textContent = money(p.price);
    var dd = disc(p), pw = q('.pdw'); pw.textContent = ''; pw.hidden = !dd;
    if (dd) { pw.appendChild(mk('s', '', money(dd.was))); pw.appendChild(badge(dd)); pw.appendChild(mk('span', 'sv', 'You save ' + money(dd.save))); }
    var s = q('.st'), sold = p.stock <= 0; s.className = 'st' + (sold ? ' out' : p.stock <= 5 ? ' low' : '');
    s.textContent = sold ? 'Sold out' : p.stock <= 5 ? 'Only ' + p.stock + ' left' : 'In stock';
    q('.wa').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent('Hello Stermont Arcade, I have a question about: ' + p.name);
    var th = q('.thumbs'); th.textContent = ''; th.hidden = imgs.length < 2;
    imgs.forEach(function (u, k) { var t = new Image(); t.src = u; t.alt = ''; t.onclick = function () { show(k); }; th.appendChild(t); });
    var d = q('.desc'), full = q('.full'); d.textContent = ''; full.hidden = !p.description;
    if (p.description) d.appendChild(fmtDesc(p.description));
    var add = q('.add'); add.disabled = sold; add.textContent = sold ? 'Sold out' : 'Add to cart'; q('.q').style.display = sold ? 'none' : ''; setQty(1); show(0);
    pd.classList.add('on'); D.documentElement.style.overflow = 'hidden'; q('.pd').scrollTop = 0;
    var more = q('.more'); d.classList.remove('clip'); more.hidden = true;
    if (d.scrollHeight > 270) { d.classList.add('clip'); more.hidden = false; more.textContent = 'Show more ▾'; }
    if (!noPush) { try { history.pushState({ stm: p.id }, '', '#p-' + p.id); } catch (e) {} }
  }
  function hide() { if (pd) pd.classList.remove('on'); D.documentElement.style.overflow = ''; cur = null; }
  function closeView() { if (history.state && history.state.stm) history.back(); else hide(); }
  window.STM_openView = function (c) { if (c && c._p) openView(c); else if (c) c.click(); };

  /* ---------- Hot deals row (products whose previous price is higher than the current price) ---------- */
  function buildDeals(rows) {
    var old = D.getElementById('deals'); if (old) old.remove();
    var list = rows.filter(function (p) { return disc(p) && p.stock > 0; }).sort(function (a, b) { return disc(b).pct - disc(a).pct; }).slice(0, 14);
    var mg = D.getElementById('music-gear'); if (!list.length || !mg) return;
    var sec = mk('section'); sec.id = 'deals'; var w = mk('div', 'wrap'), hd = mk('div', 'dh2'), h2 = mk('h2'), sp = mk('span', '', 'Hot deals');
    h2.appendChild(D.createTextNode('🔥 ')); h2.appendChild(sp); hd.appendChild(h2); w.appendChild(hd);
    w.appendChild(mk('p', 'lead', 'Prices cut on selected items. Biggest savings first.'));
    var row = mk('div', 'drow');
    list.forEach(function (p) {
      var d = disc(p), t = mk('div', 'dtile'), im = mk('div', 'im');
      if (p.images && p.images[0]) { var i = new Image(); i.src = p.images[0]; i.alt = p.name; i.loading = 'lazy'; im.appendChild(i); }
      im.appendChild(badge(d)); t.appendChild(im);
      var x = mk('div', 't'), op = mk('div', 'op'); x.appendChild(mk('h3', '', p.name)); x.appendChild(mk('div', 'np', money(p.price)));
      op.appendChild(mk('s', '', money(d.was))); x.appendChild(op);
      var b = mk('button', '', 'Add to cart'); b.type = 'button';
      b.onclick = function (e) { e.stopPropagation(); var c = D.getElementById('p-' + p.id); if (c && window.STM) STM.add(c); };
      x.appendChild(b); t.appendChild(x);
      t.onclick = function () { var c = D.getElementById('p-' + p.id); if (c) { var g = c.closest('.mcat'); if (g) g.classList.add('open'); openView(c); } };
      row.appendChild(t);
    });
    w.appendChild(row); sec.appendChild(w); mg.parentNode.insertBefore(sec, mg);
  }

  /* ---------- sort + "discounted only" bar above the category sections ---------- */
  function buildToolbar() {
    var root = D.querySelector('#music-gear .wrap'); if (!root || D.getElementById('tbar') || !root.querySelector('.pcard')) return;
    var bar = mk('div', 'tbar'), sel = D.createElement('select'), chip = mk('button', 'chip', '🔥 Discounted only'); bar.id = 'tbar'; chip.type = 'button'; sel.setAttribute('aria-label', 'Sort products');
    [['i', 'Sort: Default'], ['pa', 'Price: low to high'], ['pd', 'Price: high to low'], ['d', 'Biggest discount']].forEach(function (o) { sel.appendChild(new Option(o[1], o[0])); });
    function apply() {
      var k = sel.value, only = chip.classList.contains('on');
      [].forEach.call(root.querySelectorAll('.mgrid'), function (g) {
        var cards = [].slice.call(g.children), any = false;
        cards.sort(function (a, b) { var A = a.dataset, B = b.dataset; return k === 'pa' ? A.price - B.price : k === 'pd' ? B.price - A.price : k === 'd' ? (B.disc - A.disc) || (A.i - B.i) : A.i - B.i; });
        cards.forEach(function (c) { var hide = only && !(Number(c.dataset.disc) > 0); if (!hide) any = true; g.appendChild(c); c.classList.toggle('dealhide', hide); });
        var m = g.closest('.mcat'); if (m) { m.classList.toggle('dealhide', only && !any); if (only && any) m.classList.add('open'); }
      });
    }
    sel.onchange = apply; chip.onclick = function () { chip.classList.toggle('on'); apply(); };
    bar.appendChild(sel); bar.appendChild(chip);
    var lead = root.querySelector('.lead'); if (lead) lead.parentNode.insertBefore(bar, lead.nextSibling); else root.insertBefore(bar, root.firstChild);
  }

  /* ---------- back-to-top button + gentle reveal on scroll ---------- */
  (function () {
    var t = mk('button', '', '↑'); t.id = 'totop'; t.type = 'button'; t.setAttribute('aria-label', 'Back to top');
    t.onclick = function () { window.scrollTo({ top: 0, behavior: 'smooth' }); }; D.body.appendChild(t);
    window.addEventListener('scroll', function () { t.classList.toggle('on', window.scrollY > 700); }, { passive: true });
    if ('IntersectionObserver' in window && !(window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches)) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -6% 0px' });
      [].forEach.call(D.querySelectorAll('.how > div, .range > div, #faq details, section h2.t, .trust > div'), function (n) { n.classList.add('rv'); io.observe(n); });
    }
  })();

  /* ---------- put items into their category sections ---------- */
  function bump(m) { var c = m.querySelector('.cnt'); if (c) c.textContent = m.querySelectorAll('.pcard').length; }
  function getProducts(sel) { return fetch(SB + '/rest/v1/products?active=eq.true&select=' + sel + '&order=created_at.asc', { headers: { apikey: KEY } }); }
  getProducts('id,name,price,old_price,stock,images,featured,description,categories(name,slug)')
    .then(function (r) { return r.ok ? r : getProducts('id,name,price,stock,images,featured,description,categories(name,slug)'); })   /* old_price column not added yet: still show products */
    .then(function (r) { return r.ok ? r.json() : []; }).then(function (rows) {
      var root = D.querySelector('#music-gear .wrap');
      rows.forEach(function (p) {
        if (D.getElementById('p-' + p.id)) return;
        var cname = (p.categories && p.categories.name) || 'More products', cslug = (p.categories && p.categories.slug) || '', m = null, grid = null;
        if (root) {
          m = root.querySelector('.mcat[data-slug="' + cslug + '"]');
          if (!m) [].forEach.call(root.querySelectorAll('.mcat'), function (x) { var s = x.querySelector('.sub'); if (s && s.firstChild && s.firstChild.textContent.trim().toLowerCase() === cname.toLowerCase()) m = x; });
          if (!m) {
            m = mk('div', 'mcat'); m.setAttribute('data-slug', cslug); m.setAttribute('data-cat', cname);
            var h = mk('h3', 'sub', cname); h.setAttribute('role', 'button'); h.tabIndex = 0; h.onclick = function () { m.classList.toggle('open'); };
            var sp = mk('span', 'cnt', '0'); h.appendChild(sp); grid = mk('div', 'mgrid'); m.appendChild(h); m.appendChild(grid); root.appendChild(m);
          }
          grid = grid || m.querySelector('.mgrid'); m.classList.remove('stm-empty'); grid.appendChild(card(p)); bump(m);
        }
        if (p.featured) { var row = D.querySelector('#featured .row'), cta = row && row.querySelector('.cta'); if (row) row.insertBefore(card(p), cta); }
      });
      try { buildDeals(rows); buildToolbar(); } catch (e) {}
      var hm = location.hash.match(/^#p-(.+)$/);   /* shared link straight to an item */
      if (hm) { var c0 = D.getElementById('p-' + decodeURIComponent(hm[1])); if (c0 && c0._p) openView(c0, true); }
    }).catch(function () {});
})();
