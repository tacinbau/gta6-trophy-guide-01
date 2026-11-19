// Boot: loads the trophy list and the roadmap, wires the toolbar, the tabs
// and the hash routes, and keeps the views in sync with saved progress.
//
// Routes: #/ (checklist), #/trophy/<id>, #/roadmap, #/missables, #/sources.
// Progress lives in localStorage; export/import live in the footer.
import { loadProgress, saveProgress, toggleEarned, setSpoiler, clearProgress, exportFile, importFile } from './store.js';
import { renderChecklist, renderDetail, renderMissables, renderProgress, renderRoadmap, renderSources } from './render.js';

const VIEWS = ['checklist', 'roadmap', 'missables', 'sources'];

async function loadJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Could not load ${path}`);
  return res.json();
}

function parseRoute() {
  const hash = window.location.hash || '#/';
  const parts = hash.slice(2).split('/');
  if (parts[0] === 'trophy' && parts[1]) {
    return { view: 'checklist', selectedId: Number(parts[1]) || null };
  }
  if (VIEWS.includes(parts[0])) return { view: parts[0], selectedId: null };
  return { view: 'checklist', selectedId: null };
}

function showView(view) {
  for (const name of VIEWS) {
    document.getElementById(`view-${name}`).hidden = name !== view;
  }
  for (const tab of document.querySelectorAll('.tabs a')) {
    tab.classList.toggle('active', tab.dataset.route === view || (view === 'checklist' && tab.dataset.route === 'checklist'));
  }
}

async function boot() {
  const data = await loadJson('data/trophies.json');
  const roadmap = await loadJson('data/roadmap.json');
  const trophies = data.trophies;
  let state = loadProgress();
  let selectedId = null;

  const opts = { search: '', kind: 'all', grade: 'all', earned: 'all' };
  const searchInput = document.getElementById('searchInput');
  const kindFilter = document.getElementById('kindFilter');
  const gradeFilter = document.getElementById('gradeFilter');
  const earnedFilter = document.getElementById('earnedFilter');
  const spoilerToggle = document.getElementById('spoilerToggle');
  spoilerToggle.checked = state.spoiler;

  function refresh() {
    renderProgress(trophies, state);
    renderChecklist(trophies, state, opts, selectedId, selectTrophy, toggleOne);
    const selected = trophies.find((t) => t.id === selectedId) || null;
    renderDetail(selected, state, toggleOne);
  }

  function selectTrophy(id) {
    selectedId = id;
    if (window.location.hash !== `#/trophy/${id}`) {
      window.history.replaceState(null, '', `#/trophy/${id}`);
    }
    refresh();
  }

  function toggleOne(id) {
    state = toggleEarned(state, id);
    refresh();
  }

  function applyRoute() {
    const route = parseRoute();
    showView(route.view);
    renderProgress(trophies, state);
    if (route.view === 'roadmap') renderRoadmap(roadmap, trophies, state);
    if (route.view === 'missables') renderMissables(trophies, state);
    if (route.view === 'sources') renderSources(data);
    if (route.view === 'checklist') {
      selectedId = route.selectedId;
      refresh();
    }
  }

  searchInput.addEventListener('input', () => { opts.search = searchInput.value; refresh(); });
  kindFilter.addEventListener('change', () => { opts.kind = kindFilter.value; refresh(); });
  gradeFilter.addEventListener('change', () => { opts.grade = gradeFilter.value; refresh(); });
  earnedFilter.addEventListener('change', () => { opts.earned = earnedFilter.value; refresh(); });
  spoilerToggle.addEventListener('change', () => {
    state = setSpoiler(state, spoilerToggle.checked);
    refresh();
  });
  window.addEventListener('hashchange', applyRoute);

  document.getElementById('exportBtn').addEventListener('click', () => exportFile(state));
  document.getElementById('importInput').addEventListener('change', async (ev) => {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    try {
      const next = await importFile(file);
      if (!next) { alert('That file is not a progress export from this guide.'); return; }
      state = next;
      saveProgress(state);
      spoilerToggle.checked = state.spoiler;
      applyRoute();
    } catch {
      alert('Could not read that file as a progress export.');
    }
    ev.target.value = '';
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (!window.confirm('Clear all earned trophies? This cannot be undone (export first if you want a backup).')) return;
    state = clearProgress();
    spoilerToggle.checked = false;
    selectedId = null;
    applyRoute();
  });

  applyRoute();
}

boot().catch((err) => {
  document.getElementById('main').insertAdjacentHTML('afterbegin',
    `<p role="alert">This guide could not load its trophy data (${err.message}). It is meant to run from its own files over HTTP or from a static host.</p>`);
});
