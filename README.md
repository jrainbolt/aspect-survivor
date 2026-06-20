# Aspect Survivor

A fantasy roguelite survival arena game built with Phaser 3, TypeScript, and Vite.

For a prompt-ready inventory of the currently implemented game, see [GAME_STATE.md](GAME_STATE.md). Balance locations are listed in [TUNING.md](TUNING.md).

## Play

```bash
npm install
npm run dev
```

Controls:

- `WASD` or arrow keys move the player.
- The player automatically attacks the nearest enemy.
- Arrow keys select menu and reward options.
- `Enter` or `Space` confirms selections.
- `Esc` or `M` opens or closes the build and stats menu during combat.
- `F` toggles fullscreen.

## Run Structure

1. Choose Amazon, Sorcerer, or Paladin. Each hero has distinct base stats, a passive, and a starting weapon.
2. Clear three enemy waves in Act 1: 40 enemies in Round 1, 55 in Round 2, and 70 in Round 3.
3. Visit the campfire after each normal round. Choose or advance a specialization, claim one divine favor, make repeatable shop purchases as gold allows, then start the next encounter.
4. Defeat the Act Guardian in the boss round.
5. Defeating the Guardian completes Act 1 and opens the run summary.
6. Review run statistics, records, and damage sources.

Current weapons are Javelin, Arcane Bolt, and Sword & Shield. Current divine favors come from Jupiter, Mars, and Neptune.

Act 1 enemies have distinct silhouettes and roles: grunts pursue directly, runners weave, and brutes telegraph heavy charges. The Act Guardian uses three health phases, telegraphed ground strikes and charges, and summons reinforcements during the fight.

Amazon and Sorcerer use directional placeholder hero silhouettes rather than generic circles. Combat, pickups, leveling, camp purchases, boss attacks, and victory use lightweight generated Web Audio sounds with no external audio assets.

The Paladin fights at close range. Sword Hack sweeps a short multi-target arc; Shield Bash delivers heavy knockback, briefly stuns enemies, and grants +15 armor for one second when it connects. Shield Guard reduces incoming contact damage by 20%.

Menus use a shared fantasy UI framework for panels, buttons, cards, dividers, stat rows, and data-driven character portraits. The campfire presents the current build beside its reward choices, and divine favors use reusable god-themed blessing cards.

Paladins choose one run specialization at the campfire: Crusader, Templar, or Guardian. Divine favors have three visible ranks, and the camp merchant sells healing, weapon levels, permanent stats, and blessing reroll tokens. See `TUNING.md` for the data files that control balance and presentation values.

## Player Stats

Final player stats are calculated from layered sources:

1. Character base stats and passive
2. Current weapon and weapon level
3. Active blessings
4. Permanent level-up modifiers
5. Temporary modifiers

The pause menu shows core, combat, utility, and current-build details. Some expandable stats currently remain at defaults until future items or effects modify them.

Damage and run trackers record weapon/blessing damage, survival time, round clear times, kills, bosses, gold, XP, healing, and damage taken. The run summary shows victory status, clear times, the top five damage sources, and new persistent records.

## Build

```bash
npm run build
```

The Vite config uses `/aspect-survivor/` during GitHub Actions builds, so the `dist` output works at `https://jrainbolt.github.io/aspect-survivor/`.

## Deploy

Push to `main` to run `.github/workflows/deploy.yml`. In repository settings, set Pages to deploy from `GitHub Actions`, not from the `main` branch root.

## Architecture

- `src/entities`: player, enemies, projectiles, and XP orbs.
- `src/game/data`: data-driven character, weapon, blessing, and round definitions.
- `src/game/systems`: stat calculation, damage/run tracking, run state, projectile and melee weapons, boss mechanics, blessings, effects, saves, fullscreen, and generated audio.
- `src/managers`: round lifecycle, bounded wave spawning, XP, and level-up upgrades.
- `src/scenes`: main menu, character select, combat, campfire, blessing, and run-summary flow.
- `src/ui`: HUD, menu controls, arena frame, pause menu, and level-up panel.

New content is added through the registries in `src/game/data`. Combat behavior is coordinated by systems instead of being hardcoded into scene UI.
