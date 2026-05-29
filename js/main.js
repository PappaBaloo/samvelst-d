/* ==========================================================================
   EmailJS Configuration
   --------------------------------------------------------------------------
   1. Create a free account at https://www.emailjs.com
   2. Add an Email Service (Gmail, Outlook, etc.) under "Email Services"
   3. Create an Email Template under "Email Templates" with exactly these
      four variables in the template body:
        To:        {{to_email}}
        Subject:   {{subject}}
        Body:      {{body}}
        Reply-To:  {{reply_to}}
   4. Replace the three placeholder strings below with your real credentials:
   ========================================================================== */
const EMAILJS_PUBLIC_KEY  = 'bbzXw4kHPZ8xL7pGA';   // Account → API Keys
const EMAILJS_SERVICE_ID  = 'service_nscozbg';   // Email Services → Service ID
const EMAILJS_TEMPLATE_ID = 'template_qahsc45';  // Email Templates → Template ID
const BOOKING_RECIPIENT   = 'info@gsgstad.se'; // TODO: change to info@gsggroup.se before going live
const COMPANY_NAME        = 'GSG GROUP AB';

if (typeof emailjs !== 'undefined') emailjs.init(EMAILJS_PUBLIC_KEY);


/* ==========================================================================
   Email helpers
   ========================================================================== */

function _yn(checked)   { return checked ? 'Ja' : 'Nej'; }
function _fd(form, key) { return (new FormData(form).get(key) || '').trim(); }
function _yta()         { return (document.getElementById('ytaInput')?.value.trim()        || '—') + ' m²'; }
function _post()        { return  document.getElementById('postnummerInput')?.value.trim() || '—'; }

function _pets(form, hundName, kattName) {
  const h = form.querySelector(`input[name="${hundName}"]`)?.checked;
  const k = form.querySelector(`input[name="${kattName}"]`)?.checked;
  return [h && 'Hund', k && 'Katt'].filter(Boolean).join(', ') || 'Ingen';
}

const _SEP = '──────────────────────────────────────────────';


/* ==========================================================================
   Email body builders — one per booking type
   ========================================================================== */

function buildHemstadningEmail(form) {
  const fn  = _fd(form, 'fornamn'),  ln  = _fd(form, 'efternamn');
  const tel = _fd(form, 'telefon') || '—',  adr = _fd(form, 'adress');
  const msg = _fd(form, 'meddelande') || '—';

  const freqMap = { varje: 'Varje vecka', varannan: 'Varannan vecka', var4: 'Var fjärde vecka' };
  const freq  = freqMap[_fd(form, 'freq-hem')] || '—';
  const dagEls = [...form.querySelectorAll('input[name="dag-hem"]:checked')];
  const dagar  = dagEls.length
    ? dagEls.map(d => d.value[0].toUpperCase() + d.value.slice(1)).join(', ')
    : '—';

  const ugn  = _yn(form.querySelector('input[name="addon-ugn-hem"]')?.checked);
  const kyl  = _yn(form.querySelector('input[name="addon-kyl-hem"]')?.checked);
  const pets = _pets(form, 'hund-hem', 'katt-hem');

  return {
    subject: 'Bokningsförfrågan — Återkommande hemstädning',
    replyTo: _fd(form, 'email'),
    body:
`Hej ${COMPANY_NAME},

Jag skickar detta via ert bokningsformulär och är intresserad av er tjänst för återkommande hemstädning.

── KONTAKTUPPGIFTER ──────────────────────────
Namn:               ${fn} ${ln}
Telefon:            ${tel}
Adress:             ${adr}, ${_post()}

── UPPDRAGSDETALJER ──────────────────────────
Tjänst:             Återkommande hemstädning
Yta att städa:      ${_yta()}
Intervall:          ${freq}
Önskade dagar:      ${dagar}

── TILLVAL ───────────────────────────────────
Ugnsrengöring:      ${ugn}
Kylskåpsrengöring:  ${kyl}
Husdjur hemma:      ${pets}

── MEDDELANDE ────────────────────────────────
${msg}

${_SEP}
Med vänliga hälsningar,
${fn} ${ln}
${tel}`,
  };
}

