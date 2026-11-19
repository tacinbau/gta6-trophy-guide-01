// Progress store: earned trophies and the spoiler setting live in localStorage
// only. Nothing is sent anywhere. Export writes a JSON file the user can keep;
// import reads such a file back. The shape is { version, earned: [ids], spoiler }.
const KEY = 'leonida-platinum-v1';
const VERSION = 1;

function blankState() {
  return { version: VERSION, earned: [], spoiler: false };
}

function readState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blankState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return blankState();
    return {
      version: VERSION,
      earned: Array.isArray(parsed.earned) ? parsed.earned.filter((n) => Number.isInteger(n)) : [],
      spoiler: parsed.spoiler === true,
    };
  } catch {
    return blankState();
  }
}

function writeState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Private mode or full storage: progress just does not persist.
  }
}

export function loadProgress() {
  return readState();
}

export function saveProgress(state) {
  writeState(state);
}

export function isEarned(state, id) {
  return state.earned.includes(id);
}

export function toggleEarned(state, id) {
  const next = { ...state, earned: [...state.earned] };
  const at = next.earned.indexOf(id);
  if (at >= 0) next.earned.splice(at, 1);
  else next.earned.push(id);
  next.earned.sort((a, b) => a - b);
  writeState(next);
  return next;
}

export function setSpoiler(state, on) {
  const next = { ...state, spoiler: on };
  writeState(next);
  return next;
}

export function clearProgress() {
  const next = blankState();
  writeState(next);
  return next;
}

export function exportFile(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gta6-trophy-progress.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Reads an exported progress file and returns the parsed state, or null when
// the file is not a progress file this app understands.
export async function importFile(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object') return null;
  if (!Array.isArray(parsed.earned)) return null;
  const earned = parsed.earned.filter((n) => Number.isInteger(n));
  return { version: VERSION, earned, spoiler: parsed.spoiler === true };
}
