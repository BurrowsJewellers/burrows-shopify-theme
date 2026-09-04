/* Burrows theme — global scripts (no dependencies) */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isDesktop = function () { return window.innerWidth > 1023; };
  /* The header switches to the burger below 1200px (see header.liquid) */
  var isDesktopNav = function () { return window.innerWidth > 1199; };

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
          if (!isDesktopNav()) return;
          clearTimeout(hoverTimer);
          openItem(it);
        });
        it.addEventListener('mouseleave', function () {
          hoverTimer = setTimeout(closeAll, 180);
        });
      }

      link.addEventListener('click', function (e) {
        if (!isDesktopNav()) return;
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
        } else if (track) {
          /* Mobile: the ring assembles as the section scrolls through the viewport */
          var mrect = track.getBoundingClientRect();
          var mp = clamp((vh - mrect.top) / Math.min(mrect.height, vh * 1.2));
          var me = ease(seg(mp, 0.1, 0.9));
          if (partD) partD.style.transform = 'translateY(' + lerp(90, 0, me) + 'px)';
          if (partC) partC.style.transform = 'translateY(' + lerp(44, 0, me * 0.9) + 'px)';
          if (partS) partS.style.transform = 'translateY(' + lerp(-18, 12, me * 1.1) + 'px)';
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

/* ---------------- Product page ---------------- */
(function () {
  'use strict';
  var root = document.querySelector('[data-product-section]');
  if (!root) return;

  var product, designMap = {};
  try { product = JSON.parse(root.querySelector('[data-product-json]').textContent); } catch (e) { return; }
  try { designMap = JSON.parse(root.querySelector('[data-design-map]').textContent) || {}; } catch (e) { designMap = {}; }

  var productPath = ((window.Shopify && window.Shopify.routes) ? window.Shopify.routes.root : '/') + 'products/' + product.handle;
  var money = function (cents) {
    var v = (cents / 100).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return '$' + v;
  };
  var q = function (sel) { return root.querySelector(sel); };
  var qa = function (sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); };

  var picker = q('[data-variant-picker]');
  var idInput = q('[data-variant-id]');
  var priceEl = q('[data-price]');
  var compareEl = q('[data-compare-price]');
  var afterEl = q('[data-afterpay]');
  var addBtn = q('[data-add-button]');
  var addLabel = q('[data-add-label]');
  var stickyPrice = q('[data-sticky-price]');
  var stickyAdd = q('[data-sticky-add]');
  var badge = q('[data-sale-badge]');
  var mainImg = q('.pd__mainimg img');
  var thumbs = qa('[data-thumb]');
  var designWrap = q('[data-design-number-wrap]');
  var designEls = qa('[data-design-number]');
  var designRow = q('[data-design-row]');
  var skuEl = q('[data-sku]');
  var skuRow = q('[data-sku-row]');
  var addDiamond = q('[data-add-diamond]');

  function currentOptions() {
    if (!picker) return null;
    var opts = [];
    qa('[data-option-index]').forEach(function (fs) {
      var checked = fs.querySelector('input:checked');
      opts[parseInt(fs.getAttribute('data-option-index'), 10)] = checked ? checked.value : null;
    });
    return opts;
  }
  function findVariant(opts) {
    if (!opts) return product.variants[0];
    return product.variants.find(function (v) {
      return v.options.every(function (o, i) { return opts[i] == null || o === opts[i]; });
    });
  }
  function setThumb(mediaId) {
    thumbs.forEach(function (t) {
      var on = String(t.getAttribute('data-media-id')) === String(mediaId);
      t.classList.toggle('on', on);
      if (on && mainImg) { mainImg.src = t.getAttribute('data-full'); mainImg.removeAttribute('srcset'); }
    });
  }

  /* Links to the contact page carry the selected variant's SKU and design number,
     which the contact form copies into its optional fields. */
  var contactLinks = qa('[data-contact-link], [data-sizing-contact-link]');
  function setContactLinks(v) {
    if (!contactLinks.length) return;
    var params = [];
    if (v.sku) params.push('sku=' + encodeURIComponent(v.sku));
    var dn = designMap[String(v.id)];
    if (dn) params.push('design=' + encodeURIComponent(dn));
    var qs = params.join('&');
    contactLinks.forEach(function (a) {
      var base = a.getAttribute('data-base') || a.getAttribute('href');
      a.href = base + (qs ? (base.indexOf('?') > -1 ? '&' : '?') + qs : '') + '#contact';
    });
  }

  /* ---- Ring size display (block "ring_sizing"); resizing itself lives in the cart ---- */
  var sizing = (function () {
    var box = q('[data-sizing]');
    var mapEl = q('[data-sizing-map]');
    if (!box || !mapEl) return null;
    var data;
    try { data = JSON.parse(mapEl.textContent); } catch (e) { return null; }
    var prefixes = (box.getAttribute('data-prefixes') || '').split(',').map(function (p) { return p.trim(); }).filter(Boolean);
    var current = Array.prototype.slice.call(box.querySelectorAll('[data-sizing-current]'));
    var note = box.querySelector('[data-sizing-note]');
    var contact = q('[data-sizing-contact]');
    var form = q('.pd__form');
    var propInput = null;
    if (form) {
      propInput = document.createElement('input');
      propInput.type = 'hidden';
      propInput.name = 'properties[Ring size]';
      propInput.disabled = true;
      form.appendChild(propInput);
    }
    function carat(str) { var m = String(str || '').match(/(\d+)/); return m ? m[1] : null; }
    function inDepartment(sku) {
      return prefixes.some(function (p) { return String(sku || '').indexOf(p) === 0; });
    }
    var sizeChoice = box.hasAttribute('data-size-choice');
    function setVariant(v) {
      var info = (data || {})[String(v.id)] || {};
      if (sizeChoice) {
        // The picker shows the size; the variant title carries it into the cart.
        box.hidden = true;
        if (contact) contact.hidden = true;
        if (propInput) { propInput.disabled = true; propInput.value = ''; }
        return;
      }
      var hasSize = info.size && String(info.size).trim().length;
      var eligible = inDepartment(info.sku);
      if (hasSize) {
        current.forEach(function (el) { el.textContent = info.size; });
        box.hidden = false;
        if (note) note.hidden = false;
        if (contact) contact.hidden = true;
        if (propInput) { propInput.disabled = false; propInput.value = info.size; }
      } else {
        box.hidden = true;
        if (contact) contact.hidden = !eligible;
        if (propInput) { propInput.disabled = true; propInput.value = ''; }
      }
    }
    return { setVariant: setVariant };
  })();

  /* Pickup availability: refetch for the selected variant via the Section Rendering API */
  var pickupEl = q('[data-pickup]');
  var pickupSeq = 0;
  function refreshPickup(vid) {
    if (!pickupEl || !window.fetch) return;
    var mySeq = ++pickupSeq;
    var url = productPath + '?variant=' + vid + '&section_id=pickup-availability';
    var preview = new URLSearchParams(window.location.search).get('preview_theme_id');
    if (preview) url += '&preview_theme_id=' + encodeURIComponent(preview);
    fetch(url)
      .then(function (r) { return r.text(); })
      .then(function (html) {
        if (mySeq !== pickupSeq) return;
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var inner = doc.querySelector('[data-pickup-inner]');
        if (inner) pickupEl.innerHTML = inner.innerHTML;
      })
      .catch(function () {});
  }

  function update(pushUrl) {
    var v = findVariant(currentOptions());
    qa('[data-option-index]').forEach(function (fs) {
      var checked = fs.querySelector('input:checked');
      var sel = fs.querySelector('[data-option-selected]');
      if (sel && checked) sel.textContent = checked.value;
    });
    if (!v) {
      if (addBtn) { addBtn.disabled = true; if (addLabel) addLabel.textContent = 'Unavailable'; }
      if (stickyAdd) { stickyAdd.disabled = true; stickyAdd.textContent = 'Unavailable'; }
      return;
    }
    if (idInput) idInput.value = v.id;
    if (priceEl) { priceEl.textContent = money(v.price); priceEl.classList.toggle('on', v.compare_at_price > v.price); }
    if (compareEl) { compareEl.hidden = !(v.compare_at_price > v.price); compareEl.textContent = v.compare_at_price ? money(v.compare_at_price) : ''; }
    if (badge) badge.hidden = !(v.compare_at_price > v.price);
    if (afterEl) afterEl.textContent = money(Math.round(v.price / 4));
    if (stickyPrice) stickyPrice.textContent = money(v.price);
    var label = v.available ? (addBtn && addBtn.getAttribute('data-label')) || 'Add to Cart' : 'Sold out';
    if (addBtn) { addBtn.disabled = !v.available; if (addLabel) addLabel.textContent = label; }
    if (stickyAdd) { stickyAdd.disabled = !v.available; stickyAdd.textContent = v.available ? 'Add to cart' : 'Sold out'; }
    if (v.featured_media && v.featured_media.id) setThumb(v.featured_media.id);
    var dn = designMap[String(v.id)] || '';
    designEls.forEach(function (el) { el.textContent = dn; });
    if (designWrap) designWrap.hidden = !dn;
    if (designRow) designRow.hidden = !dn;
    if (sizing) sizing.setVariant(v);
    setContactLinks(v);
    if (skuEl) skuEl.textContent = v.sku || '';
    if (skuRow) skuRow.hidden = !v.sku;
    if (addDiamond) {
      var base = addDiamond.getAttribute('data-base');
      addDiamond.href = base + '?stage=Add+Diamond&settingId=' + product.id + '&settingVariantId=' + v.id;
    }
    if (pushUrl) refreshPickup(v.id);
    if (pushUrl && window.history && window.history.replaceState) {
      var url = new URL(window.location.href);
      url.searchParams.set('variant', v.id);
      window.history.replaceState({}, '', url.toString());
    }
  }

  if (addBtn && addLabel) addBtn.setAttribute('data-label', addLabel.textContent.trim());
  if (picker) picker.addEventListener('change', function () { update(true); });

  var qty = q('[data-qty]');
  var minus = q('[data-qty-minus]'), plus = q('[data-qty-plus]');
  if (qty && minus) minus.addEventListener('click', function () { qty.value = Math.max(1, (parseInt(qty.value, 10) || 1) - 1); });
  if (qty && plus) plus.addEventListener('click', function () { qty.value = (parseInt(qty.value, 10) || 1) + 1; });

  thumbs.forEach(function (t) {
    t.addEventListener('click', function () { setThumb(t.getAttribute('data-media-id')); });
  });

  if (stickyAdd && addBtn) stickyAdd.addEventListener('click', function () { addBtn.click(); });

  update(false);
})();


/* ---------------- Cart: keep resizing service lines consistent (legacy) ---------------- */
(function () {
  var items = Array.prototype.slice.call(document.querySelectorAll('[data-cart-item]'));
  if (!items.length || !window.fetch) return;
  var root = (window.Shopify && window.Shopify.routes) ? window.Shopify.routes.root : '/';
  var byVariant = {};
  items.forEach(function (el) { if (!el.getAttribute('data-for-variant')) byVariant[el.getAttribute('data-variant-id')] = el; });
  var fixes = [];
  items.forEach(function (el) {
    var f = el.getAttribute('data-for-variant');
    if (!f) return;
    var ring = byVariant[f];
    if (!ring) fixes.push({ id: el.getAttribute('data-key'), quantity: 0 });
    else {
      var rq = parseInt(ring.getAttribute('data-qty'), 10) || 1;
      var sq = parseInt(el.getAttribute('data-qty'), 10) || 1;
      if (rq !== sq) fixes.push({ id: el.getAttribute('data-key'), quantity: rq });
    }
  });
  if (!fixes.length) return;
  fixes.reduce(function (chain, fx) {
    return chain.then(function () {
      return fetch(root + 'cart/change.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fx) });
    });
  }, Promise.resolve()).then(function () { window.location.reload(); }).catch(function () {});
})();

/* ---------------- Contact page: prefill SKU / design number from ?sku=&design= (ring sizing links) ---------------- */
(function () {
  var sku = document.getElementById('ContactSku');
  var design = document.getElementById('ContactDesign');
  if (!sku && !design) return;
  var params = new URLSearchParams(window.location.search);
  var filled = false;
  [[sku, 'sku'], [design, 'design']].forEach(function (pair) {
    var el = pair[0], val = params.get(pair[1]);
    if (el && val && !el.value) { el.value = val; filled = true; }
  });
  if (!filled) return;
  var formEl = (sku || design).closest('form');
  if (formEl) formEl.scrollIntoView({ block: 'start' });
  var name = document.getElementById('ContactName');
  if (name && !name.value) name.focus();
})();

/* ---------------- Predictive search suggestions ---------------- */
(function () {
  var inputs = Array.prototype.slice.call(document.querySelectorAll('#SearchInput, #bnDrawerSearch'));
  if (!inputs.length || !window.fetch) return;
  var root = (window.Shopify && window.Shopify.routes) ? window.Shopify.routes.root : '/';
  var esc = function (t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var thumb = function (u) { return u + (u.indexOf('?') > -1 ? '&' : '?') + 'width=120'; };

  inputs.forEach(function (input) {
    var form = input.closest('form');
    if (!form) return;
    form.classList.add('psr-wrap');
    var panel = document.createElement('div');
    panel.className = 'psr';
    panel.hidden = true;
    form.appendChild(panel);
    var timer = null, seq = 0, active = -1;

    function close() { panel.hidden = true; panel.innerHTML = ''; active = -1; }
    function items() { return Array.prototype.slice.call(panel.querySelectorAll('a')); }
    function highlight(i) {
      var list = items();
      if (!list.length) return;
      active = (i + list.length) % list.length;
      list.forEach(function (a, n) { a.classList.toggle('on', n === active); });
    }
    function render(products, q) {
      if (!products.length) { close(); return; }
      panel.innerHTML = products.map(function (p) {
        var img = p.featured_image && p.featured_image.url
          ? '<img src="' + esc(thumb(p.featured_image.url)) + '" alt="" loading="lazy">'
          : '<span class="psr__noimg"></span>';
        return '<a class="psr__item" href="' + esc(p.url) + '">' + img +
          '<span class="psr__body">' +
          (p.vendor ? '<span class="psr__brand">' + esc(p.vendor) + '</span>' : '') +
          '<span class="psr__title">' + esc(p.title) + '</span>' +
          '<span class="psr__price">$' + esc(p.price) + '</span>' +
          '</span></a>';
      }).join('') + '<a class="psr__all" href="' + esc(root + 'search?q=' + encodeURIComponent(q)) + '">See all results for &ldquo;' + esc(q) + '&rdquo; &rarr;</a>';
      panel.hidden = false;
      active = -1;
    }
    function search() {
      var q = input.value.trim();
      if (q.length < 2) { close(); return; }
      var mySeq = ++seq;
      fetch(root + 'search/suggest.json?q=' + encodeURIComponent(q) +
        '&resources[type]=product&resources[limit]=8' +
        '&resources[options][unavailable_products]=last' +
        '&resources[options][fields]=title,product_type,vendor,variants.title,variants.sku,body')
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (mySeq !== seq) return;
          var products = (d.resources && d.resources.results && d.resources.results.products) || [];
          render(products, q);
        })
        .catch(function () {});
    }

    input.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(search, 220);
    });
    input.addEventListener('keydown', function (e) {
      if (panel.hidden) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); highlight(active + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); highlight(active - 1); }
      else if (e.key === 'Enter' && active > -1) { e.preventDefault(); window.location.href = items()[active].href; }
      else if (e.key === 'Escape') { close(); }
    });
    input.addEventListener('focus', function () { if (input.value.trim().length >= 2 && panel.innerHTML === '') search(); });
    document.addEventListener('click', function (e) { if (!form.contains(e.target)) close(); });
  });
})();

/* ---------------- Product recommendations (Section Rendering API) ---------------- */
(function () {
  var el = document.querySelector('[data-recommendations]');
  if (!el || !el.getAttribute('data-url')) return;
  var url = el.getAttribute('data-url');
  var preview = new URLSearchParams(window.location.search).get('preview_theme_id');
  if (preview) url += '&preview_theme_id=' + encodeURIComponent(preview);
  var load = function () {
    fetch(url)
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var inner = doc.querySelector('[data-recommendations]');
        if (inner && inner.innerHTML.trim().length) el.innerHTML = inner.innerHTML;
      })
      .catch(function () {});
  };
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) { load(); io.disconnect(); }
    }, { rootMargin: '400px 0px' });
    io.observe(el);
  } else { load(); }
})();
