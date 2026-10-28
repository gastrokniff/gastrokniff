/* Gastrokniff: Service Worker registrieren + dezenter Hinweis „App installieren“.
   Gemerkt wird nur, ob der Hinweis geschlossen wurde (localStorage, kein Cookie). */
(function () {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () {});
    });
  }

  var KEY = 'gk-install-hidden';
  var standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  if (standalone || read()) return;

  var lang = (document.documentElement.lang || 'de').slice(0, 2);
  var T = {
    de: { t: 'Gastrokniff als App', a: 'Rechner direkt vom Startbildschirm öffnen – auch offline.', b: 'Installieren',
          i: 'Tippe unten auf <b>Teilen</b> {s} und dann auf <b>„Zum Home-Bildschirm“</b>.', x: 'Hinweis schließen' },
    it: { t: 'Gastrokniff come app', a: 'Apri i calcolatori dalla schermata Home, anche offline.', b: 'Installa',
          i: 'Tocca <b>Condividi</b> {s} e poi <b>«Aggiungi alla schermata Home»</b>.', x: 'Chiudi' },
    en: { t: 'Gastrokniff as an app', a: 'Open the calculators from your home screen, even offline.', b: 'Install',
          i: 'Tap <b>Share</b> {s}, then <b>“Add to Home Screen”</b>.', x: 'Close' },
    tr: { t: 'Uygulama olarak Gastrokniff', a: 'Hesaplayıcıları ana ekrandan aç, çevrimdışı da çalışır.', b: 'Yükle',
          i: '<b>Paylaş</b> {s} simgesine, sonra <b>“Ana Ekrana Ekle”</b> seçeneğine dokun.', x: 'Kapat' }
  }[lang] || null;
  if (!T) return;

  var ios = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var deferred = null, box = null;

  window.addEventListener('beforeinstallprompt', function (e) {
    if (ios) return; // auf iOS gibt es nur den Weg über „Teilen“
    e.preventDefault();
    deferred = e;
    show(false);
  });
  window.addEventListener('appinstalled', function () { remember(); hide(); });
  if (ios) setTimeout(function () { show(true); }, 2500);

  function show(isIos) {
    if (box || read()) return;
    var share = '<svg width="15" height="18" viewBox="0 0 15 18" aria-hidden="true" style="vertical-align:-3px">' +
      '<path d="M7.5 1v10M3.5 5l4-4 4 4M1.5 8.5v8h12v-8" fill="none" stroke="currentColor" stroke-width="1.6" ' +
      'stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var css = document.createElement('style');
    css.textContent =
      '.gk-install{position:fixed;z-index:200;left:16px;right:16px;bottom:calc(16px + env(safe-area-inset-bottom));' +
      'max-width:400px;margin-left:auto;display:flex;gap:14px;align-items:flex-start;padding:16px 18px;font-size:14px;' +
      'opacity:0;transform:translateY(12px);transition:opacity .3s,transform .3s}' +
      '.gk-install.on{opacity:1;transform:none}' +
      '.gk-install img{width:40px;height:40px;flex:none;border-radius:10px}' +
      '.gk-install .tx{flex:1;color:var(--text-body);line-height:1.45}' +
      '.gk-install .tx strong{display:block;color:var(--text-strong);font-family:var(--font-heading);font-size:15px;margin-bottom:2px}' +
      '.gk-install .tx b{color:var(--text-strong)}' +
      '.gk-install .btn{padding:9px 16px;font-size:14px;margin-top:10px;border:0;cursor:pointer;font-family:inherit}' +
      '.gk-install .x{flex:none;background:none;border:0;color:var(--text-muted);font-size:22px;line-height:1;' +
      'cursor:pointer;padding:0 2px;margin:-4px -4px 0 0}' +
      '.gk-install .x:hover{color:var(--text-strong)}' +
      '@media (prefers-reduced-motion:reduce){.gk-install{transition:none}}';
    document.head.appendChild(css);

    box = document.createElement('div');
    box.className = 'card gk-install';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', T.t);
    box.innerHTML = '<img src="/icon-192.png" alt="">' +
      '<div class="tx"><strong>' + T.t + '</strong>' +
      (isIos ? T.i.replace('{s}', share) : T.a + '<br><button type="button" class="btn">' + T.b + '</button>') +
      '</div><button type="button" class="x" aria-label="' + T.x + '">×</button>';
    document.body.appendChild(box);
    requestAnimationFrame(function () { box.classList.add('on'); });

    box.querySelector('.x').addEventListener('click', function () { remember(); hide(); });
    var btn = box.querySelector('.btn');
    if (btn) btn.addEventListener('click', function () {
      if (!deferred) return;
      deferred.prompt();
      // Auch bei „Abbrechen“ merken: wer Nein sagt, soll nicht auf jeder Seite neu gefragt werden
      deferred.userChoice.then(function () { remember(); hide(); });
      deferred = null;
    });
  }

  function hide() { if (box) { box.remove(); box = null; } }
  function read() { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } }
  function remember() { try { localStorage.setItem(KEY, '1'); } catch (e) {} }
})();
