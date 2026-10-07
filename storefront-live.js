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
    var btn = D.createElement('button'); btn.type = 'button'; btn.className = 'btn btn-main';
    if (sold) { btn.textContent = 'Sold out'; btn.disabled = true; btn.dataset.sold = '1'; btn.style.opacity = '.55'; }
    else { btn.textContent = 'Add to cart'; btn.onclick = function (e) { e.stopPropagation(); window.STM && STM.add(c, btn); }; }
    b.appendChild(h); b.appendChild(pr); b.appendChild(btn); c.appendChild(img); c.appendChild(b); return c;
  }
  fetch(SB + '/rest/v1/products?active=eq.true&select=id,name,price,stock,images,featured,categories(name)&order=created_at.asc', { headers: { apikey: KEY } })
    .then(function (r) { return r.ok ? r.json() : []; }).then(function (rows) {
      var root = D.querySelector('#music-gear .wrap'); if (!root) return;
      rows.forEach(function (p) {
        if (D.getElementById('p-' + p.id)) return;
        var cname = (p.categories && p.categories.name) || 'More products', grid = null;
        [].forEach.call(root.querySelectorAll('.mcat'), function (m) { var s = m.querySelector('.sub'); if (s && s.textContent.trim().toLowerCase() === cname.toLowerCase()) grid = m.querySelector('.mgrid'); });
        if (!grid) { var m = D.createElement('div'); m.className = 'mcat'; var s = D.createElement('h3'); s.className = 'sub'; s.textContent = cname; grid = D.createElement('div'); grid.className = 'mgrid'; m.appendChild(s); m.appendChild(grid); root.appendChild(m); }
        grid.appendChild(card(p));
        if (p.featured) { var row = D.querySelector('#featured .row'), cta = row && row.querySelector('.cta'); if (row) row.insertBefore(card(p), cta); }
      });
    }).catch(function () {});
})();
