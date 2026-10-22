/**
 * JDJ Design Co. — Interactive Hardware Experience
 * Production Script
 */
(function () {
  'use strict';

  var d = document,
    $ = function (s) { return [].slice.call(d.querySelectorAll(s)); },
    rm = matchMedia('(prefers-reduced-motion:reduce)').matches,
    cl = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  // Update dynamic copyright year
  try {
    var yearEl = $('#y')[0];
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  } catch (e) {}

  // Scroll reveal animations (.r, .wire)
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  $('.r,.wire').forEach(function (el, i) {
    el.style.transitionDelay = (i % 4) * 80 + 'ms';
    if (rm) {
      el.classList.add('in');
    } else {
      io.observe(el);
    }
  });

  // Autoplay video on visibility
  var vio = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var p = entry.target.play();
        if (p && p.catch) p.catch(function () {});
      } else {
        entry.target.pause();
      }
    });
  }, { threshold: 0.05 });

  if (!rm) {
    $('video.v').forEach(function (v) { vio.observe(v); });
  }

  // Hero 3D interactive stage parallax
  var st = $('#stage')[0];
  if (st && !rm) {
    addEventListener('pointermove', function (e) {
      st.style.setProperty('--px', (e.clientX / innerWidth - 0.5).toFixed(3));
      st.style.setProperty('--py', (e.clientY / innerHeight - 0.5).toFixed(3));
    });
  }

  // Interactive horizontal collection scroll
  var rail = $('#collection')[0],
    rt = $('#rt')[0],
    rb = $('#rb')[0],
    rn = $('#rn')[0],
    sl = $('#sl')[0],
    lis = $('#sl li');

  if (rail && rt && rb && rn && sl && !rm) {
    (function updateRail() {
      var h = innerHeight,
        r = rail.getBoundingClientRect(),
        p = cl(-r.top / (r.height - h), 0, 1),
        mx = rt.scrollWidth - innerWidth;

      rt.style.transform = 'translateX(' + (-mx * p) + 'px)';
      rb.style.transform = 'scaleX(' + p + ')';
      rn.textContent = ('0' + Math.min(7, 1 + Math.floor(p * 7))).slice(-2);

      var s = sl.getBoundingClientRect();
      var triggerY = h * 0.65;
      var processP = cl((triggerY - s.top) / s.height, 0, 1);
      sl.style.setProperty('--p', processP.toFixed(3));
      lis.forEach(function (li) {
        var liRect = li.getBoundingClientRect();
        li.classList.toggle('on', liRect.top < triggerY);
      });
      requestAnimationFrame(updateRail);
    })();
  }

  // Exclusive FAQ Accordion: only one open at a time
  var faqDetails = d.querySelectorAll('.fq details');
  faqDetails.forEach(function (det) {
    det.addEventListener('toggle', function () {
      if (det.open) {
        faqDetails.forEach(function (other) {
          if (other !== det && other.open) {
            other.open = false;
          }
        });
      }
    });
  });

  // Metric number counters animation
  $('.ns b').forEach(function (b) {
    var text = b.textContent,
      m = text.match(/^(~?)(\d+)$/);
    if (!m || rm) return;
    var num = +m[2];
    new IntersectionObserver(function (entries, observer) {
      if (entries[0].isIntersecting) {
        observer.disconnect();
        var startTime = performance.now();
        (function animateCounter(now) {
          var progress = Math.min(1, (now - startTime) / 1500);
          b.textContent = m[1] + Math.round(num * (1 - Math.pow(1 - progress, 3)));
          if (progress < 1) requestAnimationFrame(animateCounter);
        })(startTime);
      }
    }).observe(b);
  });

  // Contact envelope interactive 3D reveal and card stacking
  var cs = d.getElementById('contact'),
    e1 = d.getElementById('e1'),
    e2 = d.getElementById('e2'),
    e3 = d.getElementById('e3'),
    sc = $('.sc');

  if (cs && e1 && e2 && e3 && !rm) {
    (function updateEnvelope() {
      var h = innerHeight,
        r = cs.getBoundingClientRect(),
        p = cl(-r.top / (r.height - h), 0, 1),
        t = p < 0.5 ? p * 2 : (1 - p) * 2;
      t = t * t * (3 - 2 * t);
      var dx = Math.max(40, (innerWidth - e1.parentNode.offsetWidth) / 2 - 16) * t;

      e1.style.transform = e3.style.transform = 'translateX(' + dx + 'px)';
      e2.style.transform = 'translateX(' + (-dx) + 'px)';
      e2.style.zIndex = p > 0.5 ? 5 : 2;

      sc.forEach(function (card, idx) {
        var nextCard = sc[idx + 1];
        if (!nextCard) return;
        var q = cl((h - nextCard.getBoundingClientRect().top) / (h - 84 - (idx + 1) * 22), 0, 1);
        card.style.transform = 'scale(' + (1 - 0.05 * q) + ')';
        card.style.filter = 'brightness(' + (1 - 0.5 * q) + ')';
      });

      requestAnimationFrame(updateEnvelope);
    })();
  }

  // Mobile navigation, scroll-to-top button, and sticky CTA
  var bg = d.getElementById('bg'),
    mn = d.getElementById('mn'),
    tt = d.getElementById('tt'),
    scta = d.getElementById('scta'),
    contactSection = d.getElementById('contact');

  function toggleMenu(isOpen) {
    if (!mn || !bg) return;
    mn.hidden = !isOpen;
    bg.setAttribute('aria-expanded', isOpen);
    bg.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    d.body.style.overflow = isOpen ? 'hidden' : '';
  }

  if (bg && mn) {
    bg.onclick = function () { toggleMenu(mn.hidden); };
    mn.addEventListener('click', function (e) {
      if (e.target.closest('a')) toggleMenu(false);
    });
    addEventListener('keydown', function (e) {
      if (e.key === 'Escape') toggleMenu(false);
    });
  }

  function handleScroll() {
    var y = scrollY,
      maxScroll = d.documentElement.scrollHeight - innerHeight,
      contactRect = contactSection ? contactSection.getBoundingClientRect() : null;

    if (tt) {
      tt.style.setProperty('--sp', Math.min(1, y / maxScroll).toFixed(3));
      tt.classList.toggle('show', y > 800);
    }
    if (scta && contactRect) {
      scta.classList.toggle('show', y > 600 && maxScroll - y > 900 && !(contactRect.top < innerHeight && contactRect.bottom > 0));
    }
  }

  addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  if (tt) {
    tt.onclick = function () { scrollTo({ top: 0, behavior: 'smooth' }); };
  }

  // Lucide icons initialization
  if (window.lucide && typeof lucide.createIcons === 'function') {
    lucide.createIcons();
  }
})();
