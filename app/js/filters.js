// Filtering and the spoiler rule for the trophy checklist.
//
// Kinds used in the data: story, missable, collectible, activity, character,
// crime, secret, platinum. The toolbar filters by kind, grade, earned state
// and free text. The spoiler rule hides the name and description of story
// trophies that are not earned yet while the spoiler setting is on.

export function kindLabel(kind) {
  switch (kind) {
    case 'story': return 'Story';
    case 'missable': return 'Missable';
    case 'collectible': return 'Collectible';
    case 'activity': return 'Activity';
    case 'character': return 'Character quest';
    case 'crime': return 'Crime';
    case 'secret': return 'Secret';
    case 'platinum': return 'Platinum';
    default: return kind;
  }
}

// A trophy counts as spoiled (name + description hidden) only when the
// spoiler setting is on, it is a story trophy, and it is not earned yet.
export function isSpoiled(trophy, state) {
  return state.spoiler && trophy.kind === 'story' && !state.earned.includes(trophy.id);
}

export function displayName(trophy, state) {
  return isSpoiled(trophy, state) ? 'Hidden story trophy' : trophy.name;
}

export function displayDescription(trophy, state) {
  return isSpoiled(trophy, state) ? 'Earn this trophy to reveal its name and description.' : trophy.description;
}

export function applyFilters(trophies, state, opts) {
  const needle = (opts.search || '').trim().toLowerCase();
  return trophies.filter((t) => {
    if (opts.kind !== 'all' && t.kind !== opts.kind) return false;
    if (opts.grade !== 'all' && t.grade !== opts.grade) return false;
    const earned = state.earned.includes(t.id);
    if (opts.earned === 'earned' && !earned) return false;
    if (opts.earned === 'todo' && earned) return false;
    if (needle) {
      const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });
}

export function gradeCounts(trophies, state) {
  const out = { platinum: [0, 0], gold: [0, 0], silver: [0, 0], bronze: [0, 0] };
  for (const t of trophies) {
    out[t.grade][1] += 1;
    if (state.earned.includes(t.id)) out[t.grade][0] += 1;
  }
  return out;
}
