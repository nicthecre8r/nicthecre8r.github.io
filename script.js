/* ==========================================================================
   Nicholas Gray — portfolio behaviour
   Shared across index.html, work.html, and ask.html. Every block checks for
   its own elements before wiring up, so the same file works safely on pages
   that don't have (e.g.) the case-study system or the work filter.
     1. Mobile nav toggle
     2. Work filter (UX Design / Experiments) — work.html
     3. Image lightbox — work.html
     4. Case study pages — work.html
     5. Scroll reveal
     6. Copy email button
   No libraries, no build step.
   ========================================================================== */

(function () {
  'use strict';

  document.documentElement.classList.add('js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     1. MOBILE NAV TOGGLE
     ------------------------------------------------------------------ */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
    nav.querySelectorAll('[data-nav-link]').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ------------------------------------------------------------------
     2. WORK PAGE FILTER
     Shows projects whose data-category matches the pressed button.
     ------------------------------------------------------------------ */
  var filterButtons = document.querySelectorAll('.filter-btn');
  var projects = document.querySelectorAll('.project[data-category]');

  if (filterButtons.length && projects.length) {
    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var category = button.dataset.filter;
        filterButtons.forEach(function (other) {
          other.setAttribute('aria-pressed', String(other === button));
        });
        projects.forEach(function (project) {
          project.hidden = project.dataset.category !== category;
        });
      });
    });
  }

  /* ------------------------------------------------------------------
     3. IMAGE LIGHTBOX (work.html only)
     Case-study screenshots are up to 1440px wide but render inside a 68ch
     column, so detail is lost. Each figure image is wrapped in a button at
     runtime and opens in a native <dialog>, which supplies focus trapping,
     Escape-to-close, inertness and focus restoration without us writing it.
     Progressive enhancement: with JS off the figures stay plain images.
     Runs after each case renders, because case content is injected from a
     <template> rather than present at load.
     ------------------------------------------------------------------ */
  var lightbox = null;
  var lightboxImg = null;
  var lightboxCaption = null;

  var supportsDialog = typeof HTMLDialogElement === 'function' &&
                       typeof document.createElement('dialog').showModal === 'function';

  var buildLightbox = function () {
    if (lightbox || !supportsDialog) return lightbox;

    lightbox = document.createElement('dialog');
    lightbox.className = 'lightbox';
    lightbox.innerHTML =
      '<div class="lightbox__bar">' +
        '<p class="lightbox__caption"></p>' +
        '<button class="lightbox__zoom" type="button" aria-pressed="false">Actual size</button>' +
        '<button class="lightbox__close" type="button">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
          'stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>' +
          'Close' +
        '</button>' +
      '</div>' +
      '<div class="lightbox__scroll"><img class="lightbox__img" alt=""></div>';

    lightboxImg = lightbox.querySelector('.lightbox__img');
    lightboxCaption = lightbox.querySelector('.lightbox__caption');

    lightbox.querySelector('.lightbox__close').addEventListener('click', function () {
      lightbox.close();
    });

    // Fit-to-width vs. actual size. Only offered when the image is actually
    // bigger than the space available, so the control never lies.
    var zoomBtn = lightbox.querySelector('.lightbox__zoom');
    var setZoom = function (actual) {
      lightbox.classList.toggle('is-actual-size', actual);
      zoomBtn.setAttribute('aria-pressed', String(actual));
      zoomBtn.textContent = actual ? 'Fit to width' : 'Actual size';
    };
    zoomBtn.addEventListener('click', function () {
      setZoom(!lightbox.classList.contains('is-actual-size'));
    });
    lightboxImg.addEventListener('click', function () {
      if (!zoomBtn.hidden) setZoom(!lightbox.classList.contains('is-actual-size'));
    });
    lightbox._setZoom = setZoom;
    lightbox._zoomBtn = zoomBtn;

    // Clicking the surround closes; clicking the image itself does not.
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox || e.target.classList.contains('lightbox__scroll')) {
        lightbox.close();
      }
    });

    // Release the body scroll lock however the dialog was dismissed,
    // including the browser's own Escape handling.
    lightbox.addEventListener('close', function () {
      document.body.style.overflow = '';
    });

    document.body.appendChild(lightbox);
    return lightbox;
  };

  var openLightbox = function (img, caption) {
    if (!buildLightbox()) return;
    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt || '';
    lightboxCaption.textContent = caption || '';
    var scroller = lightbox.querySelector('.lightbox__scroll');
    scroller.scrollTop = 0;
    scroller.scrollLeft = 0;
    lightbox._setZoom(false);
    document.body.style.overflow = 'hidden';
    lightbox.showModal();

    // Decide after layout whether actual size would show anything more.
    var decideZoomAffordance = function () {
      var room = scroller.clientWidth;
      lightbox._zoomBtn.hidden = !(lightboxImg.naturalWidth > room + 1);
    };
    if (lightboxImg.complete) decideZoomAffordance();
    else lightboxImg.addEventListener('load', decideZoomAffordance, { once: true });
  };

  var lightboxIsOpen = function () {
    return !!(lightbox && lightbox.open);
  };

  var enhanceFigures = function (root) {
    if (!supportsDialog || !root) return;

    root.querySelectorAll('.case-figure img, .case-figure-full img').forEach(function (img) {
      if (img.parentNode.classList.contains('case-zoom')) return;

      var figure = img.closest('figure');
      var caption = figure && figure.querySelector('figcaption');
      var captionText = caption ? caption.textContent.trim() : '';

      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'case-zoom';
      // The alt text already describes the image; this says what the control does.
      button.setAttribute('aria-label', 'Open larger view' + (captionText ? ': ' + captionText : ''));

      img.parentNode.insertBefore(button, img);
      button.appendChild(img);

      button.addEventListener('click', function () {
        openLightbox(img, captionText);
      });
    });
  };

  /* ------------------------------------------------------------------
     4. CASE STUDY PAGES (work.html only)
     Clicking a project's Open / View case study control swaps the whole
     page for a dedicated case-study view (main is hidden, not overlaid)
     and pushes a "#case/<slug>" URL so both the on-page back link and the
     browser's own Back button return to Work. Reads title/kind/
     description/outcome straight off the clicked project card when
     there's no bespoke template for it.
     ------------------------------------------------------------------ */
  var main = document.getElementById('main');
  var casePage = document.getElementById('case-page');
  var caseBack = document.getElementById('case-back');
  var modalContentSlot = document.getElementById('modal-case-content');

  if (main && casePage && caseBack && modalContentSlot) {
    var defaultCaseHTML = modalContentSlot.innerHTML;
    var siteTitle = document.title;
    var lastFocused = null;

    var onCasePageKeydown = function (e) {
      // The dialog handles its own Escape; without this guard a single
      // press would close the lightbox and the case page together.
      if (e.key === 'Escape' && !lightboxIsOpen()) closeCasePage();
    };

    var findArticleBySlug = function (slug) {
      return document.querySelector('.project[data-slug="' + slug + '"]');
    };

    var renderCase = function (article) {
      var caseId = article.dataset.case;
      var tpl = caseId && document.getElementById('case-' + caseId);

      if (tpl) {
        modalContentSlot.innerHTML = tpl.innerHTML;
      } else {
        modalContentSlot.innerHTML = defaultCaseHTML;

        var title = article.querySelector('.project-title').textContent.trim();
        var kind = article.querySelector('.project-kind').textContent.trim();
        var desc = article.querySelector('.project-desc').textContent.trim();
        var outcomeEl = article.querySelector('.project-outcome');

        document.getElementById('modal-eyebrow').textContent = 'Case study · ' + kind;
        document.getElementById('modal-title').textContent = title;

        var summary = desc + ' [INSERT 2–3 more sentences: who uses it, and what changed because of this work.]';
        if (title === 'Provider Data Central') {
          summary = desc + ' Provider onboarding touched four systems and three teams, none of which agreed on when a provider counted as "onboarded".';
        }
        document.getElementById('modal-summary').textContent = summary;

        if (outcomeEl) {
          var firstOutcome = document.querySelector('#modal-outcomes li');
          firstOutcome.innerHTML = outcomeEl.innerHTML.replace('<strong>', '').replace('</strong>', '') +
            '<span>[How it was measured, and over what period]</span>';
        }
      }

      document.title = document.getElementById('modal-title').textContent + ' — Nicholas Gray';

      // Case content is injected above, so the zoom controls have to be
      // attached now rather than at load.
      enhanceFigures(modalContentSlot);
    };

    var openCasePage = function (article, trigger, pushHistory) {
      renderCase(article);

      main.hidden = true;
      casePage.hidden = false;
      window.scrollTo(0, 0);
      caseBack.focus();

      if (pushHistory !== false) {
        history.pushState({ caseSlug: article.dataset.slug }, '', '#case/' + article.dataset.slug);
      }

      lastFocused = trigger || null;
      document.addEventListener('keydown', onCasePageKeydown);
    };

    var closeCasePage = function (pushHistory) {
      casePage.hidden = true;
      main.hidden = false;
      document.title = siteTitle;
      document.removeEventListener('keydown', onCasePageKeydown);

      if (pushHistory !== false) {
        history.pushState(null, '', '#work');
      }

      if (lastFocused) {
        lastFocused.focus();
      } else {
        var workHeading = document.getElementById('work');
        if (workHeading) workHeading.scrollIntoView();
      }
    };

    document.querySelectorAll('[data-open-case]').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var article = trigger.closest('.project');
        if (article) openCasePage(article, trigger);
      });
    });

    caseBack.addEventListener('click', function (e) {
      e.preventDefault();
      closeCasePage();
    });

    window.addEventListener('popstate', function () {
      var match = location.hash.match(/^#case\/(.+)$/);
      var article = match && findArticleBySlug(match[1]);
      if (article) {
        openCasePage(article, null, false);
      } else if (!casePage.hidden) {
        closeCasePage(false);
      }
    });

    // Deep link support: open straight to a case study if the page loads
    // with a "#case/<slug>" hash already in the URL — e.g. a "View case
    // study" link from the homepage's Featured work section.
    (function () {
      var match = location.hash.match(/^#case\/(.+)$/);
      var article = match && findArticleBySlug(match[1]);
      if (article) openCasePage(article, null, false);
    })();
  }

  /* ------------------------------------------------------------------
     5. SCROLL REVEAL
     Fades elements in as they enter the viewport.
     ------------------------------------------------------------------ */
  var revealItems = document.querySelectorAll('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealItems.forEach(function (el) { observer.observe(el); });
  }

  /* ------------------------------------------------------------------
     6. COPY EMAIL
     Works on any <button data-copy="you@email.com">. The label changes
     to "Copied" for two seconds, then reverts.
     ------------------------------------------------------------------ */
  document.querySelectorAll('[data-copy]').forEach(function (button) {
    button.addEventListener('click', function () {
      var value = button.getAttribute('data-copy');
      var original = button.textContent;

      if (!navigator.clipboard) {
        button.textContent = value;
        return;
      }

      navigator.clipboard.writeText(value).then(function () {
        button.textContent = 'Copied';
        setTimeout(function () { button.textContent = original; }, 2000);
      }).catch(function () {
        button.textContent = value;
      });
    });
  });

})();
