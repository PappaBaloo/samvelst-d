/* =========================================================
   Rozen Clean – main.js
   Handles: tab switching, mobile nav, window details toggle,
            form submission feedback
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------
     Service Tab Switching
  --------------------------------------------------------- */
  const tabs   = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      // Update tabs
      tabs.forEach(t => t.classList.remove('tab--active'));
      tab.classList.add('tab--active');

      // Update panels
      panels.forEach(panel => {
        const isTarget = panel.id === `panel-${target}`;
        panel.classList.toggle('panel--active', isTarget);
      });

      // Scroll to panel on mobile
      if (window.innerWidth <= 768) {
        const activePanel = document.getElementById(`panel-${target}`);
        if (activePanel) {
          setTimeout(() => {
            activePanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 50);
        }
      }
    });
  });


  /* ---------------------------------------------------------
     Mobile Nav Toggle
  --------------------------------------------------------- */
  const navToggle = document.getElementById('navToggle');
  const navMobile = document.getElementById('navMobile');

  if (navToggle && navMobile) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMobile.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close when a link is tapped
    navMobile.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => navMobile.classList.remove('open'));
    });
  }


  /* ---------------------------------------------------------
     Window Details Toggle (Storstädning panel)
  --------------------------------------------------------- */
  const showFonsterBtn  = document.getElementById('showFonsterInfo');
  const windowDetails   = document.getElementById('windowDetails');
  const addonFonster    = document.getElementById('addonFonster');

  function toggleWindowDetails(open) {
    if (!windowDetails) return;
    windowDetails.classList.toggle('open', open);
    if (showFonsterBtn) {
      showFonsterBtn.textContent = open
        ? 'Dölj fönsterinfo ‹'
        : 'Så räknar vi fönster ›';
    }
  }

  if (showFonsterBtn) {
    showFonsterBtn.addEventListener('click', () => {
      const isOpen = windowDetails.classList.contains('open');
      toggleWindowDetails(!isOpen);
    });
  }

  // Also open details when "Fönsterputs" add-on is checked
  if (addonFonster) {
    addonFonster.addEventListener('change', () => {
      toggleWindowDetails(addonFonster.checked);
    });
  }

  // Fönsterputs stand-alone panel info button
  const showFonsterBtn2 = document.getElementById('showFonsterInfo2');
  if (showFonsterBtn2) {
    showFonsterBtn2.addEventListener('click', () => {
      // Show a simple tooltip / info block inline
      const existing = document.getElementById('fonsterInfoBlock');
      if (existing) { existing.remove(); return; }
      const info = document.createElement('div');
      info.id = 'fonsterInfoBlock';
      info.className = 'fonster-info-block';
      info.innerHTML = `
        <strong>Hur räknar vi fönster?</strong>
        <ul>
          <li>Varje fönsterbåge räknas som ett fönster.</li>
          <li>2 sidor: ~6 fönster/timme (ca 10 min/fönster)</li>
          <li>4 sidor: ~3 fönster/timme (ca 20 min/fönster)</li>
        </ul>
        <p>Fönsterkarmar och fönsterbleck ingår.</p>
      `;
      showFonsterBtn2.insertAdjacentElement('afterend', info);
    });
  }


  /* ---------------------------------------------------------
     Radio / Checkbox Card Visual State Sync
     (highlight card when its input is checked)
  --------------------------------------------------------- */
  function syncCardState(input) {
    const card = input.closest('.radio-card, .checkbox-card');
    if (!card) return;
    if (input.type === 'radio') {
      // Deselect siblings in same group
      document.querySelectorAll(`input[type="radio"][name="${input.name}"]`).forEach(r => {
        const c = r.closest('.radio-card');
        if (c) c.classList.toggle('card--selected', r.checked);
      });
    } else {
      card.classList.toggle('card--selected', input.checked);
    }
  }

  document.querySelectorAll('.radio-card input, .checkbox-card input[type="checkbox"]').forEach(input => {
    // Initial state
    syncCardState(input);
    input.addEventListener('change', () => syncCardState(input));
  });


  /* ---------------------------------------------------------
     Form Submission Feedback
  --------------------------------------------------------- */
  document.querySelectorAll('.form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();

      const termsCheckbox = form.querySelector('input[name="terms"]');
      if (termsCheckbox && !termsCheckbox.checked) {
        showFormMessage(form, 'Du måste godkänna våra allmänna villkor för att fortsätta.', 'error');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled  = true;
        submitBtn.textContent = 'Skickar…';
      }

      // Simulate a short async call then show success
      setTimeout(() => {
        showFormMessage(form, 'Tack! Vi har tagit emot din förfrågan och återkommer inom kort.', 'success');
        form.reset();
        document.querySelectorAll('.card--selected').forEach(c => c.classList.remove('card--selected'));
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Skicka städförfrågan';
        }
      }, 900);
    });
  });

  function showFormMessage(form, message, type) {
    // Remove existing message
    const existing = form.querySelector('.form-message');
    if (existing) existing.remove();

    const msg = document.createElement('div');
    msg.className = `form-message form-message--${type}`;
    msg.textContent = message;
    form.appendChild(msg);

    // Scroll into view
    msg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Auto-remove after 6 seconds
    setTimeout(() => msg.remove(), 6000);
  }


  /* ---------------------------------------------------------
     URL Param: auto-select service tab on load
     e.g. ?tjanst=storstadning
  --------------------------------------------------------- */
  const params  = new URLSearchParams(window.location.search);
  const service = params.get('tjanst');
  if (service) {
    const matchingTab = document.querySelector(`.tab[data-tab="${service}"]`);
    if (matchingTab) matchingTab.click();
  }

});


/* ---------------------------------------------------------
   Dynamic CSS for card selected state + form messages
   (injected so JS handles the state without editing CSS file)
--------------------------------------------------------- */
(function injectDynamicStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .card--selected {
      border-color: var(--green) !important;
      background: var(--green-light) !important;
    }
    .form-message {
      padding: 14px 18px;
      border-radius: var(--radius);
      font-size: 14px;
      font-weight: 500;
      animation: fadeUp 0.3s ease;
    }
    .form-message--success {
      background: #d1fae5;
      color: #065f46;
      border: 1px solid #6ee7b7;
    }
    .form-message--error {
      background: #fee2e2;
      color: #991b1b;
      border: 1px solid #fca5a5;
    }
    .fonster-info-block {
      background: var(--green-light);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 16px 20px;
      font-size: 14px;
      margin-top: 8px;
      animation: fadeUp 0.25s ease;
    }
    .fonster-info-block ul {
      list-style: disc;
      padding-left: 20px;
      margin: 8px 0;
    }
    .fonster-info-block li {
      margin-bottom: 4px;
    }
  `;
  document.head.appendChild(style);
})();