function buildStorstadningEmail(form) {
  const fn  = _fd(form, 'fornamn'),  ln  = _fd(form, 'efternamn');
  const tel = _fd(form, 'telefon') || '—',  adr = _fd(form, 'adress');
  const msg = _fd(form, 'meddelande') || '—';
  const fran = _fd(form, 'fran-stor') || '—';
  const till = _fd(form, 'till-stor') || '—';

  const ugn  = _yn(form.querySelector('input[name="addon-ugn-stor"]')?.checked);
  const kyl  = _yn(form.querySelector('input[name="addon-kyl-stor"]')?.checked);
  const fon  = _yn(form.querySelector('input[name="addon-fonster-stor"]')?.checked);
  const pets = _pets(form, 'hund-stor', 'katt-stor');

  return {
    subject: 'Bokningsförfrågan — Storstädning',
    replyTo: _fd(form, 'email'),
    body:
`Hej ${COMPANY_NAME},

Jag skickar detta via ert bokningsformulär och är intresserad av storstädning.

── KONTAKTUPPGIFTER ──────────────────────────
Namn:               ${fn} ${ln}
Telefon:            ${tel}
Adress:             ${adr}, ${_post()}

── UPPDRAGSDETALJER ──────────────────────────
Tjänst:             Storstädning
Yta att städa:      ${_yta()}
Önskat intervall:   ${fran} till ${till}

── TILLVAL ───────────────────────────────────
Ugnsrengöring:      ${ugn}
Kylskåpsrengöring:  ${kyl}
Fönsterputs:        ${fon}
Husdjur hemma:      ${pets}

── MEDDELANDE ────────────────────────────────
${msg}

${_SEP}
Med vänliga hälsningar,
${fn} ${ln}
${tel}`,
  };
}

function buildFlyttstadningEmail(form) {
  const fn  = _fd(form, 'fornamn'),  ln  = _fd(form, 'efternamn');
  const tel = _fd(form, 'telefon') || '—',  adr = _fd(form, 'adress');
  const msg = _fd(form, 'meddelande') || '—';
  const fran = _fd(form, 'fran-flytt') || '—';
  const till = _fd(form, 'till-flytt') || '—';
  const pets = _pets(form, 'hund-flytt', 'katt-flytt');

  const balkong  = _yn(form.querySelector('input[name="addon-balkong-flytt"]')?.checked);
  const forrad   = _yn(form.querySelector('input[name="addon-forrad-flytt"]')?.checked);
  const vattenlas = form.querySelector('input[name="addon-forrad-flytt"]')?.checked
    ? (_fd(form, 'vattenlas-flytt') || '0')
    : '—';
  const frost    = _yn(form.querySelector('input[name="addon-frost-flytt"]')?.checked);
  const eldstad  = _yn(form.querySelector('input[name="addon-eldstad-flytt"]')?.checked);
  const ovriga   = _fd(form, 'ovriga-flytt') || '—';

  return {
    subject: 'Bokningsförfrågan — Flyttstädning',
    replyTo: _fd(form, 'email'),
    body:
`Hej ${COMPANY_NAME},

Jag skickar detta via ert bokningsformulär och är intresserad av flyttstädning.

── KONTAKTUPPGIFTER ──────────────────────────
Namn:               ${fn} ${ln}
Telefon:            ${tel}
Adress:             ${adr}, ${_post()}

── UPPDRAGSDETALJER ──────────────────────────
Tjänst:             Flyttstädning
Yta att städa:      ${_yta()}
Önskat intervall:   ${fran} till ${till}

Ingår alltid:       Ugnsrengöring, kylskåpsrengöring & fönsterputs

── TILLVAL ───────────────────────────────────
Balkong:            ${balkong}
Förråd/Garage:      ${forrad}
Antal vattenlås:    ${vattenlas}
Avfrostning frysskåp: ${frost}
Eldstädsrengöring:  ${eldstad}
Husdjur hemma:      ${pets}

── ÖVRIGA ÖNSKEMÅL ───────────────────────────
${ovriga}

── MEDDELANDE ────────────────────────────────
${msg}

${_SEP}
Med vänliga hälsningar,
${fn} ${ln}
${tel}`,
  };
}

