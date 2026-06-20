# Aspect Survivor: Current Game State

Updated: 2026-06-19

This is the canonical prompt-ready snapshot of the implemented game. The README is the player/developer entry point; `TUNING.md` identifies balance files. Update this document when a milestone changes gameplay, content, progression, or run flow.

## Product Snapshot

- Browser-based fantasy arena roguelite inspired by survival shooters, using original names and procedural placeholder visuals.
- Built with Phaser 3, TypeScript, and Vite.
- Responsive canvas, fullscreen support, keyboard controls, and GitHub Pages deployment through GitHub Actions.
- Current scope is one complete act with three wave-clear rounds, camp visits, and an Act Guardian boss.

## Current Run Flow

1. Main menu displays records and controls.
2. Character selection: Amazon, Sorcerer, or Paladin.
3. Clear Act 1 Round 1: 40 enemies in waves of 5.
4. Visit the Ember Refuge town.
5. Clear Round 2: 55 enemies in waves of 7.
6. Visit town again.
7. Clear Round 3: 70 enemies in waves of 9.
8. Visit town and prepare for the boss.
9. Defeat the Act Guardian.
10. Show the Act 1 victory sequence and run summary.

Normal rounds end only after the configured enemy target has spawned and every living enemy is defeated. Player death ends the run immediately. Elapsed time is tracked for records and clear-time statistics, not as a round-ending condition.

## Playable Heroes

### Amazon

- Fast ranged hero with +10% move speed.
- Starts with Javelin.
- Javelins are fast, long-range projectiles with one additional pierce.
- Directional procedural hunter silhouette.

### Sorcerer

- Ranged spellcaster with +15% spell damage.
- Starts with Arcane Bolt.
- Slower, higher-damage single-target projectile.
- Directional procedural robed silhouette.

### Paladin

- Armored melee hero with +20 max HP and 20% contact-damage reduction.
- Starts with Sword & Shield.
- Sword Hack is a multi-target forward arc.
- Shield Bash deals damage, applies strong knockback and brief stun, and grants +15 armor for one second after connecting.
- Sword and shield have independent cooldowns and visually separated windups.
- Large-enemy melee checks use distance to the enemy surface rather than center-only distance.
- Custom directional armored placeholder with animated weapon and shield.

## Paladin Specializations

- Crusader: broader, stronger, faster sword attacks.
- Templar: armor, stronger guarding, and heavier shield bashes.
- Guardian: long piercing pike thrust with outbound and return damage.
- Specializations can be selected and advanced during later town visits, up to rank III.

## Enemies And Boss

- Grunt: direct pursuit enemy.
- Runner: fast green enemy with a weaving approach.
- Brute: durable enemy that telegraphs and performs a heavy charge.
- All enemies have distinct procedural silhouettes, remain inside arena bounds, and recover if displaced outside the playable area.
- Act Guardian: high-health boss with three named health phases.
- Guardian mechanics include telegraphed ground strikes, telegraphed charges, and reinforcement summons at health thresholds.
- Boss attacks do not resolve beneath pause or level-up overlays.

## Progression And Builds

- Enemies drop animated XP orbs that attract within pickup range.
- Level-ups pause combat and present three random keyboard/mouse-selectable upgrades.
- Current basic upgrades affect damage, attack speed, max HP, and move speed.
- Final stats are calculated from character base stats, character passive, weapon level, blessings, permanent upgrades, and temporary modifiers.
- Expanded stats include HP, damage, flat damage, attack speed, movement, armor, regeneration, critical stats, projectile stats, pierce, knockback, pickup range, XP/gold gain, luck, cooldown reduction, spell damage, and contact reduction.

## Divine Favors

- Jupiter Spark: chance to chain lightning; ranks increase chance, damage, and bounces.
- Mars Bloodletting: applies bleed damage over time; ranks increase damage and duration.
- Neptune Tidal Push: adds visible knockback; higher ranks increase force and eventually add slow.
- Blessings have three ranks, pronounced visual effects, and separate damage-source tracking where applicable.
- One favor may be chosen or ranked up per town visit. Reroll tokens are sold by the merchant.

