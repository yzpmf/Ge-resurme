/* Access QR codes always use the same destination as the project link. */
(function () {
  'use strict';
  window.renderProjectAccess = function () {
    document.querySelectorAll('.project-access').forEach(function (box) {
      const link = box.querySelector('a');
      const code = box.querySelector('.project-access-code');
      if (!link || !code || !window.qrcode) return;
      if (!link.getAttribute('href') || link.getAttribute('href') === '#') return;
      try {
        const destination = new URL(link.href);
        if (!['http:', 'https:'].includes(destination.protocol)) return;
        const qr = window.qrcode(0, 'M');
        qr.addData(destination.href);
        qr.make();
        code.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 16, scalable: true });
        code.setAttribute('role', 'img');
        code.setAttribute('aria-label', '项目网页版访问二维码');
        box.hidden = false;
      } catch (_) { /* The normal project link remains available if QR generation fails. */ }
    });
  };
  window.renderProjectAccess();
})();