function buildEnastakaEmail(form) {
  const fn  = _fd(form, 'fornamn'),  ln  = _fd(form, 'efternamn');
  const tel = _fd(form, 'telefon') || '—',  adr = _fd(form, 'adress');
  const msg = _fd(form, 'meddelande') || '—';
  const fran = _fd(form, 'fran-enstaka') || '—';
  const till = _fd(form, 'till-enstaka') || '—';

  const ugn  = _yn(form.querySelector('input[name="addon-ugn-enstaka"]')?.checked);
  const kyl  = _yn(form.querySelector('input[name="addon-kyl-enstaka"]')?.checked);
  const fon  = _yn(form.querySelector('input[name="addon-fonster-enstaka"]')?.checked);
  const pets = _pets(form, 'hund-enstaka', 'katt-enstaka');

  return {
    subject: 'Bokningsförfrågan — Enstaka hemstädning',
    replyTo: _fd(form, 'email'),
    body:
`Hej ${COMPANY_NAME},

Jag skickar detta via ert bokningsformulär och är intresserad av enstaka hemstädning.

── KONTAKTUPPGIFTER ──────────────────────────
Namn:               ${fn} ${ln}
Telefon:            ${tel}
Adress:             ${adr}, ${_post()}

── UPPDRAGSDETALJER ──────────────────────────
Tjänst:             Enstaka hemstädning
Yta att städa:      ${_yta()}
Önskat intervall:   ${fran} till ${till}

── TILLVAL ───────────────────────────────────
Ugnsrengöring:      ${ugn}
Kylskåpsrengöring:  ${kyl}
Fönsterputs:        ${fon}
Husdjur hemma:      ${pets}

── MEDDELANDE ────────────────────────────────
${msg}

${_SEP}
Med vänliga hälsningar,
${fn} ${ln}
${tel}`,
  };
}

function buildForetagsstadningEmail(form) {
  const fn  = _fd(form, 'fornamn'),  ln  = _fd(form, 'efternamn');
  const tel = _fd(form, 'telefon') || '—',  adr = _fd(form, 'adress');
  const msg = _fd(form, 'meddelande') || '—';
  const fran = _fd(form, 'fran-fon') || '—';
  const till = _fd(form, 'till-fon') || '—';
  const antal = _fd(form, 'antal-fonster-fon') || '—';
  const stege = _yn(form.querySelector('input[name="stege-fon"]')?.checked);
  const pets  = _pets(form, 'hund-fon', 'katt-fon');

  return {
    subject: 'Bokningsförfrågan — Företagsstädning',
    replyTo: _fd(form, 'email'),
    body:
`Hej ${COMPANY_NAME},

Jag skickar detta via ert bokningsformulär och är intresserad av företagsstädning.

── KONTAKTUPPGIFTER ──────────────────────────
Namn:               ${fn} ${ln}
Telefon:            ${tel}
Adress:             ${adr}, ${_post()}

── UPPDRAGSDETALJER ──────────────────────────
Tjänst:             Företagsstädning
Yta att städa:      ${_yta()}
Önskat intervall:   ${fran} till ${till}

── TILLVAL ───────────────────────────────────
Stege behövs:       ${stege}
Antal fönster:      ${antal} st
Husdjur på plats:   ${pets}

── MEDDELANDE ────────────────────────────────
${msg}

${_SEP}
Med vänliga hälsningar,
${fn} ${ln}
${tel}`,
  };
}

function buildDodsbostadningEmail(form) {
  const fn  = _fd(form, 'fornamn'),  ln  = _fd(form, 'efternamn');
  const tel = _fd(form, 'telefon') || '—',  adr = _fd(form, 'adress');
  const msg = _fd(form, 'meddelande') || '—';
  const fran = _fd(form, 'fran-dodsbo') || '—';
  const till = _fd(form, 'till-dodsbo') || '—';

  const typMap = { lagenhet: 'Lägenhet', villa: 'Villa', radhus: 'Radhus' };
  const typ    = typMap[_fd(form, 'typ-dodsbo')] || '—';

  const tomning   = _yn(form.querySelector('input[name="addon-tomning-dodsbo"]')?.checked);
  const sortering = _yn(form.querySelector('input[name="addon-sortering-dodsbo"]')?.checked);
  const forrad    = _yn(form.querySelector('input[name="addon-forrad-dodsbo"]')?.checked);
  const hiss      = _yn(form.querySelector('input[name="addon-hiss-dodsbo"]')?.checked);

  return {
    subject: 'Bokningsförfrågan — Dödsbo städning/tömning',
    replyTo: _fd(form, 'email'),
    body:
`Hej ${COMPANY_NAME},

Jag skickar detta via ert bokningsformulär och är intresserad av dödsbo städning/tömning.

── KONTAKTUPPGIFTER ──────────────────────────
Namn:               ${fn} ${ln}
Telefon:            ${tel}
Adress:             ${adr}, ${_post()}

── UPPDRAGSDETALJER ──────────────────────────
Tjänst:             Dödsbo städning/tömning
Yta att städa:      ${_yta()}
Typ av bostad:      ${typ}
Önskat intervall:   ${fran} till ${till}

── TILLVAL ───────────────────────────────────
Tömning/Bortforsling: ${tomning}
Sortering:          ${sortering}
Förråd/Garage:      ${forrad}
Hiss finns:         ${hiss}

── MEDDELANDE ────────────────────────────────
${msg}

${_SEP}
Med vänliga hälsningar,
${fn} ${ln}
${tel}`,
  };
}

