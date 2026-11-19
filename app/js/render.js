// Rendering: the checklist rows, the guide detail pane, the roadmap, the
// missables page and the sources page. All text comes from the data files;
// nothing here fetches the network.
import { applyFilters, displayDescription, displayName, gradeCounts, isSpoiled, kindLabel } from './filters.js';
import { isEarned } from './store.js';

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function gradeTag(trophy) {
  return el('span', `tag grade-${trophy.grade}`, trophy.grade);
}

export function renderProgress(trophies, state) {
  const earned = state.earned.length;
  document.getElementById('earnedCount').textContent = String(earned);
  const bar = document.getElementById('progressBar');
  bar.setAttribute('aria-valuenow', String(earned));
  document.getElementById('progressFill').style.width = `${(earned / trophies.length) * 100}%`;
  const counts = gradeCounts(trophies, state);
  const holder = document.getElementById('gradeCounts');
  holder.replaceChildren();
  for (const grade of ['platinum', 'gold', 'silver', 'bronze']) {
    const [got, total] = counts[grade];
    const span = el('span', null, `${grade} `);
    span.appendChild(el('b', null, `${got}/${total}`));
    holder.appendChild(span);
  }
}

export function renderChecklist(trophies, state, opts, selectedId, onSelect, onToggle) {
  const list = document.getElementById('trophyList');
  const shown = applyFilters(trophies, state, opts);
  document.getElementById('listMeta').textContent =
    `Showing ${shown.length} of ${trophies.length} trophies — ${state.earned.length} earned.`;
  list.replaceChildren();
  for (const t of shown) {
    const earned = isEarned(state, t.id);
    const row = el('li', `trophy${earned ? ' earned' : ''}${t.id === selectedId ? ' selected' : ''}`);
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned;
    box.setAttribute('aria-label', `Mark ${t.name} as earned`);
    box.addEventListener('click', (ev) => { ev.stopPropagation(); onToggle(t.id); });
    row.appendChild(box);
    const body = el('div');
    body.appendChild(el('div', 'trophy-name', displayName(t, state)));
    body.appendChild(el('div', 'trophy-desc', displayDescription(t, state)));
    const tags = el('div', 'trophy-tags');
    tags.appendChild(gradeTag(t));
    if (t.kind !== 'platinum') tags.appendChild(el('span', 'tag', kindLabel(t.kind)));
    if (t.hidden) tags.appendChild(el('span', 'tag hidden', 'Hidden'));
    if (t.missable) tags.appendChild(el('span', 'tag missable', 'Missable'));
    if (t.target !== null && t.target !== undefined) {
      tags.appendChild(el('span', 'tag target', `Target ${t.target.toLocaleString('en-US')}`));
    }
    body.appendChild(tags);
    row.appendChild(body);
    row.appendChild(el('div', 'trophy-grade', `#${t.id}`));
    row.addEventListener('click', () => onSelect(t.id));
    list.appendChild(row);
  }
  if (shown.length === 0) {
    const empty = el('li', 'trophy', 'No trophies match these filters. Clear the search or pick another kind.');
    list.appendChild(empty);
  }
}

