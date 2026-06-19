# Aspect Survivor

A fantasy roguelite survival arena game built with Phaser 3, TypeScript, and Vite.

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
2. Survive three 60-second rounds in Act 1.
3. Visit the campfire after each normal round. Healing, one weapon upgrade, and one divine blessing can each be claimed once per visit.
4. Defeat the Act Guardian in the boss round.
5. Choose a major blessing and complete Act 1.
6. Review run statistics, records, and damage sources on the run summary screen.

Current weapons are Javelin, Arcane Bolt, and Holy Hammer. Current divine favors come from Jupiter, Mars, and Neptune.

## Player Stats

Final player stats are calculated from layered sources:

1. Character base stats and passive
2. Current weapon and weapon level
3. Active blessings
4. Permanent level-up modifiers
5. Temporary modifiers

The pause menu shows core, combat, utility, and current-build details. Some expandable stats currently remain at defaults until future items or effects modify them.

Damage and run trackers record weapon/blessing damage, survival time, kills, bosses, gold, XP, healing, and damage taken. The run summary shows the top five damage sources and highlights new persistent records.

## Build

```bash
npm run build
```

The Vite config uses `/aspect-survivor/` during GitHub Actions builds, so the `dist` output works at `https://jrainbolt.github.io/aspect-survivor/`.

## Deploy

Push to `main` to run `.github/workflows/deploy.yml`. In repository settings, set Pages to deploy from `GitHub Actions`, not from the `main` branch root.

## Architecture

- `src/entities`: player, enemies, projectiles, and XP orbs.
- `src/game/data`: data-driven character, weapon, and blessing definitions.
- `src/game/systems`: stat calculation, damage/run tracking, run state, weapons, blessings, effects, saves, fullscreen, and audio preparation.
- `src/managers`: waves, spawning, XP, and level-up upgrades.
- `src/scenes`: main menu, character select, combat, campfire, blessing, and run-summary flow.
- `src/ui`: HUD, menu controls, arena frame, pause menu, and level-up panel.

New content is added through the registries in `src/game/data`. Combat behavior is coordinated by systems instead of being hardcoded into scene UI.
