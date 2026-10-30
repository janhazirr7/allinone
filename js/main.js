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

  // 3. Live Tool Search Filter (Homepage)
  const searchInput = document.getElementById('toolSearchInput');
  const toolCards = document.querySelectorAll('.tool-card');
  const toolsCountBadge = document.getElementById('toolsCountBadge');

  if (searchInput && toolCards.length > 0) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      let matchCount = 0;

      toolCards.forEach(card => {
        const title = (card.getAttribute('data-title') || '').toLowerCase();
        const desc = (card.getAttribute('data-desc') || '').toLowerCase();
        const category = (card.getAttribute('data-category') || '').toLowerCase();

        const matches = title.includes(query) || desc.includes(query) || category.includes(query);

        if (matches) {
          card.style.display = 'flex';
          matchCount++;
        } else {
          card.style.display = 'none';
        }
      });

      if (toolsCountBadge) {
        toolsCountBadge.textContent = `${matchCount} ${matchCount === 1 ? 'Tool' : 'Tools'}`;
      }
    });
  }

  // 4. Category Filter Chips (Homepage)
  const filterChips = document.querySelectorAll('.filter-chip');
  if (filterChips.length > 0 && toolCards.length > 0) {
    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const filter = chip.getAttribute('data-filter');
        let matchCount = 0;

        toolCards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.style.display = 'flex';
            matchCount++;
          } else {
            card.style.display = 'none';
          }
        });

        if (toolsCountBadge) {
          toolsCountBadge.textContent = `${matchCount} ${matchCount === 1 ? 'Tool' : 'Tools'}`;
        }

        if (searchInput) searchInput.value = '';
      });
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

