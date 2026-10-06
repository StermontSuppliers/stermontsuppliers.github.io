/* Stermont Mall receipts: PDF, email (EmailJS) and WhatsApp text.
   Public API (unchanged): STM_RECEIPT.pdf(order), .email(order), .text(order)
   A receipt is only produced for orders that have an M-Pesa payment code (order.pay_code). */
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

  var C = { purple: [124, 58, 237], navy: [42, 14, 92], lime: [200, 243, 29], green: [21, 128, 61], ink: [40, 40, 40], mute: [107, 107, 107], line: [227, 227, 227], tint: [245, 240, 255] };

  function money(n) { return 'KSh ' + Number(n || 0).toLocaleString('en-KE'); }
  function when(d) {
    try { return new Date(d).toLocaleString('en-KE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; }
  }
  function receiptNo(o) { return 'RCP-' + String(o.ref || '').replace(/^STM-/, ''); }  // same numbering as your earlier receipts
  function needCode(o) {
    if (!o || !o.pay_code) throw new Error('This order has no M-Pesa payment code yet, so no receipt can be issued.');
  }
  function paidAmount(o) { return o.pay_amount != null && o.pay_amount !== '' ? Number(o.pay_amount) : Number(o.subtotal || 0); }

  /* ---------- loaders ---------- */
  var libP = null;
  function loadLib() {
    if (window.jspdf && window.jspdf.jsPDF) return Promise.resolve(window.jspdf.jsPDF);
    if (libP) return libP;
    libP = new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      s.onload = function () { res(window.jspdf.jsPDF); };
      s.onerror = function () { libP = null; rej(new Error('Could not load the PDF tool. Check your internet connection.')); };
      document.head.appendChild(s);
    });
    return libP;
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
  function rgb(doc, kind, c) { doc[kind](c[0], c[1], c[2]); }
  function fit(img, maxW, maxH) { var r = Math.min(maxW / img.w, maxH / img.h); return { w: img.w * r, h: img.h * r }; }

  function rotRect(doc, cx, cy, w, h, deg) {   // outlined rectangle rotated about its centre
    var a = deg * Math.PI / 180, cos = Math.cos(a), sin = Math.sin(a);
    var pts = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]].map(function (p) {
      return [cx + p[0] * cos + p[1] * sin, cy - p[0] * sin + p[1] * cos];
    });
    for (var i = 0; i < 4; i++) { var p = pts[i], q = pts[(i + 1) % 4]; doc.line(p[0], p[1], q[0], q[1]); }
  }

  function paidStamp(doc, cx, cy) {
    var g = new doc.GState({ opacity: 0.8 });
    doc.saveGraphicsState(); doc.setGState(g);
    rgb(doc, 'setDrawColor', C.green); rgb(doc, 'setTextColor', C.green);
    doc.setLineWidth(1.2); rotRect(doc, cx, cy, 58, 20, 14);
    doc.setLineWidth(0.4); rotRect(doc, cx, cy, 55, 17, 14);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(21);
    doc.text('PAID', cx, cy + 1.2, { align: 'center', angle: 14 });
    doc.setFontSize(8.5); doc.text('IN FULL', cx + 1.2, cy + 7, { align: 'center', angle: 14 });
    doc.restoreGraphicsState();
  }

  function header(doc, logo, o, W) {
    rgb(doc, 'setFillColor', C.purple); doc.rect(0, 0, W, 5, 'F');
    rgb(doc, 'setFillColor', C.lime); doc.rect(0, 5, W, 1.2, 'F');
    var x = 15, y = 13;
    if (logo) {
      var s = fit(logo, 52, 20); doc.addImage(logo.data, 'PNG', x, y, s.w, s.h);
    } else {   // wordmark fallback: Stermont [Mall]
      doc.setFont('helvetica', 'bold'); doc.setFontSize(24); rgb(doc, 'setTextColor', C.navy); doc.text('Stermont', x, y + 12);
      var tw = doc.getTextWidth('Stermont'); rgb(doc, 'setFillColor', C.lime); doc.roundedRect(x + tw + 1.5, y + 3.6, 22, 10, 1.2, 1.2, 'F');
      rgb(doc, 'setTextColor', [18, 18, 18]); doc.text('Mall', x + tw + 3.2, y + 12);
    }
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.2); rgb(doc, 'setTextColor', C.mute);
    doc.text(BIZ.place + '  |  ' + BIZ.phone, x, y + 25);
    doc.text(BIZ.email + '  |  ' + BIZ.web, x, y + 29.2);

    doc.setFont('helvetica', 'bold'); doc.setFontSize(21); rgb(doc, 'setTextColor', C.navy);
    doc.text('PAYMENT RECEIPT', W - 15, y + 7, { align: 'right' });
    doc.setFontSize(9.5); rgb(doc, 'setTextColor', C.ink);
    doc.setFont('helvetica', 'normal'); doc.text('Receipt no.', W - 15 - 46, y + 15);
    doc.setFont('helvetica', 'bold'); doc.text(receiptNo(o), W - 15, y + 15, { align: 'right' });
    doc.setFont('helvetica', 'normal'); doc.text('Date issued', W - 15 - 46, y + 21);
    doc.setFont('helvetica', 'bold'); doc.text(when(o.handled_at || o.created_at), W - 15, y + 21, { align: 'right' });
    rgb(doc, 'setDrawColor', C.line); doc.setLineWidth(0.4); doc.line(15, 46, W - 15, 46);
  }

  function infoBlocks(doc, o, W) {
    var y = 53, colW = (W - 30 - 8) / 2;
    function box(x, title) {
      rgb(doc, 'setFillColor', C.tint); doc.roundedRect(x, y, colW, 41, 2, 2, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8); rgb(doc, 'setTextColor', C.purple); doc.text(title, x + 4, y + 6);
    }
    function row(x, yy, k, v, bold) {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.6); rgb(doc, 'setTextColor', C.mute); doc.text(k, x + 4, yy);
      doc.setFont('helvetica', bold ? 'bold' : 'normal'); rgb(doc, 'setTextColor', C.ink);
      var t = doc.splitTextToSize(String(v || '-'), colW - 34); doc.text(t[0] + (t.length > 1 ? '...' : ''), x + 30, yy);
    }
    box(15, 'RECEIVED FROM');
    row(15, y + 13, 'Customer', o.customer_name, true);
    row(15, y + 19.5, 'Phone', o.phone);
    row(15, y + 26, 'Email', o.email);
    row(15, y + 32.5, o.method === 'delivery' ? 'Delivery' : 'Collection', o.method === 'delivery' ? [o.address, o.county].filter(Boolean).join(', ') : 'Pickup at the store');

    var x2 = 15 + colW + 8;
    box(x2, 'PAYMENT DETAILS');
    row(x2, y + 13, 'Order ref', o.ref, true);
    row(x2, y + 19.5, 'Method', 'M-Pesa Paybill ' + BIZ.paybill);
    row(x2, y + 26, 'Account', BIZ.account);
    row(x2, y + 32.5, 'Order date', when(o.created_at));
    return y + 41;
  }

  function codeBanner(doc, o, y, W) {
    rgb(doc, 'setFillColor', C.navy); doc.roundedRect(15, y + 5, W - 30, 13, 2, 2, 'F');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); rgb(doc, 'setTextColor', [220, 210, 245]);
    doc.text('M-PESA TRANSACTION CODE', 20, y + 13.2);
    doc.setFont('courier', 'bold'); doc.setFontSize(15); rgb(doc, 'setTextColor', C.lime);
    doc.text(String(o.pay_code).toUpperCase(), W / 2 + 4, y + 13.6, { align: 'center' });
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); rgb(doc, 'setTextColor', [255, 255, 255]);
    doc.text(money(paidAmount(o)), W - 20, y + 13.2, { align: 'right' });
    return y + 18;
  }

  function tableHead(doc, y, W) {
    rgb(doc, 'setFillColor', C.purple); doc.rect(15, y, W - 30, 8, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8.6); rgb(doc, 'setTextColor', [255, 255, 255]);
    doc.text('#', 18, y + 5.4); doc.text('DESCRIPTION', 27, y + 5.4);
    doc.text('QTY', W - 78, y + 5.4, { align: 'right' }); doc.text('UNIT PRICE', W - 46, y + 5.4, { align: 'right' }); doc.text('AMOUNT', W - 18, y + 5.4, { align: 'right' });
    return y + 8;
  }

  function build(o, logo, sig, stamp) {
    return loadLib().then(function (JsPDF) {
      var doc = new JsPDF({ unit: 'mm', format: 'a4' }), W = 210, H = 297;
      doc.setProperties({ title: 'Receipt ' + receiptNo(o), author: BIZ.name });
      header(doc, logo, o, W);
      var y = infoBlocks(doc, o, W);
      y = codeBanner(doc, o, y, W) + 6;

      y = tableHead(doc, y, W);
      var items = o.items || [];
      items.forEach(function (it, i) {
        var lines = doc.splitTextToSize(String(it.name || ''), W - 27 - 82);
        var rh = Math.max(8, lines.length * 4.4 + 3.6);
        if (y + rh > H - 150) {  // leave room for totals + signatures; otherwise new page
          doc.addPage(); y = tableHead(doc, 15, W);
        }
        if (i % 2 === 1) { rgb(doc, 'setFillColor', [250, 248, 255]); doc.rect(15, y, W - 30, rh, 'F'); }
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9); rgb(doc, 'setTextColor', C.ink);
        doc.text(String(i + 1), 18, y + 5.4); doc.text(lines, 27, y + 5.4);
        var qty = Number(it.qty || 1), unit = it.price != null ? Number(it.price) : (Number(it.total || 0) / qty);
        doc.text(String(qty), W - 78, y + 5.4, { align: 'right' });
        doc.text(Number(unit).toLocaleString('en-KE'), W - 46, y + 5.4, { align: 'right' });
        doc.setFont('helvetica', 'bold'); doc.text(Number(it.total || 0).toLocaleString('en-KE'), W - 18, y + 5.4, { align: 'right' });
        rgb(doc, 'setDrawColor', C.line); doc.setLineWidth(0.2); doc.line(15, y + rh, W - 15, y + rh);
        y += rh;
      });

      /* totals */
      if (y > H - 135) { doc.addPage(); y = 20; }
      y += 6;
      var t0 = y, tx = W - 15 - 78;
      function trow(k, v, strong, shade) {
        if (shade) { rgb(doc, 'setFillColor', shade); doc.roundedRect(tx - 2, y - 5, 80, 9, 1.5, 1.5, 'F'); }
        doc.setFont('helvetica', strong ? 'bold' : 'normal'); doc.setFontSize(strong ? 11 : 9.5);
        rgb(doc, 'setTextColor', strong && shade ? [255, 255, 255] : C.ink);
        doc.text(k, tx, y); doc.text(v, W - 17, y, { align: 'right' }); y += strong ? 10 : 7;
      }
      trow('Subtotal', money(o.subtotal));
      trow('Amount paid (M-Pesa)', money(paidAmount(o)));
      trow('BALANCE DUE', money(Math.max(0, Number(o.subtotal || 0) - paidAmount(o))), true, C.navy);
      doc.setFont('helvetica', 'italic'); doc.setFontSize(8); rgb(doc, 'setTextColor', C.mute);
      doc.text('Delivery fee, if any, is confirmed separately.', 15, t0 + 22);

      paidStamp(doc, 52, t0 + 7);

      /* signatures: three roomy blocks */
      var sy = Math.max(y + 8, 196), bw = (W - 30 - 12) / 3;
      rgb(doc, 'setDrawColor', C.purple); doc.setLineWidth(0.5); doc.line(15, sy, W - 15, sy);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9); rgb(doc, 'setTextColor', C.navy);
      doc.text('AUTHORISATION', 15, sy + 6);

      function sigBlock(x, title, img, name) {
        var top = sy + 10, boxH = 34;
        rgb(doc, 'setDrawColor', C.line); doc.setLineWidth(0.3); doc.roundedRect(x, top, bw, boxH, 2, 2);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(8); rgb(doc, 'setTextColor', C.purple); doc.text(title, x + 3, top + 5);
        if (img) { var s = fit(img, bw - 10, 18); doc.addImage(img.data, 'PNG', x + (bw - s.w) / 2, top + 7, s.w, s.h); }
        rgb(doc, 'setDrawColor', C.mute); doc.setLineWidth(0.3); doc.line(x + 4, top + boxH - 4, x + bw - 4, top + boxH - 4);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); rgb(doc, 'setTextColor', C.mute); doc.text('Signature', x + 4, top + boxH - 1);
        // name / date lines under the box
        var ly = top + boxH + 9;
        doc.setFontSize(8); doc.text('Name:', x, ly); doc.line(x + 12, ly + 0.8, x + bw, ly + 0.8);
        if (name) { doc.setTextColor(C.ink[0], C.ink[1], C.ink[2]); doc.setFont('helvetica', 'bold'); doc.text(name, x + 13, ly - 0.4); doc.setFont('helvetica', 'normal'); rgb(doc, 'setTextColor', C.mute); }
        doc.text('Title:', x, ly + 9); doc.line(x + 12, ly + 9.8, x + bw, ly + 9.8);
        doc.text('Date:', x, ly + 18); doc.line(x + 12, ly + 18.8, x + bw, ly + 18.8);
      }
      sigBlock(15, 'AUTHORISED SIGNATORY', sig, BIZ.signatory);
      sigBlock(15 + bw + 6, 'RECEIVED BY (CUSTOMER)', null, '');

      var sx = 15 + (bw + 6) * 2, top = sy + 10;   // company stamp
      rgb(doc, 'setDrawColor', C.line); doc.setLineWidth(0.3); doc.roundedRect(sx, top, bw, 34, 2, 2);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8); rgb(doc, 'setTextColor', C.purple); doc.text('COMPANY STAMP', sx + 3, top + 5);
      if (stamp) { var ss = fit(stamp, bw - 8, 26); doc.addImage(stamp.data, 'PNG', sx + (bw - ss.w) / 2, top + 7, ss.w, ss.h); }
      else { doc.setDrawColor(210, 205, 225); doc.setLineDashPattern([1.5, 1.5], 0); doc.circle(sx + bw / 2, top + 20, 12); doc.setLineDashPattern([], 0); }
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); rgb(doc, 'setTextColor', C.mute);
      doc.text('Official stamp', sx + bw / 2, top + 31, { align: 'center' });

      /* footer on every page */
      var n = doc.getNumberOfPages();
      for (var p = 1; p <= n; p++) {
        doc.setPage(p);
        rgb(doc, 'setFillColor', C.purple); doc.rect(0, H - 13, W, 13, 'F');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(9); rgb(doc, 'setTextColor', [255, 255, 255]);
        doc.text('Thank you for shopping with ' + BIZ.name + '!', 15, H - 6.2);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5);
        doc.text(BIZ.phone + '  |  ' + BIZ.email + (n > 1 ? '  |  Page ' + p + ' of ' + n : ''), W - 15, H - 6.2, { align: 'right' });
        doc.setFontSize(7); rgb(doc, 'setTextColor', C.mute);
        doc.text('This receipt is valid with the M-Pesa transaction code above. Goods once sold are subject to our returns policy.', W / 2, H - 16, { align: 'center' });
      }
      return doc;
    });
  }

  function pdf(o) {
    try { needCode(o); } catch (e) { return Promise.reject(e); }
    return Promise.all([loadImg(BIZ.logo), loadImg(BIZ.signature), loadImg(BIZ.stamp)]).then(function (im) {
      return build(o, im[0], im[1], im[2]);
    }).then(function (doc) { doc.save('Receipt-' + String(o.ref || 'order').replace(/[^\w-]+/g, '') + '.pdf'); });
  }

  function lines(o) {
    return (o.items || []).map(function (i, k) { return (k + 1) + '. ' + i.name + ' x' + i.qty + ' = ' + money(i.total); });
  }

  function text(o) {
    return ['*' + BIZ.name + ' - PAYMENT RECEIPT*', '',
      'Receipt no: ' + receiptNo(o), 'Order: ' + o.ref, 'Date: ' + when(o.handled_at || o.created_at), '',
      lines(o).join('\n'), '',
      '*Total paid: ' + money(paidAmount(o)) + '*',
      'M-Pesa code: ' + (o.pay_code || '-'),
      'Paybill ' + BIZ.paybill + ', account ' + BIZ.account, '',
      'Customer: ' + (o.customer_name || ''), '',
      'PAID IN FULL. Thank you for shopping with ' + BIZ.name + '!', BIZ.phone].join('\n');
  }

  function email(o) {
    try { needCode(o); } catch (e) { return Promise.reject(e); }
    if (!EMAILJS.serviceId || !EMAILJS.templateId || !EMAILJS.publicKey) return Promise.reject(new Error('Email is not set up yet'));
    if (!o.email) return Promise.reject(new Error('This order has no customer email.'));
    var params = {
      to_email: o.email, to_name: o.customer_name || 'Customer', business: BIZ.name, phone: BIZ.phone, receipt_no: receiptNo(o), order_ref: o.ref,
      date: when(o.handled_at || o.created_at), items: lines(o).join('\n'), total: money(paidAmount(o)),
      paybill: BIZ.paybill, account: BIZ.account, pay_code: String(o.pay_code).toUpperCase()
    };
    return fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service_id: EMAILJS.serviceId, template_id: EMAILJS.templateId, user_id: EMAILJS.publicKey, template_params: params })
    }).then(function (r) { if (!r.ok) return r.text().then(function (t) { throw new Error('EmailJS: ' + (t || r.status)); }); });
  }

  window.STM_RECEIPT = { pdf: pdf, email: email, text: text };
})();
