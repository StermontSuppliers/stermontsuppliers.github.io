/* Stermont Mall receipts: PDF download, email and WhatsApp text.
   Shared by account.html and admin.html. */
(function () {
  var BIZ = {
    name: 'Stermont Mall',
    site: 'stermontmall.github.io',
    phone: '+254 748 888 230',
    paybill: '717777',
    account: '0748888230'
  };
  /* EmailJS (emailjs.com, free plan). Fill these three in to switch emailing on. */
  var EMAILJS = { serviceId: '', templateId: '', publicKey: '' };

  function money(n) { return 'KSh ' + Number(n || 0).toLocaleString('en-KE'); }
  function when(o) { try { return new Date(o.handled_at || o.created_at || Date.now()).toLocaleString('en-KE'); } catch (e) { return ''; } }
  function no(o) { return 'RCP-' + String(o.ref || '').replace(/^STM-/, ''); }
  function itemsText(o) {
    return (o.items || []).map(function (i) { return i.qty + ' x ' + i.name + ' - ' + money(i.total); }).join('\n');
  }

  function text(o) {
    return ['*' + BIZ.name + ' - Payment receipt*', 'Receipt: ' + no(o), 'Order: ' + o.ref, 'Date: ' + when(o), '',
      itemsText(o), '', '*Total paid: ' + money(o.subtotal) + '*', 'Paid via M-Pesa Paybill ' + BIZ.paybill, '',
      'Thank you for shopping with us!'].join('\n');
  }

  function loadPdf() {
    return new Promise(function (res, rej) {
      if (window.jspdf) return res(window.jspdf.jsPDF);
      var s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      s.onload = function () { res(window.jspdf.jsPDF); };
      s.onerror = function () { rej(new Error('Could not load the PDF tool. Check your connection.')); };
      document.head.appendChild(s);
    });
  }

  function pdf(o) {
    return loadPdf().then(function (JsPDF) {
      var d = new JsPDF({ unit: 'mm', format: 'a4' }), W = 210, L = 18, R = W - 18, y = 22;
      d.setFillColor(124, 58, 237); d.rect(0, 0, W, 34, 'F');
      d.setTextColor(255, 255, 255); d.setFont('helvetica', 'bold'); d.setFontSize(22); d.text(BIZ.name, L, 16);
      d.setFontSize(10); d.setFont('helvetica', 'normal'); d.text(BIZ.site + '   |   ' + BIZ.phone, L, 24);
      d.setFontSize(16); d.setFont('helvetica', 'bold'); d.text('PAYMENT RECEIPT', R, 16, { align: 'right' });
      y = 48; d.setTextColor(30, 30, 40);
      function kv(k, v) { d.setFont('helvetica', 'bold'); d.setFontSize(10); d.text(k, L, y); d.setFont('helvetica', 'normal'); d.text(String(v || '-'), L + 38, y); y += 7; }
      kv('Receipt no.', no(o)); kv('Order ref.', o.ref); kv('Date', when(o));
      kv('Customer', o.customer_name); if (o.phone) kv('Phone', o.phone); if (o.email) kv('Email', o.email);
      if (o.method === 'delivery' && o.address) kv('Delivery to', o.address + (o.county ? ', ' + o.county : ''));
      y += 4; d.setDrawColor(210, 210, 220); d.line(L, y, R, y); y += 8;
      d.setFont('helvetica', 'bold'); d.text('Item', L, y); d.text('Qty', 125, y, { align: 'right' }); d.text('Unit price', 152, y, { align: 'right' }); d.text('Total', R, y, { align: 'right' });
      y += 3; d.line(L, y, R, y); y += 7; d.setFont('helvetica', 'normal');
      (o.items || []).forEach(function (i) {
        var lines = d.splitTextToSize(String(i.name), 90);
        d.text(lines, L, y); d.text(String(i.qty), 125, y, { align: 'right' }); d.text(money(i.price), 152, y, { align: 'right' }); d.text(money(i.total), R, y, { align: 'right' });
        y += 6 * lines.length + 2;
        if (y > 250) { d.addPage(); y = 20; }
      });
      d.line(L, y, R, y); y += 9;
      d.setFont('helvetica', 'bold'); d.setFontSize(13); d.text('Total paid', L, y); d.text(money(o.subtotal), R, y, { align: 'right' });
      y += 12; d.setFontSize(10); d.setFont('helvetica', 'normal');
      d.text('Paid via M-Pesa Paybill ' + BIZ.paybill + ', account ' + BIZ.account, L, y); y += 14;
      d.setDrawColor(34, 139, 34); d.setTextColor(34, 139, 34); d.setLineWidth(0.8); d.roundedRect(L, y - 7, 46, 12, 2, 2);
      d.setFont('helvetica', 'bold'); d.setFontSize(13); d.text('PAID IN FULL', L + 23, y + 1, { align: 'center' });
      d.setTextColor(120, 120, 130); d.setFont('helvetica', 'normal'); d.setFontSize(9);
      d.text('Delivery fee, if any, is confirmed separately on WhatsApp. Thank you for shopping with ' + BIZ.name + '.', L, 280);
      d.save('Receipt-' + o.ref + '.pdf');
    });
  }

  function email(o) {
    if (!o.email) return Promise.reject(new Error('This order has no email address.'));
    if (!EMAILJS.serviceId || !EMAILJS.templateId || !EMAILJS.publicKey) return Promise.reject(new Error('Email is not set up yet (add the EmailJS keys in receipt.js).'));
    return fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: EMAILJS.serviceId, template_id: EMAILJS.templateId, user_id: EMAILJS.publicKey,
        template_params: {
          to_email: o.email, to_name: o.customer_name || 'Customer', business: BIZ.name, receipt_no: no(o), order_ref: o.ref,
          date: when(o), items: itemsText(o), total: money(o.subtotal), paybill: BIZ.paybill, account: BIZ.account, phone: BIZ.phone
        }
      })
    }).then(function (r) { if (!r.ok) throw new Error('Email service refused the request (' + r.status + ').'); });
  }

  window.STM_RECEIPT = { pdf: pdf, email: email, text: text };
})();
