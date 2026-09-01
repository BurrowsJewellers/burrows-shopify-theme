/* Burrows theme — global scripts (no dependencies) */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isDesktop = function () { return window.innerWidth > 1023; };

  /* ---------------- Header ---------------- */
  var wrap = document.getElementById('bnWrap');

  function setHeaderHeight() {
    if (!wrap) return;
    document.documentElement.style.setProperty('--header-total', wrap.offsetHeight + 'px');
  }

  if (wrap) {
    var onScrollHeader = function () {
      if (window.scrollY > 30) wrap.classList.add('bn-scrolled');
      else wrap.classList.remove('bn-scrolled');
    };
    window.addEventListener('scroll', onScrollHeader, { passive: true });
    onScrollHeader();
    setHeaderHeight();
    window.addEventListener('resize', setHeaderHeight);
    window.addEventListener('load', setHeaderHeight);

    /* Rotating announcement */
    var ann = wrap.querySelector('[data-announcements]');
    var msgEl = document.getElementById('bnMsg');
    if (ann && msgEl) {
      var msgs = ann.getAttribute('data-announcements').split('|').filter(function (m) { return m.trim().length; });
      if (msgs.length > 1) {
        var i = 0;
        setInterval(function () {
          i = (i + 1) % msgs.length;
          msgEl.style.opacity = 0;
          setTimeout(function () { msgEl.textContent = msgs[i]; msgEl.style.opacity = 1; }, 200);
        }, 4000);
      }
    }

    /* Mega menus: hover on desktop, tap-to-open on touch */
    var items = Array.prototype.slice.call(wrap.querySelectorAll('[data-mega]'));
    var closeAll = function () {
      items.forEach(function (o) {
        o.classList.remove('bn-open');
        var a = o.querySelector(':scope > a');
        if (a) a.setAttribute('aria-expanded', 'false');
      });
    };
    var openItem = function (it) {
      closeAll();
      it.classList.add('bn-open');
      var a = it.querySelector(':scope > a');
      if (a) a.setAttribute('aria-expanded', 'true');
    };
    var hoverTimer = null;
    var canHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;

    items.forEach(function (it) {
      var link = it.querySelector(':scope > a');
      if (!link) return;

      if (canHover) {
        it.addEventListener('mouseenter', function () {
          if (!isDesktop()) return;
          clearTimeout(hoverTimer);
          openItem(it);
        });
        it.addEventListener('mouseleave', function () {
          hoverTimer = setTimeout(closeAll, 180);
        });
      }

      link.addEventListener('click', function (e) {
        if (!isDesktop()) return;
        var isOpen = it.classList.contains('bn-open');
        if (canHover) {
          /* Hover already opened it — a click on the title navigates. */
          return;
        }
        e.preventDefault();
        if (isOpen) { window.location.href = link.href; } else { openItem(it); }
      });

      /* Keyboard: ArrowDown on a focused title opens the panel and moves focus into it. */
      link.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown' || (e.key === 'Enter' && !it.classList.contains('bn-open') && !canHover)) {
          e.preventDefault();
          openItem(it);
          var first = it.querySelector('.bn-mega a');
          if (first) first.focus();
        }
      });
      it.addEventListener('focusout', function (e) {
        if (!it.contains(e.relatedTarget)) closeAll();
      });
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('[data-mega]')) closeAll();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAll();
    });
  }

  /* ---------------- Mobile drawer ---------------- */
  var drawer = document.getElementById('bnDrawer');
  var ov = document.getElementById('bnOv');
  var burger = document.getElementById('bnBurger');
  var closeBtn = document.getElementById('bnClose');
  if (drawer && ov && burger) {
    var openDrawer = function () {
      drawer.classList.add('open'); ov.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      burger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
    };
    var closeDrawer = function () {
      drawer.classList.remove('open'); ov.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      burger.focus();
    };
    burger.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    ov.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
    });
    drawer.querySelectorAll('.bn-atop').forEach(function (b) {
      b.addEventListener('click', function () {
        var open = b.parentElement.classList.toggle('eopen');
        b.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
  }

  /* ---------------- Scroll effects: parallax + ring anatomy ---------------- */
  if (!reduceMotion) {
    var lerp = function (a, b, t) { return a + (b - a) * t; };
    var clamp = function (v) { return Math.max(0, Math.min(1, v)); };
    var ease = function (t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
    var seg = function (p, from, to) { return clamp((p - from) / (to - from)); };

    var track = document.querySelector('[data-anatomy]');
    var partD = track && track.querySelector('[data-anatomy-part="diamond"]');
    var partC = track && track.querySelector('[data-anatomy-part="crown"]');
    var partS = track && track.querySelector('[data-anatomy-part="shank"]');
    var labelEls = track ? Array.prototype.slice.call(track.querySelectorAll('[data-anatomy-label]')) : [];
    /* Fade windows: evenly spaced through the middle of the scroll track */
    var windows = labelEls.map(function (_, idx) {
      var n = labelEls.length || 1;
      var start = 0.15 + idx * (0.6 / n);
      return [start, start + 0.17];
    });

    var raf = null;
    var onScrollFx = function () {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = null;
        var vh = window.innerHeight;

        if (track && isDesktop()) {
          var rect = track.getBoundingClientRect();
          var p = clamp(-rect.top / (rect.height - vh));
          var e = ease(seg(p, 0.05, 0.75));
          if (partD) partD.style.transform = 'translateY(' + lerp(150, 0, e) + 'px)';
          if (partC) partC.style.transform = 'translateY(' + lerp(70, 0, e * 0.9) + 'px)';
          if (partS) partS.style.transform = 'translateY(' + lerp(-30, 20, e * 1.1) + 'px)';
          labelEls.forEach(function (el, idx) {
            var t = seg(p, windows[idx][0], windows[idx][1]);
            el.style.opacity = t.toFixed(3);
            el.style.transform = 'translateY(' + lerp(28, 0, ease(t)) + 'px)';
          });
        }

        var pls = document.querySelectorAll('[data-parallax]');
        for (var j = 0; j < pls.length; j++) {
          var el2 = pls[j], par = el2.parentElement;
          if (!par) continue;
          var r = par.getBoundingClientRect();
          if (r.bottom < -100 || r.top > vh + 100) continue;
          var factor = parseFloat(el2.getAttribute('data-parallax')) || 0.15;
          var bleed = Math.max(0, (el2.offsetHeight - par.offsetHeight) / 2);
          var off = Math.max(-bleed, Math.min(bleed, (vh / 2 - (r.top + r.height / 2)) * factor));
          el2.style.transform = 'translateY(' + off.toFixed(1) + 'px)';
        }
      });
    };
    window.addEventListener('scroll', onScrollFx, { passive: true });
    window.addEventListener('resize', onScrollFx);
    onScrollFx();
  }

  /* ---------------- Theme editor: re-run header sizing when sections re-render ---------------- */
  document.addEventListener('shopify:section:load', function () { setHeaderHeight(); });
})();
