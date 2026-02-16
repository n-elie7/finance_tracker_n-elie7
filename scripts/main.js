const handleNavigation = () => {
  'use strict';

  const navTabs   = document.querySelectorAll('.nav-tab');
  const tabPanels = document.querySelectorAll('.tab-panel');

  function switchTab(tabId) {
    navTabs.forEach(function (btn) {
      const isActive = btn.dataset.tab === tabId;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-current', isActive ? 'page' : 'false');
    });

    tabPanels.forEach(function (panel) {
      if (panel.id === tabId) {
        panel.removeAttribute('hidden');
        const heading = panel.querySelector('h1');
        if (heading) {
          heading.setAttribute('tabindex', '-1');
          heading.focus({ preventScroll: false });
          heading.addEventListener('blur', function handler() {
            heading.removeAttribute('tabindex');
            heading.removeEventListener('blur', handler);
          });
        }
      } else {
        panel.setAttribute('hidden', '');
      }
    });

    closeMobileNav();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navTabs.forEach(function (btn) {
    btn.addEventListener('click', function () {
      switchTab(btn.dataset.tab);
    });
  });


  const menuToggle = document.getElementById('menu-toggle');
  const mainNav    = document.getElementById('main-nav');

  function openMobileNav() {
    mainNav.removeAttribute('hidden');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Close navigation menu');
  }

  function closeMobileNav() {
    mainNav.setAttribute('hidden', '');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation menu');
  }

  function toggleMobileNav() {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', toggleMobileNav);
  }

  window.addEventListener('resize', function () {
    if (window.innerWidth >= 768) {
      mainNav.removeAttribute('hidden');
      menuToggle.setAttribute('aria-expanded', 'false');
    } else {
      if (menuToggle.getAttribute('aria-expanded') !== 'true') {
        mainNav.setAttribute('hidden', '');
      }
    }
  });

  document.addEventListener('click', function (e) {
    const isNavClick = mainNav.contains(e.target);
    const isToggleClick = menuToggle.contains(e.target);
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';

    if (!isNavClick && !isToggleClick && isOpen) {
      closeMobileNav();
    }
  });

  // Close nav on Escape key press
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeMobileNav();
        menuToggle.focus();
      }

      const modal = document.getElementById('delete-modal');
      if (modal && !modal.hidden) {
        closeModal();
      }
    }
  });

  document.addEventListener('click', function (e) {
    const navTarget = e.target.closest('[data-nav]');
    if (navTarget) {
      switchTab(navTarget.dataset.nav);
    }

    if (e.target.id === 'go-add-btn') {
      switchTab('add-transaction');
    }
  });

  const dateInput = document.getElementById('input-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.setAttribute('max', today); 
  }

  const cancelBtn = document.getElementById('cancel-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', function () {
      switchTab('transactions');
    });
  }


  const deleteModal     = document.getElementById('delete-modal');
  const cancelDeleteBtn = document.getElementById('cancel-delete-btn');

  function openModal() {
    if (!deleteModal) return;
    deleteModal.removeAttribute('hidden');
    const firstBtn = deleteModal.querySelector('button');
    if (firstBtn) firstBtn.focus();
  }

  function closeModal() {
    if (!deleteModal) return;
    deleteModal.setAttribute('hidden', '');
  }

  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', closeModal);
  }

  if (deleteModal) {
    deleteModal.addEventListener('click', function (e) {
      if (e.target === deleteModal) {
        closeModal();
      }
    });
  }

  function init() {
    if (window.innerWidth < 768) {
      mainNav.setAttribute('hidden', '');
    } else {
      mainNav.removeAttribute('hidden');
    }
  }

  init();

};

handleNavigation();
