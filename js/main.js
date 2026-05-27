// ── Rotating headline words (index.html) ──
const rotatingWord = document.getElementById('rotatingWord');
if (rotatingWord) {
  const words = ['hemstädning', 'storstädning', 'flyttstädning', 'företagsstädning'];
  let idx = 0;

  function typeWord(word, callback) {
    rotatingWord.textContent = '';
    let i = 0;
    const interval = setInterval(() => {
      rotatingWord.textContent += word[i];
      i++;
      if (i === word.length) { clearInterval(interval); setTimeout(callback, 1800); }
    }, 60);
  }

  function eraseWord(callback) {
    const interval = setInterval(() => {
      rotatingWord.textContent = rotatingWord.textContent.slice(0, -1);
      if (rotatingWord.textContent.length === 0) { clearInterval(interval); callback(); }
    }, 35);
  }

  function loop() {
    typeWord(words[idx], () => {
      eraseWord(() => { idx = (idx + 1) % words.length; loop(); });
    });
  }
  loop();
}

// ── FAQ accordion ──
document.querySelectorAll('.faq-q').forEach(q => {
  q.addEventListener('click', () => {
    const item = q.parentElement;
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
});

// ── Mega menu ──
document.querySelectorAll('.services-menu').forEach(menu => {
  const megaMenu = menu.querySelector('.mega-menu');
  let closeTimer;
  const openMenu = () => { clearTimeout(closeTimer); menu.classList.add('open'); };
  const closeMenu = () => { clearTimeout(closeTimer); closeTimer = setTimeout(() => menu.classList.remove('open'), 220); };
  menu.addEventListener('mouseenter', openMenu);
  menu.addEventListener('mouseleave', closeMenu);
  menu.addEventListener('focusin', openMenu);
  menu.addEventListener('focusout', closeMenu);
  if (megaMenu) {
    megaMenu.addEventListener('mouseenter', openMenu);
    megaMenu.addEventListener('mouseleave', closeMenu);
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') document.querySelectorAll('.services-menu.open').forEach(m => m.classList.remove('open'));
});

// ── Hero booking button (index.html) ──
const heroBoka = document.getElementById('heroBoka');
if (heroBoka) {
  heroBoka.addEventListener('click', function () {
    const yta = document.getElementById('heroYta').value.trim();
    const postnummer = document.getElementById('heroPostnummer').value.trim();
    const params = new URLSearchParams();
    if (yta) params.set('yta', yta);
    if (postnummer) params.set('postnummer', postnummer);
    window.location.href = 'booking.html?' + params.toString();
  });
}

document.addEventListener('DOMContentLoaded', () => {

  // ── Populate antal fönster selects (booking.html) ──
  ['antal-fonster-stor', 'antal-fonster-fon', 'antal-fonster-enstaka'].forEach(name => {
    const sel = document.querySelector(`select[name="${name}"]`);
    if (!sel) return;
    for (let i = 1; i <= 100; i++) {
      const opt = document.createElement('option');
      opt.value = String(i);
      opt.textContent = String(i);
      sel.appendChild(opt);
    }
  });

  // ── Service Tab Switching (booking.html) ──
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.panel');

  if (tabs.length) {
    function activateTab(tabKey) {
      tabs.forEach(t => t.classList.toggle('tab--active', t.dataset.tab === tabKey));
      panels.forEach(p => p.classList.toggle('panel--active', p.id === `panel-${tabKey}`));
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        activateTab(tab.dataset.tab);
        if (window.innerWidth <= 768) {
          const ap = document.getElementById(`panel-${tab.dataset.tab}`);
          if (ap) setTimeout(() => ap.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
        }
      });
    });

    // Read URL params and pre-fill inputs
    const params = new URLSearchParams(window.location.search);
    const ytaInput = document.getElementById('ytaInput');
    const postnummerInput = document.getElementById('postnummerInput');
    if (ytaInput && params.get('yta')) ytaInput.value = params.get('yta');
    if (postnummerInput && params.get('postnummer')) postnummerInput.value = params.get('postnummer');

    activateTab(params.get('tjanst') || 'hemstadning');
  }

  // ── Mobile Nav Toggle ──
  const navToggle = document.getElementById('navToggle');
  const navMobile = document.getElementById('navMobile');
  if (navToggle && navMobile) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMobile.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    navMobile.querySelectorAll('a').forEach(link => link.addEventListener('click', () => navMobile.classList.remove('open')));
  }

  // ── Storstädning: fönsterputs toggle ──
  const addonFonsterStor = document.getElementById('addonFonster-stor');
  const windowDetailsStor = document.getElementById('windowDetails-stor');
  const windowFieldsStor = document.getElementById('windowFields-stor');
  if (addonFonsterStor) {
    addonFonsterStor.addEventListener('change', () => {
      const on = addonFonsterStor.checked;
      if (windowDetailsStor) windowDetailsStor.classList.toggle('open', on);
      if (windowFieldsStor) windowFieldsStor.style.display = on ? 'block' : 'none';
    });
  }

  // ── Enstaka hemstädning: fönsterputs toggle ──
  const addonFonsterEnstaka = document.getElementById('addonFonster-enstaka');
  const windowFieldsEnstaka = document.getElementById('windowFields-enstaka');
  if (addonFonsterEnstaka) {
    addonFonsterEnstaka.addEventListener('change', () => {
      if (windowFieldsEnstaka) windowFieldsEnstaka.style.display = addonFonsterEnstaka.checked ? 'block' : 'none';
    });
  }

  // ── Fönsterputs info button (företagsstädning panel) ──
  const showFonsterBtn2 = document.getElementById('showFonsterInfo2');
  const fonsterInfoBlock = document.getElementById('fonsterInfoBlock');
  if (showFonsterBtn2 && fonsterInfoBlock) {
    showFonsterBtn2.addEventListener('click', () => {
      const isOpen = fonsterInfoBlock.classList.contains('open');
      fonsterInfoBlock.classList.toggle('open', !isOpen);
      showFonsterBtn2.textContent = isOpen ? 'Så räknar vi fönster ›' : 'Dölj fönsterinfo ‹';
      fonsterInfoBlock.innerHTML = isOpen ? '' : `
        <strong>Hur räknar vi fönster?</strong>
        <ul>
          <li>Varje fönsterbåge räknas som ett fönster.</li>
          <li>2 sidor: ~6 fönster/timme (ca 10 min/fönster)</li>
          <li>4 sidor: ~3 fönster/timme (ca 20 min/fönster)</li>
        </ul>
        <p>Fönsterkarmar och fönsterbleck ingår.</p>
      `;
    });
  }

  // ── Radio / Checkbox / Day-pill Card Visual State Sync ──
  function syncCardState(input) {
    const card = input.closest('.radio-card, .checkbox-card, .day-pill');
    if (!card) return;
    if (input.type === 'radio') {
      document.querySelectorAll(`input[type="radio"][name="${input.name}"]`).forEach(r => {
        const c = r.closest('.radio-card');
        if (c) c.classList.toggle('card--selected', r.checked);
      });
    } else {
      card.classList.toggle('card--selected', input.checked);
    }
  }

  document.querySelectorAll('.radio-card input, .checkbox-card input, .day-pill input').forEach(input => {
    syncCardState(input);
    input.addEventListener('change', () => syncCardState(input));
  });

  // ── Form Submission Feedback ──
  document.querySelectorAll('.form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();

      const termsCheckbox = form.querySelector('input[name="terms"]');
      if (termsCheckbox && !termsCheckbox.checked) {
        showFormMessage(form, 'Du måste godkänna våra allmänna villkor för att fortsätta.', 'error');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Skickar…'; }

      setTimeout(() => {
        showFormMessage(form, 'Tack! Vi har tagit emot din förfrågan och återkommer inom kort.', 'success');
        form.reset();
        document.querySelectorAll('.card--selected').forEach(c => c.classList.remove('card--selected'));
        document.querySelectorAll('[id^="windowFields-"]').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.window-details').forEach(el => el.classList.remove('open'));
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Skicka städförfrågan'; }
      }, 900);
    });
  });

  function showFormMessage(form, message, type) {
    const existing = form.querySelector('.form-message');
    if (existing) existing.remove();
    const msg = document.createElement('div');
    msg.className = `form-message form-message--${type}`;
    msg.textContent = message;
    form.appendChild(msg);
    msg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => msg.remove(), 6000);
  }

});
