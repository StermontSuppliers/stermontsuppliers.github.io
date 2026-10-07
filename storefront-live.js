/* Stermont Arcade · publishes products added in the admin onto the storefront (cards + Jumia-style product view).
   Loaded at the end of index.html:  <script src="storefront-live.js" defer></script> */
(function () {
  var SB = 'https://oewvtbnmyombbtggamor.supabase.co', KEY = 'sb_publishable_CQiZr-INuot9C4fbdJDz1Q_4OiWEQL7', D = document, WA = '254748888230';
  function money(n) { return 'KSh ' + Math.round(n).toLocaleString('en-KE'); }
  function mk(t, c, x) { var e = D.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }

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
    img.appendChild(heart(c.id)); setTimeout(paintHearts, 0);
    var b = mk('div', 'b'), h = mk('h3', '', p.name), pr = mk('p', 'price', money(p.price));
    var btn = mk('button', 'btn btn-main'); btn.type = 'button';
    if (sold) { btn.textContent = 'Sold out'; btn.disabled = true; btn.dataset.sold = '1'; btn.style.opacity = '.55'; }
    else { btn.textContent = 'Add to cart'; btn.onclick = function (e) { e.stopPropagation(); window.STM && STM.add(c, btn); }; }
    b.appendChild(h); b.appendChild(pr); b.appendChild(btn); c.appendChild(img); c.appendChild(b);
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
      '<div class="info"><h2></h2><div class="pr"></div><span class="st"></span><div><a class="wa" target="_blank" rel="noopener">Ask about this item on WhatsApp</a></div></div>' +
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

  /* ---------- put items into their category sections ---------- */
  function bump(m) { var c = m.querySelector('.cnt'); if (c) c.textContent = m.querySelectorAll('.pcard').length; }
  fetch(SB + '/rest/v1/products?active=eq.true&select=id,name,price,stock,images,featured,description,categories(name,slug)&order=created_at.asc', { headers: { apikey: KEY } })
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
      var hm = location.hash.match(/^#p-(.+)$/);   /* shared link straight to an item */
      if (hm) { var c0 = D.getElementById('p-' + decodeURIComponent(hm[1])); if (c0 && c0._p) openView(c0, true); }
    }).catch(function () {});
})();
