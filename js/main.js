/* SITE_CONFIG — single place documenting the site's base URL.
   Canonicals/hreflang/sitemap are static HTML, so a future domain move is NOT done here in JS:
   it is one documented find/replace — see URL-MIGRATION.md. */
const SITE_CONFIG = {
  siteName: 'OmniTools',
  baseUrl: 'https://janhazirr7.github.io/allinone/',
  basePath: '/allinone/',
  contactEmail: null, // deferred until owner buys a domain — contact form edit waits for that milestone
};

/**
 * OmniTools - Core Shared Script
 * Lightweight, Vanilla JavaScript, Zero Dependencies
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Navigation Toggle
  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = navLinks.classList.toggle('active');
      mobileToggle.setAttribute('aria-expanded', isExpanded);
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!mobileToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 2. Sticky Header Shadow on Scroll
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // 3. Unified Live Search + Category Filter (Homepage)
  // Search and category now COMBINE: typing filters within the active tab,
  // and switching tabs keeps the search text (previously each one reset the other).
  const searchInput = document.getElementById('toolSearchInput');
  const toolCards = document.querySelectorAll('.tool-card');
  const toolsCountBadge = document.getElementById('toolsCountBadge');
  const toolsGrid = document.getElementById('toolsGrid');
  const filterChips = document.querySelectorAll('.filter-chip');

  let activeFilter = 'all';
  const preselected = document.querySelector('.filter-chip.active');
  if (preselected && preselected.getAttribute('data-filter')) {
    activeFilter = preselected.getAttribute('data-filter');
  }

  let noResultsEl = null;
  function getNoResultsEl() {
    if (noResultsEl) return noResultsEl;
    noResultsEl = document.createElement('div');
    noResultsEl.className = 'no-results';
    // Text comes from data-no-results on the grid when a translation adds it;
    // otherwise English is the fallback (the grid is English-first content).
    noResultsEl.textContent = (toolsGrid && toolsGrid.getAttribute('data-no-results'))
      || 'No tools match your search.';
    noResultsEl.style.display = 'none';
    if (toolsGrid && toolsGrid.parentNode) {
      toolsGrid.parentNode.insertBefore(noResultsEl, toolsGrid.nextSibling);
    }
    return noResultsEl;
  }

  function applyFilters() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    let matchCount = 0;

    toolCards.forEach(card => {
      const title = (card.getAttribute('data-title') || '').toLowerCase();
      const desc = (card.getAttribute('data-desc') || '').toLowerCase();
      const category = (card.getAttribute('data-category') || '').toLowerCase();

      const matchesQuery = !query
        || title.includes(query) || desc.includes(query) || category.includes(query);
      const matchesCategory = activeFilter === 'all' || category === activeFilter;

      if (matchesQuery && matchesCategory) {
        card.style.display = 'flex';
        matchCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (toolsCountBadge) {
      // Preserve the page's own language: replace only the leading number
      // (all homepages use Latin digits, e.g. "36 Tools Available").
      const text = toolsCountBadge.textContent;
      if (/^\d+/.test(text)) {
        toolsCountBadge.textContent = text.replace(/^\d+/, String(matchCount));
      }
    }

    if (toolsGrid) {
      getNoResultsEl().style.display = matchCount === 0 ? 'block' : 'none';
    }
  }

  if (searchInput && toolCards.length > 0) {
    searchInput.addEventListener('input', applyFilters);
  }

  // 4. Category Filter Tabs (Homepage) — real tab semantics + keyboard support
  if (filterChips.length > 0 && toolCards.length > 0) {
    filterChips.forEach((chip, index) => {
      chip.setAttribute('role', 'tab');
      chip.setAttribute('aria-controls', 'toolsGrid');
      chip.setAttribute('aria-selected', chip.classList.contains('active') ? 'true' : 'false');

      chip.addEventListener('click', () => {
        filterChips.forEach(c => {
          c.classList.remove('active');
          c.setAttribute('aria-selected', 'false');
        });
        chip.classList.add('active');
        chip.setAttribute('aria-selected', 'true');
        activeFilter = chip.getAttribute('data-filter') || 'all';
        applyFilters();
      });

      chip.addEventListener('keydown', (e) => {
        let next = null;
        if (e.key === 'ArrowRight') next = filterChips[(index + 1) % filterChips.length];
        else if (e.key === 'ArrowLeft') next = filterChips[(index - 1 + filterChips.length) % filterChips.length];
        else if (e.key === 'Home') next = filterChips[0];
        else if (e.key === 'End') next = filterChips[filterChips.length - 1];
        if (next) {
          e.preventDefault();
          next.focus();
          next.click();
        }
      });
    });
  }

  // 5. Searchable Language Switcher (Homepage)
  // Progressive enhancement: the native <select id="langSelect"> stays in the
  // markup as the no-JS fallback. When JS runs, a globe button + searchable
  // dropdown is built FROM the select's own options, so every language page
  // keeps its own correct relative URLs (e.g. de/ uses ../, ./, ../es/).
  // Tool pages do not load this file, so their switcher stays native — still
  // fully functional, just without the search panel.
  const nativeSelect = document.getElementById('langSelect');
  if (nativeSelect && nativeSelect.options.length > 0) {
    const wrapper = document.createElement('div');
    wrapper.className = 'lang-switcher';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'lang-switcher-btn';
    button.setAttribute('aria-haspopup', 'listbox');
    button.setAttribute('aria-expanded', 'false');
    const selectedOpt = nativeSelect.options[nativeSelect.selectedIndex] || nativeSelect.options[0];
    const globe = document.createElement('span');
    globe.setAttribute('aria-hidden', 'true');
    globe.textContent = '🌐';
    const label = document.createElement('span');
    label.className = 'lang-switcher-label';
    label.textContent = selectedOpt.text;
    button.append(globe, label);

    const panel = document.createElement('div');
    panel.className = 'lang-switcher-panel';
    panel.setAttribute('role', 'listbox');
    panel.hidden = true;

    const langSearch = document.createElement('input');
    langSearch.type = 'text';
    langSearch.className = 'lang-switcher-search';
    langSearch.setAttribute('aria-label', nativeSelect.getAttribute('aria-label') || 'Select language');
    langSearch.placeholder = 'Search…';

    const list = document.createElement('ul');
    list.className = 'lang-switcher-list';
    Array.from(nativeSelect.options).forEach(opt => {
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      if (opt.selected) li.setAttribute('aria-selected', 'true');
      li.tabIndex = 0;
      li.textContent = opt.text;
      const go = () => { window.location.href = opt.value; };
      li.addEventListener('click', go);
      li.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          go();
        }
      });
      list.appendChild(li);
    });

    langSearch.addEventListener('input', () => {
      const q = langSearch.value.toLowerCase().trim();
      list.querySelectorAll('li').forEach(li => {
        li.style.display = li.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });

    panel.append(langSearch, list);
    wrapper.append(button, panel);
    nativeSelect.parentNode.insertBefore(wrapper, nativeSelect);
    nativeSelect.classList.add('lang-select-native-hidden');

    const closePanel = () => {
      panel.hidden = true;
      button.setAttribute('aria-expanded', 'false');
    };
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      if (panel.hidden) {
        panel.hidden = false;
        button.setAttribute('aria-expanded', 'true');
        langSearch.focus();
      } else {
        closePanel();
      }
    });
    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) closePanel();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePanel();
    });
  }
});

/**
 * Global Toast Notification Helper
 * @param {string} message - Notification text
 * @param {number} duration - Milliseconds to display
 */
function showToast(message, duration = 3000) {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
    </svg>
    <span>${message}</span>
  `;

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

/**
 * Clipboard Copy Helper
 * @param {string} text - Content to copy
 * @param {string} successMsg - Message for toast
 */
function copyToClipboard(text, successMsg = 'Copied to clipboard!') {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMsg);
    }).catch(() => {
      fallbackCopy(text, successMsg);
    });
  } else {
    fallbackCopy(text, successMsg);
  }
}

function fallbackCopy(text, successMsg) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(successMsg);
  } catch (err) {
    showToast('Failed to copy');
  }
  textArea.remove();
}

