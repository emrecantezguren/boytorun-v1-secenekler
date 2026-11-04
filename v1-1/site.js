/* v1-1 · V1 şablonu + V1 Alternatif içeriği — site davranışları (saf JS) */
(() => {
  'use strict';
  const d = document, b = d.body;
  const az = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* üst menü: kaydırınca dolu zemin */
  const ust = d.querySelector('[data-ust]');
  const duzBas = !!d.querySelector('.perde.duz');
  const kaydir = () => { if (ust) ust.classList.toggle('dolu', duzBas || scrollY > 30); };
  addEventListener('scroll', kaydir, { passive: true }); kaydir();

  /* telefon menüsü */
  const md = d.querySelector('.menu-dugme'), mp = d.getElementById('menu');
  const menu = (ac) => {
    b.classList.toggle('menu-acik', ac); b.classList.toggle('kilit', ac);
    md.setAttribute('aria-expanded', ac ? 'true' : 'false'); md.setAttribute('aria-label', ac ? 'Close menu' : 'Open menu');
    if (ac) { const a = mp.querySelector('a'); if (a) setTimeout(() => a.focus(), 60); }
  };
  if (md && mp) {
    md.addEventListener('click', () => menu(!b.classList.contains('menu-acik')));
    d.addEventListener('keydown', (ev) => { if (ev.key === 'Escape' && b.classList.contains('menu-acik')) { menu(false); md.focus(); } });
    mp.addEventListener('click', (ev) => { if (ev.target.closest('a')) menu(false); });
    matchMedia('(min-width:1100px)').addEventListener('change', (m) => { if (m.matches) menu(false); });
  }

  /* kısa bildirim */
  let bt;
  const bildir = (metin) => {
    let el = d.querySelector('.bildirim');
    if (!el) { el = d.createElement('div'); el.className = 'bildirim'; el.setAttribute('role', 'status'); b.appendChild(el); }
    el.textContent = metin; el.hidden = false; clearTimeout(bt); bt = setTimeout(() => { el.hidden = true; }, 3200);
  };
  d.querySelectorAll('[data-tr]').forEach((a) => a.addEventListener('click', (ev) => {
    ev.preventDefault(); bildir('Türkçe sürüm yayında eklenecek · Turkish version will be available at launch.');
  }));

  /* çerez bildirimi */
  const cz = d.querySelector('.cerez');
  if (cz) {
    let kayit = null;
    try { kayit = localStorage.getItem('boytorun-v1k-cerez'); } catch (e) { kayit = null; }
    if (!kayit) cz.hidden = false;
    cz.querySelectorAll('[data-cerez]').forEach((btn) => btn.addEventListener('click', () => {
      try { localStorage.setItem('boytorun-v1k-cerez', btn.dataset.cerez); } catch (e) { /* depolama kapalı */ }
      cz.hidden = true;
    }));
  }

  /* masaüstü "İletişime geçin" düğmesi: giriş, sayfa başı, çağrı bandı ve alt bilgi görünürken gizli — içeriği örtmesin */
  const hap = d.querySelector('.hap');
  if (hap && 'IntersectionObserver' in window) {
    const gorunen = new Set();
    const io2 = new IntersectionObserver((es) => {
      es.forEach((en) => { if (en.isIntersecting) gorunen.add(en.target); else gorunen.delete(en.target); });
      b.classList.toggle('hap-gizli', gorunen.size > 0);
    }, { rootMargin: '0px 0px -24px 0px' });
    d.querySelectorAll('[data-slayt], .perde, .kapak, .cagri, .alt, .sonraki').forEach((x) => io2.observe(x));
  }

  /* giriş slaytı: crossfade + Ken Burns; azaltılmış harekette sabit */
  const gs = d.querySelector('[data-slayt]');
  if (gs) {
    const sl = [...gs.querySelectorAll('.slayt')], n = sl.length, SURE = 6000;
    const adEl = gs.querySelector('.sayac [data-ad]'), metaEl = gs.querySelector('.sayac [data-meta]');
    const link = gs.querySelector('.sayac [data-href]'), dur = gs.querySelector('[data-dur]');
    const cz2 = [...gs.querySelectorAll('.cizgiler i')];
    let i = 0, zam = null, durdu = az;
    const cizgi = () => cz2.forEach((c, j) => {
      c.classList.remove('simdi'); c.classList.toggle('tamam', j < i || (az && j === i));
      if (j === i && !az) { void c.offsetWidth; c.classList.add('simdi'); }
    });
    const yukle = (k) => {
      const im = sl[(k + n) % n].querySelector('img');
      if (im && im.dataset.src) { im.src = im.dataset.src; delete im.dataset.src; }
    };
    const goster = (k) => {
      const eski = sl[i]; i = (k + n) % n; const yeni = sl[i];
      if (eski !== yeni) {
        sl.forEach((s) => s.classList.remove('cikan'));
        eski.classList.remove('aktif'); eski.classList.add('cikan');
        setTimeout(() => { if (!eski.classList.contains('aktif')) eski.classList.remove('cikan'); }, 1700);
      }
      yeni.classList.add('aktif');
      sl.forEach((s, j) => s.setAttribute('aria-hidden', j === i ? 'false' : 'true'));
      adEl.textContent = yeni.dataset.ad; metaEl.textContent = yeni.dataset.meta; link.href = yeni.dataset.href;
      yukle(i); yukle(i + 1); yukle(i - 1);
      cizgi();
    };
    const planla = () => { clearTimeout(zam); if (!durdu) zam = setTimeout(() => { goster(i + 1); planla(); }, SURE); };
    const durum = (dd) => {
      durdu = dd; gs.classList.toggle('durdu', dd);
      dur.setAttribute('aria-pressed', dd ? 'true' : 'false'); dur.setAttribute('aria-label', dd ? 'Play slideshow' : 'Pause slideshow');
      cizgi(); planla();
    };
    gs.querySelector('[data-onceki]').addEventListener('click', () => { goster(i - 1); planla(); });
    gs.querySelector('[data-sonraki]').addEventListener('click', () => { goster(i + 1); planla(); });
    dur.addEventListener('click', () => durum(!durdu));
    d.addEventListener('visibilitychange', () => { if (d.hidden) clearTimeout(zam); else planla(); });
    let tx = null;
    gs.addEventListener('touchstart', (ev) => { tx = ev.touches[0].clientX; }, { passive: true });
    gs.addEventListener('touchend', (ev) => {
      if (tx === null) return; const dx = ev.changedTouches[0].clientX - tx; tx = null;
      if (Math.abs(dx) > 50) { goster(i + (dx < 0 ? 1 : -1)); planla(); }
    });
    sl.forEach((s, j) => s.setAttribute('aria-hidden', j === 0 ? 'false' : 'true'));
    yukle(1); durum(az);
  }

  /* kaydırmalı kart rayları */
  d.querySelectorAll('[data-ray]').forEach((k) => {
    const r = k.querySelector('.ray'), geri = k.querySelector('[data-geri]'), ileri = k.querySelector('[data-ileri]');
    const il = k.querySelector('.ray-ilerleme i');
    if (!r) return;
    const adim = () => { const c = r.querySelector('.kart'); return c ? c.getBoundingClientRect().width + 20 : r.clientWidth * .8; };
    const guncelle = () => {
      const max = r.scrollWidth - r.clientWidth;
      if (geri) geri.disabled = r.scrollLeft < 4;
      if (ileri) ileri.disabled = r.scrollLeft > max - 4;
      if (il) il.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, (r.clientWidth + r.scrollLeft) / r.scrollWidth) : 1) + ')';
    };
    const git = (y) => r.scrollBy({ left: y * adim(), behavior: az ? 'auto' : 'smooth' });
    if (geri) geri.addEventListener('click', () => git(-1));
    if (ileri) ileri.addEventListener('click', () => git(1));
    r.addEventListener('scroll', guncelle, { passive: true }); addEventListener('resize', guncelle); guncelle();
  });

  /* çalışmalar süzgeci (#ofis, #alan-<slug> adresleriyle de açılır) */
  const sz = d.querySelector('[data-suzgec]');
  if (sz) {
    const cipler = [...sz.querySelectorAll('.cip')], kartlar = [...d.querySelectorAll('.lkart[data-kat]')];
    const say = d.querySelector('[data-sayi]');
    const uygula = (c, yaz) => {
      cipler.forEach((x) => x.setAttribute('aria-pressed', x === c ? 'true' : 'false'));
      const set = c.dataset.f ? c.dataset.f.split('|') : null; let n = 0;
      kartlar.forEach((k) => { const gor = !set || set.includes(k.dataset.kat); k.hidden = !gor; if (gor) n++; });
      say.textContent = n;
      if (yaz) { try { history.replaceState(null, '', c.dataset.h ? '#' + c.dataset.h : location.pathname + location.search); } catch (e) { /* yok say */ } }
    };
    cipler.forEach((c) => c.addEventListener('click', () => uygula(c, true)));
    const ilk = () => { const h = decodeURIComponent(location.hash.slice(1)); const c = cipler.find((x) => x.dataset.h && x.dataset.h === h); if (c) uygula(c, false); };
    ilk(); addEventListener('hashchange', ilk);
  }

  /* galeri: basit tam ekran görüntüleyici (işaretleme sayfada, ikonlar aynı aileden) */
  const gal = [...d.querySelectorAll('[data-buyut]')], lb = d.querySelector('.lb');
  if (gal.length && lb) {
    const img = lb.querySelector('img'), ad = lb.querySelector('.lb-ad'), no = lb.querySelector('.lb-no');
    const kapatB = lb.querySelector('.lb-kapat');
    let i = 0, son = null;
    const git = (k) => {
      i = (k + gal.length) % gal.length; const a = gal[i], kucuk = a.querySelector('img');
      img.src = a.getAttribute('href'); img.alt = kucuk ? kucuk.alt : '';
      ad.textContent = kucuk ? kucuk.alt : ''; no.textContent = (i + 1) + ' of ' + gal.length;
    };
    const ac = (k) => { son = d.activeElement; git(k); lb.hidden = false; b.classList.add('kilit'); kapatB.focus(); };
    const kapat = () => { lb.hidden = true; b.classList.remove('kilit'); if (son) son.focus(); };
    gal.forEach((a, k) => a.addEventListener('click', (ev) => { ev.preventDefault(); ac(k); }));
    kapatB.addEventListener('click', kapat);
    lb.querySelector('.lb-geri').addEventListener('click', () => git(i - 1));
    lb.querySelector('.lb-ileri').addEventListener('click', () => git(i + 1));
    lb.addEventListener('click', (ev) => { if (ev.target === lb) kapat(); });
    d.addEventListener('keydown', (ev) => {
      if (lb.hidden) return;
      if (ev.key === 'Escape') kapat();
      else if (ev.key === 'ArrowLeft') git(i - 1);
      else if (ev.key === 'ArrowRight') git(i + 1);
      else if (ev.key === 'Tab') {
        const bt2 = [...lb.querySelectorAll('button')], ilk = bt2[0], sonB = bt2[bt2.length - 1];
        if (ev.shiftKey && d.activeElement === ilk) { ev.preventDefault(); sonB.focus(); }
        else if (!ev.shiftKey && d.activeElement === sonB) { ev.preventDefault(); ilk.focus(); }
      }
    });
    let tx = null;
    lb.addEventListener('touchstart', (ev) => { tx = ev.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', (ev) => {
      if (tx === null) return; const dx = ev.changedTouches[0].clientX - tx; tx = null;
      if (Math.abs(dx) > 40) git(i + (dx < 0 ? 1 : -1));
    });
  }

  /* kaydırınca belirme */
  const bel = d.querySelectorAll('.belir');
  if (az || !('IntersectionObserver' in window)) bel.forEach((x) => x.classList.add('gorundu'));
  else {
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('gorundu'); io.unobserve(en.target); } }),
      { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    bel.forEach((x) => io.observe(x));
  }
})();
