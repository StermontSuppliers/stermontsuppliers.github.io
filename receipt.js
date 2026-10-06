/* Stermont Mall receipts: PDF, email (EmailJS) and WhatsApp text.
   Public API (unchanged): STM_RECEIPT.pdf(order), .email(order), .text(order)
   A receipt is only produced for orders that have an M-Pesa payment code (order.pay_code).
   The code is printed 3 times on the PDF: hero ticket, payment panel, and the footer of every page. */
(function () {
  'use strict';

  /* ---- 1. Fill these in once (EmailJS: https://www.emailjs.com) ---- */
  var EMAILJS = { serviceId: '', templateId: '', publicKey: '' };

  /* ---- 2. Business details printed on the receipt ---- */
  var BIZ = {
    name: 'Stermont Mall',
    tag: 'Everything you need, one trusted store.',
    phone: '+254 748 888 230',
    email: 'stermontmall@gmail.com',
    web: 'stermontmall.github.io',
    place: 'Nairobi, Kenya',
    paybill: '717777',
    account: '0748888230',
    logo: 'logo.png',            // put your logo in the repo root with this name
    signature: 'signature.png',  // optional: a scanned signature (transparent PNG) of the authorised person
    stamp: 'stamp.png',          // optional: company stamp image
    signatory: ''                // optional: pre-printed name under the signature, e.g. 'Jane Wanjiku'
  };

  var C = {
    purple: [124, 58, 237], navy: [42, 14, 92], lime: [200, 243, 29], green: [21, 128, 61], amber: [194, 105, 8],
    ink: [34, 30, 46], mute: [110, 104, 128], line: [230, 226, 240], tint: [246, 242, 255], tint2: [251, 249, 255],
    lav: [214, 200, 245], white: [255, 255, 255], tile: [74, 34, 142]
  };
  var W = 210, H = 297, M = 14, CW = W - 2 * M, FOOT = H - 18;   // page, margin, content width, lowest y for body content

  /* ---------- small utilities ---------- */
  function money(n) { return 'KSh ' + Number(n || 0).toLocaleString('en-KE'); }
  function when(d) {
    try { return new Date(d).toLocaleString('en-KE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; }
  }
  function receiptNo(o) { return 'RCP-' + String(o.ref || '').replace(/^STM-/, ''); }
  function code(o) { return String(o.pay_code || '').replace(/\s+/g, '').toUpperCase(); }
  function needCode(o) {
    if (!o || !o.pay_code) throw new Error('This order has no M-Pesa payment code yet, so no receipt can be issued.');
  }
  function paidAmount(o) { return o.pay_amount != null && o.pay_amount !== '' ? Number(o.pay_amount) : Number(o.subtotal || 0); }
  function balance(o) { return Math.max(0, Number(o.subtotal || 0) - paidAmount(o)); }

  var ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  var TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  function below1000(n) {
    var s = '';
    if (n >= 100) { s += ONES[Math.floor(n / 100)] + ' hundred'; n %= 100; if (n) s += ' and '; }
    if (n >= 20) { s += TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : ''); } else if (n > 0) { s += ONES[n]; }
    return s;
  }
  function words(n) {   // 46999 -> "Forty-six thousand nine hundred and ninety-nine Kenya shillings only"
    n = Math.max(0, Number(n) || 0);
    var whole = Math.floor(n), cents = Math.round((n - whole) * 100), parts = [];
    var units = [[1e9, 'billion'], [1e6, 'million'], [1e3, 'thousand']];
    units.forEach(function (u) { if (whole >= u[0]) { parts.push(below1000(Math.floor(whole / u[0])) + ' ' + u[1]); whole %= u[0]; } });
    if (whole > 0 || !parts.length) parts.push(whole === 0 && !parts.length ? 'zero' : (parts.length && whole < 100 ? 'and ' : '') + below1000(whole));
    var s = parts.join(' ').replace(/\s+/g, ' ').trim();
    s = s.charAt(0).toUpperCase() + s.slice(1) + ' Kenya shillings';
    if (cents) s += ' and ' + below1000(cents) + ' cents';
    return s + ' only';
  }

  /* ---------- loaders ---------- */
  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script'); s.src = src; s.onload = res;
      s.onerror = function () { s.remove(); rej(new Error('load failed')); }; document.head.appendChild(s);
    });
  }
  var libP = null, qrP = null;
  function loadLib() {
    if (window.jspdf && window.jspdf.jsPDF) return Promise.resolve(window.jspdf.jsPDF);
    if (libP) return libP;
    libP = loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
      .catch(function () { return loadScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js'); })
      .then(function () { return window.jspdf.jsPDF; })
      .catch(function () { libP = null; throw new Error('Could not load the PDF tool. Check your internet connection.'); });
    return libP;
  }
  function loadQR() {   // optional: the receipt is still produced without the QR code
    if (window.qrcode) return Promise.resolve(window.qrcode);
    if (qrP) return qrP;
    qrP = loadScript('https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js')
      .catch(function () { return loadScript('https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js'); })
      .then(function () { return window.qrcode || null; })
      .catch(function () { qrP = null; return null; });
    return qrP;
  }
  function loadImg(src) {  // resolves { data, w, h } or null (never rejects)
    return new Promise(function (res) {
      var im = new Image();
      im.onload = function () {
        try {
          var c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight;
          c.getContext('2d').drawImage(im, 0, 0);
          res({ data: c.toDataURL('image/png'), w: im.naturalWidth, h: im.naturalHeight });
        } catch (e) { res(null); }
      };
      im.onerror = function () { res(null); };
      im.src = src + (src.indexOf('?') < 0 ? '?v=1' : '');
    });
  }

  /* ---------- drawing helpers ---------- */
  function fill(d, c) { d.setFillColor(c[0], c[1], c[2]); }
  function stroke(d, c) { d.setDrawColor(c[0], c[1], c[2]); }
  function ink(d, c) { d.setTextColor(c[0], c[1], c[2]); }
  function mix(a, b, t) { return [Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t), Math.round(a[2] + (b[2] - a[2]) * t)]; }
  function fit(img, maxW, maxH) { var r = Math.min(maxW / img.w, maxH / img.h); return { w: img.w * r, h: img.h * r }; }
  function alpha(d, a, fn) { d.saveGraphicsState(); d.setGState(new d.GState({ opacity: a, 'stroke-opacity': a })); fn(); d.restoreGraphicsState(); }
  function font(d, style, size, c) { d.setFont('helvetica', style); d.setFontSize(size); if (c) ink(d, c); }

  function tick(d, cx, cy, s, c, lw) {   // a check mark drawn with lines (no special characters needed)
    stroke(d, c); d.setLineWidth(lw); d.setLineCap(1);
    d.line(cx - s * 0.45, cy + s * 0.02, cx - s * 0.1, cy + s * 0.38);
    d.line(cx - s * 0.1, cy + s * 0.38, cx + s * 0.5, cy - s * 0.36);
    d.setLineCap(0);
  }
  function rotRect(d, cx, cy, w, h, deg) {   // outlined rectangle rotated about its centre
    var a = deg * Math.PI / 180, cos = Math.cos(a), sin = Math.sin(a);
    var pts = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]].map(function (p) {
      return [cx + p[0] * cos + p[1] * sin, cy - p[0] * sin + p[1] * cos];
    });
    for (var i = 0; i < 4; i++) { var p = pts[i], q = pts[(i + 1) % 4]; d.line(p[0], p[1], q[0], q[1]); }
  }
  function card(d, x, y, w, h, fc, bc) {   // soft shadow + rounded card
    alpha(d, 0.07, function () { fill(d, [20, 0, 60]); d.roundedRect(x + 0.5, y + 0.9, w, h, 3, 3, 'F'); });
    fill(d, fc); stroke(d, bc || C.line); d.setLineWidth(0.3); d.roundedRect(x, y, w, h, 3, 3, 'FD');
  }
  function watermark(d) {
    alpha(d, 0.035, function () {
      font(d, 'bold', 64, C.purple);
      d.text('STERMONT', W / 2 - 4, H / 2 + 22, { align: 'center', angle: 35 });
      font(d, 'bold', 64, C.purple);
      d.text('MALL', W / 2 + 22, H / 2 - 4, { align: 'center', angle: 35 });
    });
  }
  function newPage(d) { d.addPage(); watermark(d); }

  /* ---------- sections ---------- */
  function header(d, logo, o, paid) {
    var hh = 44, steps = 56;
    for (var i = 0; i < steps; i++) { fill(d, mix(C.navy, C.purple, Math.pow(i / (steps - 1), 1.1) * 0.95)); d.rect(i * W / steps, 0, W / steps + 0.4, hh, 'F'); }
    alpha(d, 0.07, function () { fill(d, C.white); d.circle(W - 16, 4, 34, 'F'); d.circle(W - 58, 46, 18, 'F'); d.circle(96, -6, 14, 'F'); });
    fill(d, C.lime); d.rect(0, hh, W, 1.6, 'F');

    // logo badge
    fill(d, C.white); d.roundedRect(M, 9, 62, 23, 3.2, 3.2, 'F');
    if (logo) { var s = fit(logo, 54, 16); d.addImage(logo.data, 'PNG', M + (62 - s.w) / 2, 9 + (23 - s.h) / 2, s.w, s.h); }
    else {
      font(d, 'bold', 19, C.navy);
      var tw = d.getTextWidth('Stermont'), mw = d.getTextWidth('Mall'), total = tw + 2 + mw + 4, sx = M + (62 - total) / 2;
      d.text('Stermont', sx, 9 + 14.2);
      fill(d, C.lime); d.roundedRect(sx + tw + 2, 9 + 6.4, mw + 4, 10, 1.6, 1.6, 'F');
      ink(d, [18, 18, 18]); d.text('Mall', sx + tw + 4, 9 + 14.2);
    }
    font(d, 'italic', 8.2, C.lav); d.text(BIZ.tag, M + 1, 38.5);

    // title block
    font(d, 'bold', 21, C.white); d.text('PAYMENT RECEIPT', W - M, 17.5, { align: 'right' });
    font(d, 'bold', 11.5, C.lime); d.text(receiptNo(o), W - M, 25.2, { align: 'right' });
    font(d, 'normal', 8.2, C.lav); d.text('Issued ' + when(o.handled_at || o.created_at), W - M, 30.4, { align: 'right' });

    // status pill
    var pw = paid ? 31 : 35, px = W - M - pw, py = 34.4;
    fill(d, paid ? C.green : C.amber); d.roundedRect(px, py, pw, 6.6, 3.3, 3.3, 'F');
    tick(d, px + 5.6, py + 3.2, 2.6, C.white, 0.55);
    font(d, 'bold', 7.2, C.white); d.text(paid ? 'PAID IN FULL' : 'PART PAYMENT', px + 9.4, py + 4.5);
  }

  function hero(d, o, qr, y) {
    var h = 38;
    card(d, M, y, CW, h, C.white, C.line);
    fill(d, C.lime); d.roundedRect(M, y + 7, 1.8, h - 14, 0.9, 0.9, 'F');
    font(d, 'bold', 7.5, C.purple); d.text('AMOUNT PAID', M + 8, y + 9);
    font(d, 'bold', 27, C.navy); d.text(money(paidAmount(o)), M + 8, y + 21);
    font(d, 'italic', 7.8, C.mute);
    d.splitTextToSize(words(paidAmount(o)), 126).slice(0, 2).forEach(function (l, i) { d.text(l, M + 8, y + 27.4 + i * 3.7); });

    var qx = W - M - 6 - 26, qy = y + 5;
    if (qr) {
      fill(d, C.white); stroke(d, C.line); d.setLineWidth(0.3); d.roundedRect(qx - 1.5, qy - 1.5, 29, 29, 2, 2, 'FD');
      var n = qr.getModuleCount(), cell = 26 / n; fill(d, C.navy);
      for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (qr.isDark(r, c)) d.rect(qx + c * cell, qy + r * cell, cell + 0.03, cell + 0.03, 'F');
      font(d, 'normal', 6, C.mute); d.text('Scan for receipt details', qx + 13, y + h - 2.4, { align: 'center' });
    } else {   // seal fallback
      var cx = qx + 13, cy = y + 17;
      fill(d, C.tint); d.circle(cx, cy, 13, 'F'); fill(d, C.green); d.circle(cx, cy, 9.5, 'F');
      tick(d, cx, cy, 9, C.white, 1.3);
    }
    return y + h;
  }

  function codeTicket(d, o, y) {   // the M-Pesa code, printed as a row of ticket tiles
    var h = 18, cd = code(o), n = cd.length;
    fill(d, C.navy); d.roundedRect(M, y, CW, h, 3, 3, 'F');
    fill(d, C.white); d.circle(M, y + h / 2, 2.8, 'F'); d.circle(W - M, y + h / 2, 2.8, 'F');   // ticket notches
    stroke(d, C.white); d.setLineWidth(0.2);
    font(d, 'bold', 7.6, C.lime); d.text('M-PESA', M + 8, y + 7.6);
    font(d, 'normal', 6.8, C.lav); d.text('TRANSACTION CODE', M + 8, y + 12.1);
    alpha(d, 0.35, function () { stroke(d, C.lav); d.setLineDashPattern([1, 1], 0); d.setLineWidth(0.3); d.line(M + 41, y + 3.5, M + 41, y + h - 3.5); d.setLineDashPattern([], 0); });

    var xs = M + 46, aw = CW - 46 - 33, pitch = Math.min(9.2, aw / n), tw = pitch - 1.1, th = 10.4, ty = y + (h - th) / 2;
    var x0 = xs + (aw - n * pitch) / 2 + 0.55;
    for (var i = 0; i < n; i++) {
      fill(d, C.tile); d.roundedRect(x0 + i * pitch, ty, tw, th, 1.4, 1.4, 'F');
      d.setFont('courier', 'bold'); d.setFontSize(14); ink(d, C.lime);
      d.text(cd.charAt(i), x0 + i * pitch + tw / 2, ty + th / 2 + 1.5, { align: 'center' });
    }
    fill(d, C.green); d.circle(W - M - 25, y + h / 2, 3, 'F'); tick(d, W - M - 25, y + h / 2, 3, C.white, 0.5);
    font(d, 'bold', 6.6, C.white); d.text('PAYMENT', W - M - 20.5, y + 8); d.text('CONFIRMED', W - M - 20.5, y + 11.6);
    return y + h;
  }

  function infoCards(d, o, y) {
    var gap = 5, colW = (CW - 2 * gap) / 3, ew = colW - 9;
    var delivery = o.method === 'delivery';
    var cols = [
      { t: 'BILLED TO', e: [['Customer', o.customer_name], ['Phone', o.phone], ['Email', o.email]] },
      { t: 'PAYMENT', e: [['Order reference', o.ref], ['Paid via', 'M-Pesa Paybill ' + BIZ.paybill], ['Account number', BIZ.account]] },
      { t: delivery ? 'DELIVERY' : 'COLLECTION', e: [['Method', delivery ? 'Home delivery' : 'Store pickup'], [delivery ? 'Deliver to' : 'Pickup point', delivery ? [o.address, o.county].filter(Boolean).join(', ') : 'Stermont Mall store'], ['Order placed', when(o.created_at)]] }
    ];
    var maxH = 0;
    cols.forEach(function (col) {   // measure first so all three cards are the same height
      var h = 11.5;
      col.m = col.e.map(function (en) {
        var v = String(en[1] || '-'), size = 8.4, ln;
        font(d, 'bold', size);
        ln = d.splitTextToSize(v, ew);
        while (size > 6 && ln.some(function (l) { return d.getTextWidth(l) > ew; })) { size -= 0.4; d.setFontSize(size); ln = d.splitTextToSize(v, ew); }
        h += 3.4 + ln.length * 3.8 + 1.6; return { k: en[0], lines: ln, size: size };
      });
      maxH = Math.max(maxH, h);
    });
    cols.forEach(function (col, i) {
      var x = M + i * (colW + gap), yy = y + 10;
      fill(d, C.tint); stroke(d, C.line); d.setLineWidth(0.25); d.roundedRect(x, y, colW, maxH, 3, 3, 'FD');
      fill(d, C.purple); d.roundedRect(x + 4.5, y + 4.2, 2.2, 2.2, 0.6, 0.6, 'F');
      font(d, 'bold', 7.4, C.purple); d.text(col.t, x + 8.5, y + 6.1);
      col.m.forEach(function (en) {
        font(d, 'normal', 6.4, C.mute); d.text(en.k.toUpperCase(), x + 4.5, yy);
        font(d, 'bold', en.size, C.ink); en.lines.forEach(function (l, j) { d.text(l, x + 4.5, yy + 3.7 + j * 3.8); });
        yy += 3.4 + en.lines.length * 3.8 + 1.6;
      });
    });
    return y + maxH;
  }

  function timeline(d, o, y) {
    var xs = [M + 5, W / 2, W - M - 5], now = new Date();
    var steps = [['Order placed', when(o.created_at), 'left'], ['Payment confirmed', when(o.handled_at || o.created_at), 'center'], ['Receipt issued', when(now), 'right']];
    var cy = y + 3.4;
    stroke(d, C.lav); d.setLineWidth(0.7); d.line(xs[0], cy, xs[2], cy);
    stroke(d, C.purple); d.setLineWidth(0.7); d.line(xs[0], cy, xs[1], cy);
    steps.forEach(function (s, i) {
      var last = i === 2;
      fill(d, C.white); d.circle(xs[i], cy, 4, 'F');
      fill(d, last ? C.lime : C.purple); d.circle(xs[i], cy, 3.1, 'F');
      tick(d, xs[i], cy, 2.9, last ? C.navy : C.white, 0.55);
      var ax = i === 0 ? M : i === 2 ? W - M : xs[i];
      font(d, 'bold', 7.6, C.ink); d.text(s[0], ax, cy + 8, { align: s[2] });
      font(d, 'normal', 7, C.mute); d.text(s[1], ax, cy + 11.7, { align: s[2] });
    });
    return y + 15;
  }

  /* items table */
  var COL = { qty: W - M - 62, unit: W - M - 36, amt: W - M - 4 };
  function tableHead(d, y) {
    fill(d, C.purple); d.roundedRect(M, y, CW, 7.6, 2, 2, 'F');
    font(d, 'bold', 7.8, C.white);
    d.text('#', M + 4.6, y + 5, { align: 'center' }); d.text('ITEM', M + 11, y + 5);
    d.text('QTY', COL.qty, y + 5, { align: 'center' }); d.text('UNIT PRICE', COL.unit, y + 5, { align: 'right' }); d.text('AMOUNT', COL.amt, y + 5, { align: 'right' });
    return y + 7.6;
  }
  function itemsTable(d, o, y) {
    y = tableHead(d, y);
    (o.items || []).forEach(function (it, i) {
      font(d, 'normal', 9);
      var lines = d.splitTextToSize(String(it.name || ''), COL.qty - 12 - (M + 11)), rh = Math.max(10, lines.length * 4.2 + 5.6);
      if (y + rh > FOOT) { newPage(d); y = tableHead(d, 16); }
      if (i % 2 === 1) { fill(d, C.tint2); d.rect(M, y, CW, rh, 'F'); }
      fill(d, C.tint); d.circle(M + 4.6, y + 4.9, 2.7, 'F');
      font(d, 'bold', 7, C.purple); d.text(String(i + 1), M + 4.6, y + 5.5, { align: 'center' });
      font(d, 'normal', 9, C.ink); d.text(lines, M + 11, y + 5.5);
      var qty = Number(it.qty || 1), unit = it.price != null ? Number(it.price) : (Number(it.total || 0) / qty);
      fill(d, C.tint); d.roundedRect(COL.qty - 5, y + 2, 10, 5.4, 2.7, 2.7, 'F');
      font(d, 'bold', 8.4, C.navy); d.text(String(qty), COL.qty, y + 5.9, { align: 'center' });
      font(d, 'normal', 9, C.ink); d.text(Number(unit).toLocaleString('en-KE'), COL.unit, y + 5.5, { align: 'right' });
      font(d, 'bold', 9.4, C.navy); d.text(Number(it.total || 0).toLocaleString('en-KE'), COL.amt, y + 5.5, { align: 'right' });
      stroke(d, C.line); d.setLineWidth(0.2); d.line(M, y + rh, W - M, y + rh);
      y += rh;
    });
    return y;
  }

  function paidStamp(d, cx, cy, full) {
    var col = full ? C.green : C.amber;
    alpha(d, 0.82, function () {
      stroke(d, col); ink(d, col);
      d.setLineWidth(1.1); rotRect(d, cx, cy, 46, 16.5, 10);
      d.setLineWidth(0.35); rotRect(d, cx, cy, 43.4, 13.9, 10);
      font(d, 'bold', full ? 18 : 12.5, col); d.text(full ? 'PAID' : 'PART PAID', cx - 0.4, cy + (full ? 1.2 : 0.8), { align: 'center', angle: 10 });
      font(d, 'bold', 6.8, col); d.text(full ? 'IN FULL  |  M-PESA' : 'BALANCE OUTSTANDING', cx + 1.2, cy + 6.3, { align: 'center', angle: 10 });
    });
  }

  function totals(d, o, y) {
    var t0 = y, px = W - M - 86, pw = 86, ph = 35, bal = balance(o), full = bal === 0;
    // notes + stamp (left)
    font(d, 'bold', 7.4, C.purple); d.text('NOTES', M, t0 + 4);
    font(d, 'normal', 7.6, C.mute);
    d.splitTextToSize('Delivery fee, if any, is confirmed separately on WhatsApp. Please keep this receipt as your proof of purchase.', 76).forEach(function (l, i) { d.text(l, M, t0 + 9 + i * 3.7); });
    paidStamp(d, M + 44, t0 + 25.5, full);
    // totals panel (right)
    card(d, px, t0, pw, ph, C.tint, C.line);
    var l = px + 5, r = px + pw - 5;
    font(d, 'normal', 9.2, C.ink); d.text('Subtotal', l, t0 + 8.2); d.text(money(o.subtotal), r, t0 + 8.2, { align: 'right' });
    font(d, 'bold', 9.2, C.ink); d.text('Amount paid (M-Pesa)', l, t0 + 15); d.text(money(paidAmount(o)), r, t0 + 15, { align: 'right' });
    font(d, 'normal', 7, C.mute); d.text('Transaction code', l, t0 + 20.4);
    d.setFont('courier', 'bold'); d.setFontSize(8.6); ink(d, C.navy); d.text(code(o), r, t0 + 20.4, { align: 'right' });
    fill(d, full ? C.navy : C.amber); d.roundedRect(px + 3, t0 + 24, pw - 6, 8.6, 2.2, 2.2, 'F');
    font(d, 'bold', 8.8, C.white); d.text('BALANCE DUE', l, t0 + 29.6);
    font(d, 'bold', 11, full ? C.lime : C.white); d.text(money(bal), r, t0 + 29.7, { align: 'right' });
    return t0 + ph;
  }

  function signatures(d, y, sig, stamp) {
    var bw = (CW - 10) / 3, bh = 27;
    stroke(d, C.purple); d.setLineWidth(0.5); d.line(M, y, W - M, y);
    font(d, 'bold', 7.6, C.navy); d.text('AUTHORISATION', M, y + 5);
    var top = y + 8;
    function box(x, title, img, name, withDate) {
      stroke(d, C.line); d.setLineWidth(0.3); fill(d, C.white); d.roundedRect(x, top, bw, bh, 2.4, 2.4, 'FD');
      font(d, 'bold', 6.8, C.purple); d.text(title, x + 3.5, top + 4.6);
      if (img) { var s = fit(img, bw - 12, 13); d.addImage(img.data, 'PNG', x + (bw - s.w) / 2, top + 6.2, s.w, s.h); }
      stroke(d, C.mute); d.setLineWidth(0.25); d.line(x + 4, top + bh - 6, x + bw - 4, top + bh - 6);
      font(d, 'normal', 6.4, C.mute); d.text('Signature' + (name ? '  |  ' + name : ''), x + 4, top + bh - 2.6);
      if (withDate) d.text('Date: ____ / ____ / ______', x + bw - 4, top + bh - 2.6, { align: 'right' });
    }
    box(M, 'AUTHORISED SIGNATORY', sig, BIZ.signatory, false);
    box(M + bw + 5, 'RECEIVED BY (CUSTOMER)', null, '', true);
    var sx = M + 2 * (bw + 5);
    stroke(d, C.line); d.setLineWidth(0.3); fill(d, C.white); d.roundedRect(sx, top, bw, bh, 2.4, 2.4, 'FD');
    font(d, 'bold', 6.8, C.purple); d.text('COMPANY STAMP', sx + 3.5, top + 4.6);
    if (stamp) { var ss = fit(stamp, bw - 8, 20); d.addImage(stamp.data, 'PNG', sx + (bw - ss.w) / 2, top + 6, ss.w, ss.h); }
    else { stroke(d, [205, 198, 225]); d.setLineDashPattern([1.4, 1.4], 0); d.setLineWidth(0.3); d.circle(sx + bw / 2, top + 13.6, 8); d.setLineDashPattern([], 0); }
    font(d, 'normal', 6.4, C.mute); d.text('Official stamp', sx + bw / 2, top + bh - 2.6, { align: 'center' });
    return top + bh;
  }

  function footers(d, o) {   // on every page: code strip + thank-you bar
    var n = d.getNumberOfPages();
    for (var p = 1; p <= n; p++) {
      d.setPage(p);
      stroke(d, C.line); d.setLineWidth(0.25); d.line(M, H - 17.2, W - M, H - 17.2);
      var lead = 'Receipt ' + receiptNo(o) + '   |   Order ' + (o.ref || '') + '   |   M-Pesa code';
      font(d, 'normal', 6.6, C.mute); d.text(lead, M, H - 14.2);
      var lw = d.getTextWidth(lead);
      d.setFont('courier', 'bold'); d.setFontSize(7.6); ink(d, C.navy); d.text(code(o), M + lw + 2, H - 14.2);
      font(d, 'normal', 6.4, C.mute); d.text('Computer-generated receipt, valid with the M-Pesa transaction code shown.', W - M, H - 14.2, { align: 'right' });
      fill(d, C.purple); d.rect(0, H - 11, W, 11, 'F'); fill(d, C.lime); d.rect(0, H - 11, W, 0.9, 'F');
      font(d, 'bold', 9, C.white); d.text('Thank you for shopping with ' + BIZ.name + '!', M, H - 4.4);
      font(d, 'normal', 7.4, C.white); d.text(BIZ.phone + '   |   ' + BIZ.email + '   |   ' + BIZ.web + (n > 1 ? '   |   Page ' + p + '/' + n : ''), W - M, H - 4.4, { align: 'right' });
    }
  }

  function qrFor(QR, o) {
    if (!QR) return null;
    try {
      var q = QR(0, 'M');
      q.addData(['STERMONT MALL - PAYMENT RECEIPT', 'Receipt: ' + receiptNo(o), 'Order: ' + (o.ref || ''), 'M-Pesa code: ' + code(o), 'Paid: ' + money(paidAmount(o)), 'Date: ' + when(o.handled_at || o.created_at), BIZ.web].join('\n'));
      q.make(); return q;
    } catch (e) { return null; }
  }

  function build(o, logo, sig, stamp, QR) {
    return loadLib().then(function (JsPDF) {
      var d = new JsPDF({ unit: 'mm', format: 'a4' }), full = balance(o) === 0;
      d.setProperties({ title: 'Receipt ' + receiptNo(o), subject: 'M-Pesa ' + code(o), author: BIZ.name });
      watermark(d);
      header(d, logo, o, full);
      var y = hero(d, o, qrFor(QR, o), 51) + 3;
      y = codeTicket(d, o, y) + 4;
      y = infoCards(d, o, y) + 4;
      y = timeline(d, o, y) + 3;
      y = itemsTable(d, o, y) + 5;
      if (y + 35 > FOOT) { newPage(d); y = 18; }
      y = totals(d, o, y) + 6;
      if (y + 36 > FOOT) { newPage(d); y = 18; }
      signatures(d, y, sig, stamp);
      footers(d, o);
      return d;
    });
  }

  function pdf(o) {
    try { needCode(o); } catch (e) { return Promise.reject(e); }
    return Promise.all([loadImg(BIZ.logo), loadImg(BIZ.signature), loadImg(BIZ.stamp), loadQR()]).then(function (im) {
      return build(o, im[0], im[1], im[2], im[3]);
    }).then(function (doc) { doc.save('Receipt-' + String(o.ref || 'order').replace(/[^\w-]+/g, '') + '.pdf'); });
  }

  function lines(o) {
    return (o.items || []).map(function (i, k) { return (k + 1) + '. ' + i.name + ' x' + i.qty + ' = ' + money(i.total); });
  }

  function text(o) {
    var bal = balance(o);
    return ['*' + BIZ.name.toUpperCase() + ' | PAYMENT RECEIPT*', '',
      '\uD83E\uDDFE Receipt no: ' + receiptNo(o), '\uD83D\uDCE6 Order: ' + o.ref, '\uD83D\uDCC5 Date: ' + when(o.handled_at || o.created_at), '',
      '*Items*', lines(o).join('\n'), '',
      '*Total paid: ' + money(paidAmount(o)) + '*',
      '*M-Pesa code: ' + (code(o) || '-') + '*',
      'Paybill ' + BIZ.paybill + ', account ' + BIZ.account,
      bal > 0 ? 'Balance due: ' + money(bal) : 'Balance due: KSh 0', '',
      '\uD83D\uDC64 ' + (o.customer_name || ''),
      o.method === 'delivery' ? '\uD83D\uDE9A Delivery to: ' + [o.address, o.county].filter(Boolean).join(', ') : '\uD83C\uDFEC Store pickup', '',
      bal > 0 ? '\u26A0\uFE0F PART PAYMENT received.' : '\u2705 PAID IN FULL. Thank you for shopping with ' + BIZ.name + '!',
      BIZ.phone + ' | ' + BIZ.web].join('\n');
  }

  function email(o) {
    try { needCode(o); } catch (e) { return Promise.reject(e); }
    if (!EMAILJS.serviceId || !EMAILJS.templateId || !EMAILJS.publicKey) return Promise.reject(new Error('Email is not set up yet'));
    if (!o.email) return Promise.reject(new Error('This order has no customer email.'));
    var params = {
      to_email: o.email, to_name: o.customer_name || 'Customer', business: BIZ.name, phone: BIZ.phone, receipt_no: receiptNo(o), order_ref: o.ref,
      date: when(o.handled_at || o.created_at), items: lines(o).join('\n'), total: money(paidAmount(o)), subtotal: money(o.subtotal), balance: money(balance(o)),
      paybill: BIZ.paybill, account: BIZ.account, pay_code: code(o), amount_words: words(paidAmount(o)),
      delivery: o.method === 'delivery' ? [o.address, o.county].filter(Boolean).join(', ') : 'Store pickup'
    };
    return fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service_id: EMAILJS.serviceId, template_id: EMAILJS.templateId, user_id: EMAILJS.publicKey, template_params: params })
    }).then(function (r) { if (!r.ok) return r.text().then(function (t) { throw new Error('EmailJS: ' + (t || r.status)); }); });
  }

  window.STM_RECEIPT = { pdf: pdf, email: email, text: text };
})();