## Town: The Ember Refuge

Town choices are visually and navigationally ordered as:

1. Weapon Specialization
2. Divine Favor
3. Supply Shop
4. Start Next Round

The shop currently sells:

- Field Dressing: heal 30% max HP.
- Temper Weapon: +22% weapon damage per weapon level, with scaling price.
- Vitality Draught: +5 max HP.
- Whetstone: +2 flat damage.
- Diviner Token: +1 blessing reroll.

Shop purchases are repeatable while the player has enough gold. The town shows current HP, core stats, gold, weapon level and next-level change, specialization, blessings, preparation status, and the next encounter objective. Selection remains on the activated item after the town scene refreshes.

## Interface And Controls

- Move: `WASD` or arrow keys.
- Attacks target the nearest enemy automatically.
- Navigate menus: arrow keys or pointer.
- Confirm: `Enter`, `Space`, or pointer.
- Pause/build screen: `Esc` or `M`.
- Fullscreen: `F`.
- Main menu lists controls and persistent records.
- Combat HUD shows HP, XP, level, weapon, blessings, gold, act/round, defeated target, and living enemies.
- Boss HUD shows objective, health bar, and current boss phase.
- Pause screen shows hero/run details, complete stats, weapon, specialization, passive, blessings grouped by god, and temporary effects.

## Feedback And Presentation

- Hit flashes, typed damage numbers, XP attraction, pickup effects, death particles, recoil, melee arcs/thrusts, shield impacts, blessing effects, camera shake, and level-up effects.
- Procedurally generated Web Audio cues for weapon fire, melee, shield bash, hits, hurt, pickups, leveling, purchases, boss spawn/attacks, deaths, and victory.
- Act 1 completion includes flash, rings, particles, victory audio, and a dedicated victory treatment on the summary screen.
- No external art or audio assets are currently required.

## Tracking And Persistence

- Damage is totaled by source and damage type; the summary shows the top five sources.
- Run tracking includes elapsed time, round clear times, kills, elites, bosses, gold, XP, level, rounds, act, blessings, damage taken, and healing.
- Summary outcome is either `died` or `act1_complete`.
- LocalStorage records: best survival time, highest act, highest level, most enemies defeated, and most gold earned.

## Architecture Map

- `src/game/data`: characters, weapons, blessings/ranks, specializations, rounds, merchant inventory, portraits, stat display, and combat-text tuning.
- `src/game/systems`: weapons, melee, boss encounter, blessings, stats, audio, effects, combat text, merchants, specializations, run state/stats, damage tracking, saves, and fullscreen.
- `src/managers`: round completion, bounded wave spawning, XP, and level-up choices.
- `src/entities`: player, enemy behaviors, projectiles, and XP orbs.
- `src/scenes`: main menu, character select, game, town, blessing selection, and run summary.
- `src/game/ui` and `src/ui`: reusable fantasy panels/cards, HUD, pause menu, buttons, arena frame, and upgrade panel.

Core gameplay definitions are data-driven. New characters, weapons, blessings, specializations, rounds, and merchant items should be added through their data registries, with behavior delegated to systems instead of scene UI.

## Known Scope Limits

- Only Act 1 is implemented; there is no Act 2 run continuation.
- Three heroes, three starting weapon kits, three blessings, and three Paladin specializations are implemented.
- Visuals are procedural placeholders rather than final sprites or animation sheets.
- Audio is generated placeholder synthesis rather than final sound assets or music.
- Controls are keyboard and pointer based; dedicated touch movement controls are not implemented.
- There is no meta-progression, unlock tree, equipment inventory, or saveable in-progress run.
- There is currently no automated gameplay test suite.

## Prompting With This Snapshot

For a new milestone prompt, attach or paste this file and add:

1. The desired player-facing outcome.
2. Exact acceptance criteria.
3. Systems or content that must remain unchanged.
4. Whether placeholder visuals/audio are acceptable.
5. Any balance targets or screenshots demonstrating the issue.

Ask the implementation agent to verify existing code before changing architecture, preserve the data-driven model, update this snapshot when the feature set changes, and run `npm run build` before completion.