export function renderDetail(trophy, state, onToggle) {
  const pane = document.getElementById('detailPane');
  pane.replaceChildren();
  if (!trophy) {
    pane.appendChild(el('h2', null, 'Pick a trophy'));
    pane.appendChild(el('p', null, 'Click any trophy in the checklist to read its guide here — what to do, where, how, when it can be missed, and the sources each fact comes from.'));
    return;
  }
  const earned = isEarned(state, trophy.id);
  const spoiled = isSpoiled(trophy, state);
  pane.appendChild(el('h2', null, displayName(trophy, state)));
  const tags = el('div', 'trophy-tags');
  tags.appendChild(gradeTag(trophy));
  if (trophy.kind !== 'platinum') tags.appendChild(el('span', 'tag', kindLabel(trophy.kind)));
  if (trophy.hidden) tags.appendChild(el('span', 'tag hidden', 'Hidden on PSN until earned'));
  if (trophy.missable) tags.appendChild(el('span', 'tag missable', 'Potentially missable'));
  if (trophy.target !== null && trophy.target !== undefined) {
    tags.appendChild(el('span', 'tag target', `PSN progress target: ${trophy.target.toLocaleString('en-US')}`));
  }
  pane.appendChild(tags);
  pane.appendChild(el('p', 'official', `Official description: “${displayDescription(trophy, state)}”`));
  if (spoiled) {
    pane.appendChild(el('p', 'spoiler-note', 'Spoilers are hidden. Earn this trophy — or turn the spoiler setting off — to read its guide.'));
  } else {
    pane.appendChild(el('h3', null, 'Guide'));
    pane.appendChild(el('p', 'guide-text', trophy.guide));
  }
  pane.appendChild(el('h3', null, 'Sources'));
  const list = el('ul', 'sources');
  for (const s of trophy.sources) {
    const item = el('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = s.label;
    item.appendChild(a);
    list.appendChild(item);
  }
  pane.appendChild(list);
  const row = el('div', 'mark-row');
  const btn = el('button', earned ? 'earned' : '', earned ? '✓ Earned — click to unmark' : 'Mark as earned');
  btn.type = 'button';
  btn.addEventListener('click', () => onToggle(trophy.id));
  row.appendChild(btn);
  row.appendChild(el('span', null, earned ? 'Counted in your progress.' : 'Not earned yet.'));
  pane.appendChild(row);
}

export function renderRoadmap(roadmap, trophies, state) {
  document.getElementById('roadmapNote').textContent =
    `${roadmap.note} ${roadmap.estimate}.`;
  const byName = new Map(trophies.map((t) => [t.name, t]));
  const stages = document.getElementById('roadmapStages');
  stages.replaceChildren();
  for (const stage of roadmap.stages) {
    const item = el('li', 'stage');
    item.appendChild(el('h3', null, stage.title));
    item.appendChild(el('div', 'hours', stage.hours));
    item.appendChild(el('p', null, stage.summary));
    const chips = el('div', 'stage-trophies');
    for (const name of stage.trophies) {
      const t = byName.get(name);
      const a = document.createElement('a');
      a.href = `#/trophy/${t ? t.id : ''}`;
      a.textContent = name;
      if (t && isEarned(state, t.id)) a.className = 'earned';
      chips.appendChild(a);
    }
    item.appendChild(chips);
    stages.appendChild(item);
  }
  const warnings = document.getElementById('roadmapWarnings');
  warnings.replaceChildren();
  for (const w of roadmap.warnings) warnings.appendChild(el('li', null, w));
}

export function renderMissables(trophies, state) {
  const holder = document.getElementById('missableList');
  holder.replaceChildren();
  const missable = trophies.filter((t) => t.missable);
  for (const t of missable) {
    const card = el('div', 'missable-card');
    card.appendChild(el('h3', null, `${t.name} — potentially missable`));
    card.appendChild(el('p', 'guide-text', t.guide));
    const a = document.createElement('a');
    a.href = `#/trophy/${t.id}`;
    a.textContent = 'Open the full guide for this trophy →';
    card.appendChild(a);
    holder.appendChild(card);
  }
  const calm = el('div', 'calm');
  calm.appendChild(el('h3', null, 'Everything else cannot be missed'));
  calm.appendChild(el('p', null,
    'All 12 story trophies are automatic: they pop when you finish the chapter or mission, and there is no mission replay to worry about. ' +
    'Every character questline (Andy, Kenton, Billy, Randy, Tyrone, Bret) stays open after the story, and nothing on the 100% checklist is missable. ' +
    'PowerPyx and GTA Zone both reach the same conclusion: Positive Mental Attitude is the only trophy either guide flags, and only as a maybe.'));
  holder.appendChild(calm);
}

export function renderSources(data) {
  const list = document.getElementById('sourceList');
  list.replaceChildren();
  for (const s of data.sources) {
    const item = el('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = s.label;
    item.appendChild(a);
    list.appendChild(item);
  }
}
