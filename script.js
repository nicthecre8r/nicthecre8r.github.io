/* ==========================================================================
   Nicholas Gray — portfolio behaviour
   Shared across index.html, work.html, and ask.html. Every block checks for
   its own elements before wiring up, so the same file works safely on pages
   that don't have (e.g.) the case-study system or the work filter.
     1. Mobile nav toggle
     2. Work filter (UX Design / Experiments) — work.html
     3. Case study pages — work.html
     4. Scroll reveal
     5. Copy email button
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
     3. CASE STUDY PAGES (work.html only)
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
      if (e.key === 'Escape') closeCasePage();
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
     4. SCROLL REVEAL
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
     5. COPY EMAIL
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
