/* Stermont Arcade · publishes products added in the admin onto the storefront. Add before </body> in index.html:
   <script src="storefront-live.js" defer></script>  (must load after the cart script) */
(function () {
  var SB = 'https://oewvtbnmyombbtggamor.supabase.co', KEY = 'sb_publishable_CQiZr-INuot9C4fbdJDz1Q_4OiWEQL7', D = document;
  function money(n) { return 'KSh ' + Math.round(n).toLocaleString('en-KE'); }
  function card(p) {
    var c = D.createElement('div'), sold = p.stock <= 0; c.className = 'pcard'; c.id = 'p-' + p.id;
    var img = D.createElement('span'); img.className = 'img'; img.style.position = 'relative';
    if (p.images && p.images[0]) { var i = new Image(); i.src = p.images[0]; i.alt = p.name; i.width = i.height = 288; i.loading = 'lazy'; img.appendChild(i); }
    var b = D.createElement('div'); b.className = 'b';
    var h = D.createElement('h3'); h.textContent = p.name;
    var pr = D.createElement('p'); pr.className = 'price'; pr.textContent = money(p.price);
    var ds = null; if (p.description) { ds = D.createElement('details'); ds.className = 'pdesc'; ds.style.cssText = 'font-size:.85rem;color:#6b6880;margin:.2rem 0 .5rem'; var sm = D.createElement('summary'); sm.textContent = 'Details'; sm.style.cursor = 'pointer'; var tx = D.createElement('div'); tx.style.cssText = 'white-space:pre-line;margin-top:.3rem'; tx.textContent = p.description; ds.appendChild(sm); ds.appendChild(tx); }
    var btn = D.createElement('button'); btn.type = 'button'; btn.className = 'btn btn-main';
    if (sold) { btn.textContent = 'Sold out'; btn.disabled = true; btn.dataset.sold = '1'; btn.style.opacity = '.55'; }
    else { btn.textContent = 'Add to cart'; btn.onclick = function (e) { e.stopPropagation(); window.STM && STM.add(c, btn); }; }
    b.appendChild(h); b.appendChild(pr); if (ds) b.appendChild(ds); b.appendChild(btn); c.appendChild(img); c.appendChild(b); return c;
  }
  function bump(m) { var c = m.querySelector('.cnt'); if (c) c.textContent = m.querySelectorAll('.pcard').length; }
  function toggle(m) { m.classList.toggle('open'); }
  fetch(SB + '/rest/v1/products?active=eq.true&select=id,name,price,stock,images,featured,description,categories(name,slug)&order=created_at.asc', { headers: { apikey: KEY } })
    .then(function (r) { return r.ok ? r.json() : []; }).then(function (rows) {
      var root = D.querySelector('#music-gear .wrap');
      rows.forEach(function (p) {
        if (D.getElementById('p-' + p.id)) return;
        var cname = (p.categories && p.categories.name) || 'More products', cslug = (p.categories && p.categories.slug) || '', m = null, grid = null;
        if (root) {
          m = root.querySelector('.mcat[data-slug="' + cslug + '"]');
          if (!m) [].forEach.call(root.querySelectorAll('.mcat'), function (x) { var s = x.querySelector('.sub'); if (s && s.firstChild && s.firstChild.textContent.trim().toLowerCase() === cname.toLowerCase()) m = x; });
          if (!m) {   /* category not on the page yet: create its section, collapsible like the others */
            m = D.createElement('div'); m.className = 'mcat'; m.setAttribute('data-slug', cslug); m.setAttribute('data-cat', cname);
            var h = D.createElement('h3'); h.className = 'sub'; h.textContent = cname; h.setAttribute('role', 'button'); h.tabIndex = 0; h.onclick = function () { toggle(m); };
            var sp = D.createElement('span'); sp.className = 'cnt'; sp.textContent = '0'; h.appendChild(sp);
            grid = D.createElement('div'); grid.className = 'mgrid'; m.appendChild(h); m.appendChild(grid); root.appendChild(m);
          }
          grid = grid || m.querySelector('.mgrid'); m.classList.remove('stm-empty');
          grid.appendChild(card(p)); bump(m);
        }
        if (p.featured) { var row = D.querySelector('#featured .row'), cta = row && row.querySelector('.cta'); if (row) row.insertBefore(card(p), cta); }
      });
    }).catch(function () {});
})();
