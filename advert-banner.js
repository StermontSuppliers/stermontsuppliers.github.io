/* Stermont Arcade · Advert banner.
   Every product marked "Feature as advert / top banner" in the admin Catalog becomes a slide at the top of the home page
   (photo, badge, price, Order now + Add to cart). Auto-rotates, pauses when touched, updates the dots.
   Add at the end of index.html, after account-panel.js:  <script src="advert-banner.js" defer></script> */
(function () {
  var SB = 'https://oewvtbnmyombbtggamor.supabase.co', KEY = 'sb_publishable_CQiZr-INuot9C4fbdJDz1Q_4OiWEQL7', D = document, WA = '254748888230';
  var MAX = 6, EVERY = 5000, GRAD = ['linear-gradient(135deg,#7c3aed,#3b0f8c 70%)', 'linear-gradient(135deg,#1d0745,#5b21b6 75%)', 'linear-gradient(135deg,#5b21b6,#2a0e5c 70%)'];
  function mk(t, c, x) { var e = D.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function money(n) { return 'KSh ' + Math.round(Number(n) || 0).toLocaleString('en-KE'); }

  var css = '.slide.ad{color:#fff;padding:0;min-height:230px;flex-direction:row;align-items:stretch;justify-content:flex-start;border:2px solid rgba(200,243,29,.55);box-shadow:0 8px 24px rgba(91,33,182,.35);cursor:pointer;text-align:left}' +
    '.slide.ad .ad-t{flex:1 1 54%;min-width:0;padding:1.1rem 0 1.1rem 1.1rem;display:flex;flex-direction:column;justify-content:center;gap:.35rem;position:relative;z-index:1}' +
    '.slide.ad .ad-b{align-self:flex-start;background:#c8f31d;color:#1a2e05;font-size:.7rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase;border-radius:999px;padding:.25rem .65rem;animation:adpulse 1.8s ease-in-out infinite}' +
    '.slide.ad .ad-b.hot{background:#ff6b3d;color:#fff}' +
    '.slide.ad h2{font-size:1.15rem;line-height:1.2;margin:.1rem 0;max-width:none;font-weight:800;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}' +
    '.slide.ad .ad-p{font-size:1.55rem;font-weight:900;color:#c8f31d;line-height:1.1}.slide.ad .ad-s{font-size:.78rem;opacity:.85;font-weight:600}' +
    '.slide.ad .ad-a{display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.45rem}' +
    '.slide.ad .ad-a button{border:0;border-radius:999px;font:inherit;font-weight:800;font-size:.82rem;padding:.55rem .95rem;cursor:pointer}' +
    '.slide.ad .ad-o{background:#c8f31d;color:#1a2e05}.slide.ad .ad-c{background:rgba(255,255,255,.18);color:#fff}' +
    '.slide.ad .ad-i{flex:0 0 46%;position:relative;background:#fff;border-radius:60px 0 0 60px;display:grid;place-items:center;overflow:hidden;margin:0}' +
    '.slide.ad .ad-i img{position:static;width:100%;height:100%;max-height:none;object-fit:contain;padding:.6rem;border-radius:0}' +
    '.slide.ad .ad-i span{font-size:3rem}' +
    '.slide.ad::after{display:none}' +
    '@keyframes adpulse{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}' +
    '.dots i{cursor:pointer}@media(prefers-reduced-motion:reduce){.slide.ad .ad-b{animation:none}}';

  function openProduct(id, name) {
    var c = D.getElementById('p-' + id);
    if (c && window.STM_openView) return window.STM_openView(c);
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent('Hello Stermont Arcade, I would like to order: ' + name), '_blank', 'noopener');
  }
  function addCart(id, name, btn) {
    var c = D.getElementById('p-' + id);
    if (c && window.STM && window.STM.add) { window.STM.add(c, null, 1); var t = btn.textContent; btn.textContent = '✓ Added'; setTimeout(function () { btn.textContent = t; }, 1400); }
    else openProduct(id, name);
  }
  function badge(p) {
    var age = (Date.now() - new Date(p.created_at).getTime()) / 864e5;
    if (p.stock <= 5) return ['Only ' + p.stock + ' left', 'hot'];
    if (age <= 14) return ['✨ New arrival', ''];
    return ['🔥 Hot deal', 'hot'];
  }
  function slide(p, i) {
    var s = mk('div', 'slide ad'), t = mk('div', 'ad-t'), im = mk('div', 'ad-i'), b = badge(p);
    s.style.background = GRAD[i % GRAD.length]; s.setAttribute('role', 'link'); s.tabIndex = 0; s.setAttribute('data-ad', p.id);
    t.appendChild(mk('span', 'ad-b ' + b[1], b[0])); t.appendChild(mk('h2', '', p.name)); t.appendChild(mk('div', 'ad-p', money(p.price)));
    t.appendChild(mk('div', 'ad-s', 'Pay by M-Pesa · Delivery countrywide'));
    var a = mk('div', 'ad-a'), o = mk('button', 'ad-o', 'Order now'), c = mk('button', 'ad-c', '+ Cart'); o.type = c.type = 'button';
    o.onclick = function (e) { e.stopPropagation(); openProduct(p.id, p.name); };
    c.onclick = function (e) { e.stopPropagation(); addCart(p.id, p.name, c); };
    a.appendChild(o); a.appendChild(c); t.appendChild(a);
    var u = (p.images || []).filter(Boolean)[0];
    if (u) { var g = new Image(); g.src = u; g.alt = p.name; g.width = g.height = 300; if (i > 0) g.loading = 'lazy'; im.appendChild(g); } else im.appendChild(mk('span', '', '📦'));
    s.appendChild(t); s.appendChild(im);
    s.onclick = function () { openProduct(p.id, p.name); };
    s.onkeydown = function (e) { if (e.key === 'Enter') openProduct(p.id, p.name); };
    return s;
  }

  function init(rows) {
    var sl = D.getElementById('slides'), dots = D.getElementById('dots'); if (!sl || !dots || !rows.length) return;
    var st = mk('style'); st.textContent = css; D.head.appendChild(st);
    var first = sl.firstChild;
    rows.forEach(function (p, i) { if (!sl.querySelector('[data-ad="' + p.id + '"]')) sl.insertBefore(slide(p, i), first); });
    sl.scrollLeft = 0;
    var timer = null, hold = 0;
    function slides() { return [].slice.call(sl.children); }
    function center(el) { var r = el.getBoundingClientRect(), sr = sl.getBoundingClientRect(); return sl.scrollLeft + (r.left - sr.left) - (sr.width - r.width) / 2; }
    function current() {
      var best = 0, bd = 1e9, mid = sl.scrollLeft; slides().forEach(function (el, k) { var d = Math.abs(center(el) - mid); if (d < bd) { bd = d; best = k; } }); return best;
    }
    function paint() { var k = current(); [].forEach.call(dots.children, function (d, j) { d.classList.toggle('on', j === k); }); }
    function go(k) { var l = slides(); if (!l.length) return; sl.scrollTo({ left: center(l[(k + l.length) % l.length]), behavior: 'smooth' }); }
    dots.textContent = ''; slides().forEach(function (_, k) { var d = D.createElement('i'); d.onclick = function () { hold = Date.now() + 8000; go(k); }; dots.appendChild(d); });
    dots.removeAttribute('aria-hidden');
    sl.addEventListener('scroll', paint, { passive: true }); paint();
    ['touchstart', 'pointerdown', 'wheel', 'keydown'].forEach(function (n) { sl.addEventListener(n, function () { hold = Date.now() + 8000; }, { passive: true }); });
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;
    if (!reduce && slides().length > 1) {
      timer = setInterval(function () {
        if (D.hidden || Date.now() < hold) return;
        var r = sl.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;   /* only while the banner is on screen */
        go(current() + 1);
      }, EVERY);
    }
    window.addEventListener('resize', paint);
  }

  fetch(SB + '/rest/v1/products?active=eq.true&featured=eq.true&stock=gt.0&select=id,name,price,stock,images,created_at&order=created_at.desc&limit=' + MAX, { headers: { apikey: KEY } })
    .then(function (r) { return r.ok ? r.json() : []; }).then(init).catch(function () {});
})();