const EMAIL_BUILDERS = {
  'form-hemstadning':       buildHemstadningEmail,
  'form-storstadning':      buildStorstadningEmail,
  'form-flyttstadning':     buildFlyttstadningEmail,
  'form-enstaka':           buildEnastakaEmail,
  'form-foretagsstadning':  buildForetagsstadningEmail,
  'form-dodsbostadning':    buildDodsbostadningEmail,
};


/* ==========================================================================
   Rotating headline (index.html)
   ========================================================================== */
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


/* ==========================================================================
   FAQ accordion
   ========================================================================== */
document.querySelectorAll('.faq-q').forEach(q => {
  q.addEventListener('click', () => {
    const item = q.parentElement;
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
});


/* ==========================================================================
   Mega menu
   ========================================================================== */
document.querySelectorAll('.services-menu').forEach(menu => {
  const megaMenu = menu.querySelector('.mega-menu');
  let closeTimer;
  const openMenu  = () => { clearTimeout(closeTimer); menu.classList.add('open'); };
  const closeMenu = () => { clearTimeout(closeTimer); closeTimer = setTimeout(() => menu.classList.remove('open'), 220); };
  menu.addEventListener('mouseenter', openMenu);
  menu.addEventListener('mouseleave', closeMenu);
  menu.addEventListener('focusin',    openMenu);
  menu.addEventListener('focusout',   closeMenu);
  if (megaMenu) {
    megaMenu.addEventListener('mouseenter', openMenu);
    megaMenu.addEventListener('mouseleave', closeMenu);
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') document.querySelectorAll('.services-menu.open').forEach(m => m.classList.remove('open'));
});


/* ==========================================================================
   Hero booking button (index.html)
   ========================================================================== */
const heroBoka = document.getElementById('heroBoka');
if (heroBoka) {
  heroBoka.addEventListener('click', function () {
    const yta        = document.getElementById('heroYta').value.trim();
    const postnummer = document.getElementById('heroPostnummer').value.trim();
    const params     = new URLSearchParams();
    if (yta)        params.set('yta',        yta);
    if (postnummer) params.set('postnummer', postnummer);
    window.location.href = 'booking.html?' + params.toString();
  });
}


/* ==========================================================================
   DOMContentLoaded — booking page logic + mobile nav
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {

  // ── Populate antal fönster selects ──────────────────────────────────────
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

  // ── Service tab switching ────────────────────────────────────────────────
  const tabs   = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.panel');

  if (tabs.length) {
    function activateTab(tabKey) {
      tabs.forEach(t   => t.classList.toggle('tab--active',    t.dataset.tab === tabKey));
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

    const params          = new URLSearchParams(window.location.search);
    const ytaInput        = document.getElementById('ytaInput');
    const postnummerInput = document.getElementById('postnummerInput');
    if (ytaInput        && params.get('yta'))        ytaInput.value        = params.get('yta');
    if (postnummerInput && params.get('postnummer')) postnummerInput.value = params.get('postnummer');

    activateTab(params.get('tjanst') || 'hemstadning');
  }

  // ── Mobile Nav Toggle ────────────────────────────────────────────────────
  const navToggle  = document.getElementById('navToggle');
  const navMobile  = document.getElementById('navMobile');
  const navOverlay = document.getElementById('navOverlay');
  const navClose   = document.getElementById('navClose');

  function openMobileNav() {
    navMobile.classList.add('open');
    if (navOverlay) navOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    navToggle.setAttribute('aria-expanded', 'true');
  }
  function closeMobileNav() {
    navMobile.classList.remove('open');
    if (navOverlay) navOverlay.classList.remove('open');
    document.body.style.overflow = '';
    navToggle.setAttribute('aria-expanded', 'false');
    document.querySelector('.nav-mobile-services')?.classList.remove('open');
  }

  if (navToggle && navMobile) {
    navToggle.addEventListener('click', openMobileNav);
    if (navClose)   navClose.addEventListener('click', closeMobileNav);
    if (navOverlay) navOverlay.addEventListener('click', closeMobileNav);
    navMobile.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMobileNav));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMobileNav(); });
  }

  // ── Mobile Nav Services sub-menu ────────────────────────────────────────
  const mobileServicesToggle = document.querySelector('.nav-mobile-services-toggle');
  const mobileServicesItem   = document.querySelector('.nav-mobile-services');
  if (mobileServicesToggle && mobileServicesItem) {
    mobileServicesToggle.addEventListener('click', () => {
      mobileServicesItem.classList.toggle('open');
    });
  }

  // ── Storstädning: fönsterputs toggle ────────────────────────────────────
  const addonFonsterStor   = document.getElementById('addonFonster-stor');
  const windowDetailsStor  = document.getElementById('windowDetails-stor');
  const windowFieldsStor   = document.getElementById('windowFields-stor');
  if (addonFonsterStor) {
    addonFonsterStor.addEventListener('change', () => {
      const on = addonFonsterStor.checked;
      if (windowDetailsStor) windowDetailsStor.classList.toggle('open', on);
      if (windowFieldsStor)  windowFieldsStor.style.display = on ? 'block' : 'none';
    });
  }

  // ── Enstaka hemstädning: fönsterputs toggle ─────────────────────────────
  const addonFonsterEnstaka = document.getElementById('addonFonster-enstaka');
  const windowFieldsEnstaka = document.getElementById('windowFields-enstaka');
  if (addonFonsterEnstaka) {
    addonFonsterEnstaka.addEventListener('change', () => {
      if (windowFieldsEnstaka) windowFieldsEnstaka.style.display = addonFonsterEnstaka.checked ? 'block' : 'none';
    });
  }

  // ── Flyttstädning: förråd/garage vattenlås toggle ───────────────────────
  const addonForradFlytt  = document.getElementById('addonForrad-flytt');
  const forradFieldsFlytt = document.getElementById('forradFields-flytt');
  if (addonForradFlytt) {
    addonForradFlytt.addEventListener('change', () => {
      if (forradFieldsFlytt) forradFieldsFlytt.style.display = addonForradFlytt.checked ? 'block' : 'none';
    });
  }

  // ── Fönsterputs info button (företagsstädning panel) ────────────────────
  const showFonsterBtn2  = document.getElementById('showFonsterInfo2');
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

  // ── Radio / Checkbox / Day-pill card visual state ────────────────────────
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

  // ── Form submission → EmailJS ────────────────────────────────────────────
  function showFormMessage(form, message, type) {
    const existing = form.querySelector('.form-message');
    if (existing) existing.remove();
    const msg = document.createElement('div');
    msg.className = `form-message form-message--${type}`;
    msg.textContent = message;
    form.appendChild(msg);
    msg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => msg.remove(), 7000);
  }

  function resetForm(form) {
    form.reset();
    form.querySelectorAll('.card--selected').forEach(c => c.classList.remove('card--selected'));
    form.querySelectorAll('[id^="windowFields-"]').forEach(el => el.style.display = 'none');
    form.querySelectorAll('.window-details').forEach(el => el.classList.remove('open'));
  }

  document.querySelectorAll('.form').forEach(form => {
    form.addEventListener('submit', async e => {
      e.preventDefault();

      // Terms check
      const terms = form.querySelector('input[name="terms"]');
      if (terms && !terms.checked) {
        showFormMessage(form, 'Du måste godkänna våra allmänna villkor för att fortsätta.', 'error');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Skickar…'; }

      const builder = EMAIL_BUILDERS[form.id];
      if (!builder) return;

      const { subject, body, replyTo } = builder(form);

      try {
        // Guard: credentials not yet configured
        if (typeof emailjs === 'undefined' || EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
          throw Object.assign(new Error('not_configured'), { code: 'not_configured' });
        }

        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          reply_to: replyTo,
          subject,
          body,
        });

        showFormMessage(form, 'Tack! Vi har tagit emot din förfrågan och återkommer inom kort.', 'success');
        resetForm(form);

      } catch (err) {
        const msg = err.code === 'not_configured'
          ? `E-posttjänsten är inte konfigurerad ännu. Kontakta oss direkt på ${BOOKING_RECIPIENT}.`
          : 'Något gick fel vid utskick. Försök igen eller kontakta oss direkt.';
        showFormMessage(form, msg, 'error');
        console.error('EmailJS error:', err);
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Skicka städförfrågan'; }
      }
    });
  });

});
