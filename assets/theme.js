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

/* ---------------- Product page ---------------- */
(function () {
  'use strict';
  var root = document.querySelector('[data-product-section]');
  if (!root) return;

  var product, designMap = {};
  try { product = JSON.parse(root.querySelector('[data-product-json]').textContent); } catch (e) { return; }
  try { designMap = JSON.parse(root.querySelector('[data-design-map]').textContent) || {}; } catch (e) { designMap = {}; }

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
      return v.options.every(function (o, i) { return o === opts[i]; });
    });
  }
  function setThumb(mediaId) {
    thumbs.forEach(function (t) {
      var on = String(t.getAttribute('data-media-id')) === String(mediaId);
      t.classList.toggle('on', on);
      if (on && mainImg) { mainImg.src = t.getAttribute('data-full'); mainImg.removeAttribute('srcset'); }
    });
  }

  /* ---- Ring sizing / resizing (block "ring_sizing") ---- */
  var sizing = (function () {
    var box = q('[data-sizing]');
    var mapEl = q('[data-sizing-map]');
    if (!box || !mapEl) return null;
    var data;
    try { data = JSON.parse(mapEl.textContent); } catch (e) { return null; }
    var steps = parseInt(box.getAttribute('data-steps'), 10) || 2;
    var prefixes = (box.getAttribute('data-prefixes') || '').split(',').map(function (p) { return p.trim(); }).filter(Boolean);
    var vals = box.querySelector('[data-sizing-vals]');
    var current = box.querySelector('[data-sizing-current]');
    var summary = box.querySelector('[data-sizing-summary]');
    var note = box.querySelector('[data-sizing-note]');
    var contact = q('[data-sizing-contact]');
    var form = q('.pd__form');
    var state = { active: false, base: null, chosen: null, metal: null, resize: null, variant: null };

    /* UK sizes: A..Z with half sizes -> index 0..51 */
    function parseSize(str) {
      if (!str) return null;
      var m = String(str).trim().toUpperCase().replace(/\s+/g, '').match(/^([A-Z])(½|1\/2|\.5|HALF)?$/);
      if (!m) return null;
      return (m[1].charCodeAt(0) - 65) * 2 + (m[2] ? 1 : 0);
    }
    function fmtSize(idx) { return String.fromCharCode(65 + Math.floor(idx / 2)) + (idx % 2 ? '½' : ''); }
    function carat(str) { var m = String(str || '').match(/(\d+)/); return m ? m[1] : null; }
    function resizeFor(metal) {
      var c = carat(metal);
      if (!c) return null;
      return (data.resize || []).find(function (r) { return carat(r.title) === c; }) || null;
    }
    function inDepartment(sku) {
      return prefixes.some(function (p) { return String(sku || '').indexOf(p) === 0; });
    }

    function render() {
      vals.innerHTML = '';
      var lo = Math.max(0, state.base - steps), hi = Math.min(51, state.base + steps);
      for (var i = lo; i <= hi; i++) {
        var id = 'rs-' + i;
        var input = document.createElement('input');
        input.type = 'radio'; input.className = 'visually-hidden pd__radio'; input.id = id; input.name = 'ring-size'; input.value = i;
        if (i === state.chosen) input.checked = true;
        var label = document.createElement('label');
        label.setAttribute('for', id);
        label.innerHTML = fmtSize(i) + (i === state.base ? '<small>as made</small>' : '<small>+' + money(state.resize.price) + '</small>');
        vals.appendChild(input); vals.appendChild(label);
      }
      refresh();
    }
    function refresh() {
      if (current) current.textContent = fmtSize(state.chosen);
      var changed = state.chosen !== state.base;
      if (summary) {
        summary.innerHTML = changed
          ? 'Resize from <b>' + fmtSize(state.base) + '</b> to <b>' + fmtSize(state.chosen) + '</b> &mdash; <b>+' + money(state.resize.price) + '</b> added at checkout'
          : 'Made in size <b>' + fmtSize(state.base) + '</b> &mdash; no resizing charge';
      }
      if (note) note.hidden = !changed;
    }

    vals.addEventListener('change', function (e) {
      if (e.target && e.target.name === 'ring-size') { state.chosen = parseInt(e.target.value, 10); refresh(); }
    });

    function setVariant(v) {
      var info = (data.variants || {})[String(v.id)] || {};
      var base = parseSize(info.size);
      var rs = resizeFor(info.metal);
      var eligible = inDepartment(info.sku);
      state.variant = v;
      if (eligible && base !== null && rs) {
        state.active = true; state.base = base; state.resize = rs; state.metal = info.metal;
        if (state.chosen === null || state.chosen < base - steps || state.chosen > base + steps) state.chosen = base;
        box.hidden = false;
        if (contact) contact.hidden = true;
        render();
      } else {
        state.active = false;
        box.hidden = true;
        if (contact) contact.hidden = !eligible;
      }
    }

    /* Add ring + resizing service together */
    if (form) {
      form.addEventListener('submit', function (e) {
        if (!state.active || !window.fetch) return;
        e.preventDefault();
        var qtyEl = form.querySelector('[name="quantity"]');
        var qty = Math.max(1, parseInt(qtyEl && qtyEl.value, 10) || 1);
        var vid = parseInt(form.querySelector('[name="id"]').value, 10);
        var from = fmtSize(state.base), to = fmtSize(state.chosen);
        var items = [{ id: vid, quantity: qty, properties: { 'Ring size': to } }];
        if (state.chosen !== state.base) {
          items[0].properties['Resizing'] = from + ' → ' + to + ' (+' + money(state.resize.price) + ')';
          items.push({ id: state.resize.id, quantity: qty, properties: {
            'For': data.productTitle + (state.variant.sku ? ' · ' + state.variant.sku : ''),
            'From': from, 'To': to, '_ring_variant': String(vid)
          } });
        }
        var btn = form.querySelector('[data-add-button]');
        if (btn) btn.disabled = true;
        fetch(window.Shopify && window.Shopify.routes ? window.Shopify.routes.root + 'cart/add.js' : '/cart/add.js', {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ items: items })
        }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); })
          .then(function (res) {
            if (!res.ok) throw new Error(res.body && res.body.description || 'Could not add to cart');
            window.location.href = (window.Shopify && window.Shopify.routes ? window.Shopify.routes.root : '/') + 'cart';
          })
          .catch(function (err) {
            if (btn) btn.disabled = false;
            if (summary) summary.innerHTML = '<span style="color:#8f2020">' + (err.message || 'Sorry, something went wrong adding this to your cart.') + '</span>';
          });
      });
    }

    return { setVariant: setVariant };
  })();

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
    if (skuEl) skuEl.textContent = v.sku || '';
    if (skuRow) skuRow.hidden = !v.sku;
    if (addDiamond) {
      var base = addDiamond.getAttribute('data-base');
      addDiamond.href = base + '?stage=Add+Diamond&settingId=' + product.id + '&settingVariantId=' + v.id;
    }
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


/* ---------------- Cart: drop resizing lines whose ring is no longer in the cart ---------------- */
(function () {
  var items = Array.prototype.slice.call(document.querySelectorAll('[data-cart-item]'));
  if (!items.length || !window.fetch) return;
  var present = {};
  items.forEach(function (el) { present[el.getAttribute('data-variant-id')] = true; });
  var orphans = items.filter(function (el) {
    var f = el.getAttribute('data-for-variant');
    return f && !present[f];
  });
  if (!orphans.length) return;
  var root = (window.Shopify && window.Shopify.routes) ? window.Shopify.routes.root : '/';
  /* Remove highest line numbers first so earlier indexes stay valid */
  orphans.sort(function (a, b) { return parseInt(b.getAttribute('data-line'), 10) - parseInt(a.getAttribute('data-line'), 10); });
  orphans.reduce(function (chain, el) {
    return chain.then(function () {
      return fetch(root + 'cart/change.js', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ line: parseInt(el.getAttribute('data-line'), 10), quantity: 0 })
      });
    });
  }, Promise.resolve()).then(function () { window.location.reload(); }).catch(function () {});
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
