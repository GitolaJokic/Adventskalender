(() => {
  const $ = id => document.getElementById(id);
  const draftKey = 'dezemberpost:editor-draft';
  const fields = ['title', 'text', 'personalText', 'image', 'imageAlt', 'video', 'voucherTitle', 'voucherDescription'];
  let data, day = 1;
  function valid(value) { return value && Number.isInteger(value.year) && value.year >= 2000 && value.year <= 2200 && Array.isArray(value.days) && value.days.every(d => d && Number.isInteger(d.day) && d.day >= 1 && d.day <= 24) && new Set(value.days.map(d => d.day)).size === value.days.length; }
  function save() {
    try { localStorage.setItem(draftKey, JSON.stringify(data)); $('status').textContent = 'Entwurf im Browser gespeichert'; } catch { $('status').textContent = 'Bitte exportieren – Browserspeicher nicht verfügbar.'; }
  }
  function loadDay() {
    const item = data.days.find(d => d.day === day) || {};
    for (const field of fields) $(field).value = field === 'voucherTitle' ? item.voucher?.title || '' : field === 'voucherDescription' ? item.voucher?.description || '' : item[field] || '';
    $('day-heading').textContent = `${day}. Dezember`;
    $('personal-fields').hidden = day !== 24;
    for (const button of $('day-nav').children) { const active = Number(button.textContent) === day; button.classList.toggle('active', active); button.setAttribute('aria-current', active ? 'true' : 'false'); }
  }
  function load() {
    for (const field of ['year', 'name', 'greeting']) $(field).value = data[field] || '';
    loadDay();
  }
  function storeDay() {
    const item = { day };
    for (const field of ['title', 'text', 'image', 'imageAlt', 'video']) if ($(field).value) item[field] = $(field).value;
    if (day === 24 && $('personalText').value) item.personalText = $('personalText').value;
    if ($('voucherTitle').value || $('voucherDescription').value) item.voucher = { title: $('voucherTitle').value, description: $('voucherDescription').value };
    data.days = data.days.filter(d => d.day !== day).concat(item).sort((a, b) => a.day - b.day); save();
  }
  for (let i = 1; i <= 24; i++) { const button = document.createElement('button'); button.textContent = i; button.type = 'button'; button.addEventListener('click', () => { day = i; loadDay(); }); $('day-nav').append(button); }
  for (const field of fields) $(field).addEventListener('input', () => { if (data) storeDay(); });
  for (const field of ['year', 'name', 'greeting']) $(field).addEventListener('input', () => { if (!data) return; if (field === 'year' && !$('year').checkValidity()) { $('status').textContent = 'Bitte ein Jahr zwischen 2000 und 2200 eintragen.'; return; } data[field] = field === 'year' ? Number($(field).value) : $(field).value; save(); });
  $('export').addEventListener('click', () => {
    if (!data || !$('year').checkValidity()) { $('status').textContent = 'Bitte zuerst ein gültiges Jahr eintragen.'; return; }
    const blob = new Blob([JSON.stringify(data, null, 2) + '\n'], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'content.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); $('status').textContent = 'Exportiert – jetzt content.json auf GitHub ersetzen.';
  });
  $('import').addEventListener('change', async () => {
    const file = $('import').files[0]; if (!file) return;
    try { const imported = JSON.parse(await file.text()); if (!valid(imported)) throw new Error(); if (data && !window.confirm('Aktuellen Entwurf durch diese Datei ersetzen?')) return; data = imported; load(); save(); } catch { $('status').textContent = 'Ungültige Kalenderdatei. Bitte content.json mit Jahr und days-Liste wählen.'; }
    $('import').value = '';
  });
  (async () => {
    try { const draft = JSON.parse(localStorage.getItem(draftKey)); if (valid(draft)) { data = draft; $('status').textContent = 'Gespeicherten Browserentwurf geladen'; } } catch {}
    if (!data) { try { const response = await fetch('./content.json', { cache: 'no-cache' }); const initial = await response.json(); if (!valid(initial)) throw new Error(); data = initial; } catch { data = { year: 2026, name: '', greeting: 'Schön, dass du da bist.', days: [] }; $('status').textContent = 'Leerer Entwurf – vorhandene content.json bei Bedarf importieren.'; } }
    load();
  })();
})();
