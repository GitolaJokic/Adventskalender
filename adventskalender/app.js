(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const preview = new URLSearchParams(location.search).get('vorschau') === '1';
  const motifs = ['✧', '❋', '♡', '✳', '☆', '❄', '☾', '✧', '❋', '☆', '♡', '✳', '❄', '✧', '☾', '♡', '❋', '☆', '✳', '❄', '♡', '☾', '✧', '☆'];
  // Optional review date is honoured only in the explicit preview mode.
  const dateParam = preview && new URLSearchParams(location.search).get('datum');
  let previewTime = null;
  if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    const [year, month, day] = dateParam.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) previewTime = date.getTime();
  }
  const calendarTime = () => previewTime === null ? Date.now() : previewTime;
  const animals = ['teddy', 'cow', 'snowflake'];
  let config, opened = [], redeemed = [], activeDay, animating = false;
  const read = key => { if (preview) return []; try { const v = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(v) ? v : []; } catch { return []; } };
  const persist = (key, value) => { if (preview) return; try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Reading remains possible when storage is unavailable. */ } };
  const key = suffix => `dezemberpost:${config.year}:${preview ? 'preview:' : ''}${suffix}`;
  const available = day => preview || calendarTime() >= new Date(config.year, 11, day).getTime();
  // A previous calendar day is visually open even if this browser never visited it.
  const past = day => (!preview || previewTime !== null) && calendarTime() >= new Date(config.year, 11, day + 1).getTime();
  const isOpen = day => available(day) && (past(day) || opened.includes(day));
  function element(tag, text, className) { const el = document.createElement(tag); if (text !== undefined) el.textContent = text; if (className) el.className = className; return el; }
  function render() {
    if (animating) return;
    const now = new Date(calendarTime());
    $('doors').replaceChildren();
    for (let day = 1; day <= 24; day++) {
      const unlocked = available(day), seen = isOpen(day);
      const today = now.getFullYear() === config.year && now.getMonth() === 11 && now.getDate() === day;
      const button = element('button', undefined, `door${unlocked ? '' : ' locked'}${seen ? ' opened' : ''}${today ? ' today' : ''}`);
      button.type = 'button';
      button.setAttribute('aria-label', `${day}. Dezember${seen ? ', bereits geöffnet' : unlocked ? ', Türchen öffnen' : ', noch geschlossen'}`);
      const motif = element('span', motifs[day - 1], 'motif'); motif.setAttribute('aria-hidden', 'true');
      const leaf = element('span', undefined, 'door-leaf');
      const front = element('span', undefined, 'door-front');
      const panel = element('span', undefined, 'door-panel'); panel.setAttribute('aria-hidden', 'true');
      const handle = element('span', undefined, 'door-handle'); handle.setAttribute('aria-hidden', 'true');
      front.append(motif, element('span', String(day).padStart(2, '0'), 'number'), panel, handle);
      const back = element('span', undefined, 'door-back');
      back.append(element('span', '♡', 'back-heart'), element('span', String(day).padStart(2, '0'), 'back-number'));
      back.setAttribute('aria-hidden', 'true');
      leaf.append(front, back);
      const animal = element('img', undefined, 'door-animal');
      animal.src = `./assets/${animals[(day - 1) % animals.length]}.svg`;
      animal.alt = ''; animal.setAttribute('aria-hidden', 'true');
      const rig = element('span', undefined, 'animal-rig'); rig.setAttribute('aria-hidden', 'true');
      const species = animals[(day - 1) % animals.length];
      rig.setAttribute('data-animal', species);
      rig.append(animal, element('span', undefined, 'animal-arm arm-left'), element('span', undefined, 'animal-arm arm-right'));
const hinges = element('span', undefined, 'door-hinges'); hinges.setAttribute('aria-hidden', 'true');
      button.append(leaf, hinges, rig);
      if (seen) { const mark = element('span', '♡', 'opened-mark'); mark.setAttribute('aria-hidden', 'true'); button.append(mark); }
      button.addEventListener('click', () => animateDoor(day, button)); $('doors').append(button);
    }
  }
  function animateDoor(day, button) {
    if (animating || $('door-dialog').open) return;
    activeDay = day;
    if (isOpen(day) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { openDoor(day); return; }
    animating = true;
    const locked = !available(day);
    const animationClass = locked ? 'scolding' : 'opening';
    const animal = button.querySelector('.door-animal');
    if (locked) animal.src = `./assets/${animals[(day - 1) % animals.length]}-strict.svg`;
    button.classList.add(animationClass);
    button.setAttribute('aria-busy', 'true');
    // Finish once, even if an animation event and the safety timer arrive together.
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      animating = false;
      button.classList.remove(animationClass);
      animal.src = `./assets/${animals[(day - 1) % animals.length]}.svg`;
      button.removeAttribute('aria-busy');
      openDoor(day);
    };
    button.addEventListener('animationend', event => { if (event.animationName === (locked ? 'door-locked' : day % 2 === 0 ? 'animal-hop-and-turn' : 'animal-turn-door')) finish(); });
    setTimeout(finish, locked ? 800 : day % 2 === 0 ? 3250 : 2600);
  }

  function mediaPath(path) { try { const url = new URL(path, location.href); return ['http:', 'https:', 'file:'].includes(url.protocol) ? url.href : null; } catch { return null; } }
  function openDoor(day) {
    activeDay = day;
    const area = $('door-content'); area.replaceChildren();
    const animal = element('img', undefined, 'dialog-animal');
    animal.src = `./assets/${animals[(day - 1) % animals.length]}${available(day) ? '-alive' : '-strict'}.svg`; animal.alt = '';
    area.append(element('span', `${String(day).padStart(2, '0')} / DEZEMBER`, 'eyebrow'), animal);
    if (!available(day)) {
      area.append(element('h2', 'Na, nicht schummeln!'), element('p', `Noch ist es nicht so weit. Dieses Türchen bewachen wir bis zum ${day}. Dezember ${config.year}.`));
    } else {
      const data = config.days.find(item => item.day === day);
      if (!opened.includes(day)) { opened.push(day); persist(key('opened'), opened); render(); }
      if (!data || ![data.title, data.text, data.image, data.video, data.voucher?.title].some(Boolean)) {
        const box = element('div', undefined, 'empty-door');
        box.append(element('div', '✧', 'empty-symbol'), element('h2', 'Platz für etwas Schönes.'), element('p', 'Dieses Türchen wartet noch auf seine kleine Überraschung.')); area.append(box);
      } else {
        area.append(element('h2', data.title || `Dein ${day}. Dezember`));
        if (data.text) area.append(element('p', data.text, 'letter-text'));
        if (data.image && mediaPath(data.image)) {
          const img = element('img'); img.src = mediaPath(data.image); img.alt = data.imageAlt || 'Deine persönliche Überraschung'; img.addEventListener('error', () => img.replaceWith(element('p', 'Das Foto konnte nicht geladen werden. Bitte versuche es mit Internet erneut.'))); area.append(img);
        }
        if (data.video && mediaPath(data.video)) {
          const video = element('video'); video.controls = true; video.playsInline = true; video.preload = 'metadata'; video.src = mediaPath(data.video); video.addEventListener('error', () => video.replaceWith(element('p', 'Das Video konnte nicht geladen werden. Bitte versuche es mit Internet erneut.'))); area.append(video);
        }
        if (data.voucher?.title) {
          const box = element('section', undefined, 'voucher'); box.append(element('span', 'EIN GUTSCHEIN FÜR DICH', 'eyebrow'), element('h3', data.voucher.title));
          if (data.voucher.description) box.append(element('p', data.voucher.description));
          const button = element('button', redeemed.includes(day) ? 'Schon eingelöst ♡' : 'Als eingelöst markieren'); button.disabled = redeemed.includes(day);
          button.addEventListener('click', () => { if (!redeemed.includes(day)) redeemed.push(day); persist(key('redeemed'), redeemed); button.textContent = 'Schon eingelöst ♡'; button.disabled = true; }); box.append(button); area.append(box);
        }
      }
    }
    const title = area.querySelector('h2');
    if (title) title.id = 'door-title';
    $('door-dialog').showModal();
    $('door-content').scrollTop = 0;
  }
  const closeDoor = () => { $('door-content').querySelectorAll('video').forEach(v => v.pause()); $('door-dialog').close(); };
  $('close-dialog').addEventListener('click', closeDoor);
  $('door-dialog').addEventListener('close', () => $('door-content').querySelectorAll('video').forEach(v => v.pause()));
  $('door-dialog').addEventListener('close', () => {
    if (activeDay) $('doors').children[activeDay - 1]?.focus();
  });
  $('door-dialog').addEventListener('click', event => {
    if (event.target !== $('door-dialog')) return;
    const r = $('door-dialog').getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closeDoor();
  });
  fetch('./content.json', { cache: 'no-cache' }).then(r => { if (!r.ok) throw new Error('content'); return r.json(); }).then(data => {
    if (!Number.isInteger(data.year) || data.year < 2000 || data.year > 2200 || !Array.isArray(data.days)) throw new Error('config');
    config = data; opened = read(key('opened')).filter((d, i, a) => Number.isInteger(d) && d >= 1 && d <= 24 && a.indexOf(d) === i); redeemed = read(key('redeemed'));
    $('heading').replaceChildren(element('span', `${config.name || 'Wioletta'}s `), element('em', 'Adventskalender'));
    render(); setInterval(render, 30000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
  }).catch(() => { $('load-error').hidden = false; });
  if ('serviceWorker' in navigator && ['https:', 'http:'].includes(location.protocol)) navigator.serviceWorker.register('./sw.js').catch(() => {});
})();
