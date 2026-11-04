/* kurumsal-1 · "Alliance" — site.js (vanilla, kitaplık yok) */
(() => {
  'use strict';
  const d = document, b = d.body;
  const azHareket = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1 · Üst menü kaydırınca beyaz zemin; telefondaki alt iletişim çubuğu sayfa başı geçilince belirir (giriş içeriğini örtmez) */
  const ust = d.getElementById('ust');
  const cubuk = d.querySelector('.alt-cubuk');
  const kapakli = b.classList.contains('kapakli');
  let bekle = false;
  const kaydirma = () => {
    bekle = false;
    const y = window.scrollY || 0;
    if (ust) ust.classList.toggle('dolu', y > 24);
    if (cubuk) {
      const g = y > innerHeight * (kapakli ? 0.55 : 0.3);
      cubuk.classList.toggle('gorunur', g);
      b.classList.toggle('cubuk', g);
    }
  };
  addEventListener('scroll', () => { if (!bekle) { bekle = true; requestAnimationFrame(kaydirma); } }, { passive: true });
  kaydirma();

  /* 2 · Tam ekran mobil menü */
  const mm = d.getElementById('mmenu');
  const ac = d.querySelector('[data-menu-ac]');
  if (mm && ac) {
    const kapat = mm.querySelector('[data-menu-kapat]');
    const ayarla = (acik) => {
      if (acik) {
        mm.hidden = false;
        requestAnimationFrame(() => mm.classList.add('acik'));
        b.classList.add('kilit');
        ac.setAttribute('aria-expanded', 'true');
        kapat.focus();
      } else {
        mm.classList.remove('acik');
        b.classList.remove('kilit');
        ac.setAttribute('aria-expanded', 'false');
        setTimeout(() => { mm.hidden = true; }, azHareket ? 0 : 320);
        ac.focus();
      }
    };
    ac.addEventListener('click', () => ayarla(true));
    kapat.addEventListener('click', () => ayarla(false));
    mm.addEventListener('click', (ev) => { if (ev.target.closest('a[href^="#"]')) ayarla(false); });
    d.addEventListener('keydown', (ev) => {
      if (mm.hidden) return;
      if (ev.key === 'Escape') ayarla(false);
      if (ev.key === 'Tab') {
        const f = [...mm.querySelectorAll('a[href],button')].filter((x) => x.offsetParent !== null);
        if (!f.length) return;
        if (ev.shiftKey && d.activeElement === f[0]) { ev.preventDefault(); f[f.length - 1].focus(); }
        else if (!ev.shiftKey && d.activeElement === f[f.length - 1]) { ev.preventDefault(); f[0].focus(); }
      }
    });
    matchMedia('(min-width:1100px)').addEventListener('change', (m) => { if (m.matches && !mm.hidden) ayarla(false); });
  }

  /* 3 · Kapak: 3 fotoğraf, yavaş çapraz geçiş */
  const slayt = d.querySelector('[data-slayt]');
  if (slayt) {
    const ks = slayt.querySelectorAll('.ks');
    const yazi = d.querySelectorAll('.ks-yazi');
    let i = 0;
    const git = (n) => {
      ks[i].classList.remove('aktif'); if (yazi[i]) yazi[i].classList.remove('aktif');
      i = (n + ks.length) % ks.length;
      ks[i].classList.add('aktif'); if (yazi[i]) yazi[i].classList.add('aktif');
    };
    if (ks.length > 1 && !azHareket) setInterval(() => { if (!d.hidden) git(i + 1); }, 6500);
  }

  /* 4 · Yatay kaydırmalı kart dizileri: elmas oklar + ilerleme çizgisi */
  d.querySelectorAll('[data-kaydir]').forEach((k) => {
    const iz = k.querySelector('.kaydir-iz');
    const bar = k.querySelector('.kaydir-ilerleme span');
    const oklar = k.querySelectorAll('.kaydir-oklar [data-yon]');
    if (!iz) return;
    const adim = () => { const li = iz.querySelector('li'); return li ? li.getBoundingClientRect().width + 24 : 320; };
    oklar.forEach((o) => o.addEventListener('click', () => iz.scrollBy({ left: adim() * Number(o.dataset.yon), behavior: azHareket ? 'auto' : 'smooth' })));
    const guncelle = () => {
      const max = iz.scrollWidth - iz.clientWidth;
      const p = max > 0 ? iz.scrollLeft / max : 1;
      if (oklar[0]) oklar[0].disabled = iz.scrollLeft < 4;
      if (oklar[1]) oklar[1].disabled = iz.scrollLeft > max - 4;
      if (bar) bar.style.transform = 'scaleX(' + (0.12 + 0.88 * p).toFixed(3) + ')';
    };
    iz.addEventListener('scroll', guncelle, { passive: true });
    addEventListener('resize', guncelle);
    guncelle();
  });

  /* 5 · Projeler: kategori süzgeci */
  const sz = d.querySelector('[data-suzgec]');
  if (sz) {
    const dugmeler = [...sz.querySelectorAll('button[data-kat]')];
    const kartlar = d.querySelectorAll('.pk-izgara [data-kategori]');
    const sayi = sz.querySelector('[data-sayi]');
    const uygula = (kat, kaydet) => {
      let n = 0;
      dugmeler.forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.kat === kat)));
      kartlar.forEach((c) => {
        const g = kat === 'hepsi' || c.dataset.kategori === kat;
        c.hidden = !g;
        c.classList.remove('belir');
        if (g) { n++; if (!azHareket) { void c.offsetWidth; c.classList.add('belir'); } }
      });
      if (sayi) sayi.textContent = n + ' proje';
      if (kaydet) { try { history.replaceState(null, '', kat === 'hepsi' ? location.pathname + location.search : '#' + kat); } catch (e) { /* file:// */ } }
    };
    dugmeler.forEach((x) => x.addEventListener('click', () => uygula(x.dataset.kat, true)));
    const h = decodeURIComponent(location.hash.slice(1));
    if (h && dugmeler.some((x) => x.dataset.kat === h)) uygula(h, false);
  }

  /* 6 · Galeri: tıklayınca büyüyen görüntüleyici */
  const isik = d.getElementById('isik');
  const ogeler = [...d.querySelectorAll('[data-isik]')];
  if (isik && ogeler.length) {
    const resim = isik.querySelector('img');
    const yazi = isik.querySelector('figcaption');
    const kapatD = isik.querySelector('.isik-kapat');
    let i = 0, son = null;
    const goster = (n) => {
      i = (n + ogeler.length) % ogeler.length;
      const o = ogeler[i];
      resim.src = o.dataset.isik;
      resim.alt = o.querySelector('img').alt;
      yazi.textContent = (i + 1) + ' / ' + ogeler.length;
    };
    const ac2 = (n) => {
      son = d.activeElement; goster(n); isik.hidden = false; b.classList.add('kilit');
      requestAnimationFrame(() => isik.classList.add('acik')); kapatD.focus();
    };
    const kapat2 = () => { isik.classList.remove('acik'); isik.hidden = true; b.classList.remove('kilit'); if (son) son.focus(); };
    ogeler.forEach((o, n) => o.addEventListener('click', () => ac2(n)));
    kapatD.addEventListener('click', kapat2);
    isik.querySelectorAll('[data-yon]').forEach((o) => o.addEventListener('click', () => goster(i + Number(o.dataset.yon))));
    isik.addEventListener('click', (ev) => { if (ev.target === isik || ev.target.tagName === 'FIGURE') kapat2(); });
    d.addEventListener('keydown', (ev) => {
      if (isik.hidden) return;
      if (ev.key === 'Escape') kapat2();
      else if (ev.key === 'ArrowLeft') goster(i - 1);
      else if (ev.key === 'ArrowRight') goster(i + 1);
      else if (ev.key === 'Tab') {
        const f = [...isik.querySelectorAll('button')];
        if (ev.shiftKey && d.activeElement === f[0]) { ev.preventDefault(); f[f.length - 1].focus(); }
        else if (!ev.shiftKey && d.activeElement === f[f.length - 1]) { ev.preventDefault(); f[0].focus(); }
      }
    });
    let x0 = null;
    isik.addEventListener('touchstart', (ev) => { x0 = ev.touches[0].clientX; }, { passive: true });
    isik.addEventListener('touchend', (ev) => {
      if (x0 === null) return;
      const dx = ev.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) goster(i + (dx < 0 ? 1 : -1));
    });
  }

  /* 7 · Formlar: gönderim yok, önizleme mesajı */
  d.querySelectorAll('form[data-onizleme]').forEach((f) => {
    const m = f.querySelector('.form-mesaj');
    f.addEventListener('submit', (ev) => {
      ev.preventDefault();
      if (m) { m.hidden = false; m.focus(); }
    });
  });
  d.querySelectorAll('input[type=file][data-liste]').forEach((inp) => {
    const liste = d.getElementById(inp.dataset.liste);
    const alan = inp.nextElementSibling;
    const yaz = () => {
      liste.textContent = '';
      [...inp.files].forEach((f) => {
        const li = d.createElement('li');
        li.textContent = f.name + ' · ' + Math.max(1, Math.round(f.size / 1024)) + ' KB';
        liste.appendChild(li);
      });
    };
    inp.addEventListener('change', yaz);
    if (alan) {
      ['dragenter', 'dragover'].forEach((t) => alan.addEventListener(t, (ev) => { ev.preventDefault(); alan.classList.add('ustunde'); }));
      ['dragleave', 'drop'].forEach((t) => alan.addEventListener(t, (ev) => { ev.preventDefault(); alan.classList.remove('ustunde'); }));
      alan.addEventListener('drop', (ev) => {
        if (ev.dataTransfer && ev.dataTransfer.files.length) { try { inp.files = ev.dataTransfer.files; } catch (e) { /* eski tarayıcı */ } yaz(); }
      });
    }
  });
  const tur = new URLSearchParams(location.search).get('tur');
  if (tur) {
    const r = [...d.querySelectorAll('input[name="proje_turu"]')].find((x) => x.value === tur);
    if (r) r.checked = true;
  }

  /* 8 · Çerez bildirimi: üstte ince bant; yüksekliği kadar üst menü ve sayfa başı aşağı iner */
  const cerez = d.querySelector('.cerez');
  if (cerez) {
    const kok = d.documentElement;
    const olc = () => kok.style.setProperty('--cerez-h', cerez.hidden ? '0px' : cerez.offsetHeight + 'px');
    let tamam = false;
    try { tamam = localStorage.getItem('boytorun-k1-cerez') === '1'; } catch (e) { /* gizli pencere */ }
    if (!tamam) { cerez.hidden = false; olc(); addEventListener('resize', olc); }
    const dg = cerez.querySelector('[data-cerez]');
    if (dg) dg.addEventListener('click', () => {
      try { localStorage.setItem('boytorun-k1-cerez', '1'); } catch (e) { /* yok say */ }
      cerez.hidden = true; olc(); removeEventListener('resize', olc);
    });
  }

  /* 9 · EN seçici (önizlemede İngilizce sayfa yok) */
  let bildirim = null;
  d.querySelectorAll('[data-en]').forEach((a) => a.addEventListener('click', (ev) => {
    ev.preventDefault();
    if (!bildirim) { bildirim = d.createElement('div'); bildirim.className = 'bildirim'; bildirim.setAttribute('role', 'status'); b.appendChild(bildirim); }
    bildirim.textContent = 'English version: yayında eklenecek.';
    bildirim.classList.add('acik');
    clearTimeout(bildirim._t); bildirim._t = setTimeout(() => bildirim.classList.remove('acik'), 2600);
  }));

  /* 10 · Sayfa içi bağlantılar yumuşak kaysın (global scroll-behavior yerine; denetim araçlarının kaydırmasını bozmaz) */
  d.addEventListener('click', (ev) => {
    const a = ev.target.closest('a[href^="#"]');
    if (!a || a.classList.contains('atla') || a.hasAttribute('data-en')) return;
    const id = decodeURIComponent(a.getAttribute('href').slice(1));
    const h = id && d.getElementById(id);
    if (!h) return;
    ev.preventDefault();
    h.scrollIntoView({ behavior: azHareket ? 'auto' : 'smooth', block: 'start' });
  });

  /* 11 · Bölümler görünür oldukça yumuşak giriş */
  const gor = d.querySelectorAll('.gor');
  if (!azHareket && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('gorundu'); io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    gor.forEach((g) => io.observe(g));
  } else gor.forEach((g) => g.classList.add('gorundu'));
})();
