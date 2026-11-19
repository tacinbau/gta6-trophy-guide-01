[![gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/tacinbau/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/tacinbau/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

# Leonida Platinum — GTA 6 Trophy Guide & Tracker

An offline, open-source guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI. Static files, no build step, no network at run time: open `app/index.html` in desktop Chrome and it works with the network off.

## What it does

- **Every trophy, exactly as PlayStation publishes it** — all 55 official names, descriptions and grades (1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden), cross-checked live against Exophase and PSNProfiles on 19 November 2026.
- **A tracker** — check trophies off as you earn them; progress is saved in the browser (localStorage), with export to a JSON file and import back.
- **Filters and search** — by kind (story, missable, collectibles, activities, character quests, crime, secrets), by grade, by earned state, and free text.
- **A spoiler setting** — hides the names and descriptions of story trophies until you earn them.
- **A platinum roadmap** — the order to earn them in, in three steps (story, 100% checklist, cleanup), built from the official descriptions and PowerPyx's roadmap.
- **Missables flagged** — exactly one trophy may be missable, Positive Mental Attitude, and the guide says why and what to do in Chapter 1.
- **A guide for every trophy in this guide's own words, each citing its sources** — Exophase, PSNProfiles, PowerPyx and GTA Zone. Where no source has pinned a trigger down yet (five trophies), the guide says so plainly instead of guessing.

## Try it

Serve `app/` with any static server and open `index.html`, for example:

```sh
cd app && python3 -m http.server 8080
```

Then open http://localhost:8080 in desktop Chrome.

## Hand in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json` with the vendored make.fun library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Run it twice — both runs write identical bytes.

## Sources

- Exophase — GTA VI trophy list: https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/
- PSNProfiles — GTA VI trophies: https://psnprofiles.com/trophies/43531-grand-theft-auto-vi
- PowerPyx — GTA 6 Trophy Guide & Roadmap: https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/
- GTA Zone — GTA 6 Trophy List: https://gta-zone.com/news/gta-6-trophies-achievements/
- WikiGTAVI — Trophies & Achievements: https://www.wikigtavi.com/achievements

Unofficial fan guide. Not affiliated with Rockstar Games or PlayStation. Trophy names and descriptions are shown as PlayStation publishes them; the guide text is original to this project. MIT licensed — see LICENSE.
