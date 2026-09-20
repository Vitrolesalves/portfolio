/* ===========================================================
   Daniel Augusto — Portfólio · interações
   =========================================================== */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---- ano no rodapé ---- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- nav: sombra ao rolar ---- */
  var nav = $('#nav');
  var onScroll = function () {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 24);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- menu mobile ---- */
  var toggle = $('#navToggle');
  var links = $('#navLinks');
  var closeMenu = function () {
    if (!links) return;
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
  };
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    });
    $$('a', links).forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  }

  /* ---- reveal ao entrar na viewport ---- */
  var revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el, i) {
      // pequeno stagger entre irmãos
      el.style.transitionDelay = Math.min(i % 4, 3) * 60 + 'ms';
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- galeria GPS Vista (thumbs -> shot) ---- */
  var shots = $$('.shot');
  var thumbs = $$('.thumb');
  var setShot = function (idx) {
    shots.forEach(function (s) {
      var active = s.getAttribute('data-shot') === String(idx);
      s.classList.toggle('shot--active', active);
    });
    thumbs.forEach(function (t) {
      var active = t.getAttribute('data-go') === String(idx);
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  };
  thumbs.forEach(function (t) {
    t.addEventListener('click', function () { setShot(t.getAttribute('data-go')); });
  });

  /* ---- lightbox ---- */
  var lb = $('#lightbox');
  var lbImg = $('#lightboxImg');
  var openLB = function (src, alt) {
    if (!lb) return;
    lbImg.src = src; lbImg.alt = alt || '';
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  var closeLB = function () {
    if (!lb) return;
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(function () { lbImg.src = ''; }, 200);
  };
  shots.forEach(function (s) {
    s.addEventListener('click', function () { openLB(s.src, s.alt); });
  });
  if (lb) {
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.classList.contains('lightbox__close')) closeLB();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLB(); });
  }

  /* ---- contadores ---- */
  var counted = false;
  var runCounters = function () {
    if (counted) return; counted = true;
    $$('[data-count]').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var suffix = el.getAttribute('data-suffix') || '';
      var dur = 1200, start = performance.now();
      var step = function (now) {
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target) + (p === 1 ? suffix : '');
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  };
  var statsWrap = $('.hero__stats');
  if (statsWrap && 'IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { runCounters(); so.disconnect(); } });
    }, { threshold: 0.5 });
    so.observe(statsWrap);
  } else {
    runCounters();
  }

  /* ---- destaque do link ativo ---- */
  var sections = $$('main section[id], main article[id]');
  var navAnchors = $$('.nav__links > a[href^="#"]');
  if (sections.length && navAnchors.length && 'IntersectionObserver' in window) {
    var current = '';
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) current = en.target.id;
      });
      navAnchors.forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('href') === '#' + current);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }
})();
