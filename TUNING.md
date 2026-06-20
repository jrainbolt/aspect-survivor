# Tuning Guide

Gameplay values are intentionally centralized in data files.

## Rounds And Waves

- `src/game/data/rounds.ts`: enemy target, wave size, wave interval, weighted enemy composition, and base clear reward for every normal round.
- `src/managers/EnemySpawner.ts`: enemy stat blocks and edge-spawn placement. The spawner stops once the round target has been created.
- `src/managers/RoundManager.ts`: spawned/defeated accounting and the wave-clear completion condition.
- Round time is measured for statistics and future bonuses; it does not end a round.

## Paladin Specializations

- `src/game/data/specializations.ts`: Crusader, Templar, and Guardian descriptions plus stat, range, arc, cooldown, damage, and knockback scaling. Paths currently advance through three ranks.
- `src/game/data/weapons.ts`: base Sword Hack and Shield Bash values before specialization modifiers.
- `src/game/data/weapons.ts`: `WEAPON_LEVEL_DAMAGE_BONUS` controls the damage gained from each weapon level.

## Blessing Ranks

- `src/game/data/blessingRanks.ts`: rank caps, proc chances, bounce counts, bleed scaling, duration, knockback, and slow duration.
- `src/game/data/blessings.ts`: blessing names, descriptions, gods, colors, and effect categories.

## Combat Text

- `src/game/data/combatTextConfig.ts`: font sizes, colors, float distance, and fade duration for normal, critical, player, healing, lightning, bleed, and water text.

## Merchant And Economy

- `src/game/data/merchantItems.ts`: base prices, labels, descriptions, and colors.
- `src/game/systems/MerchantSystem.ts`: dynamic weapon-upgrade pricing and purchase effects.
- `src/game/systems/RunStatsTracker.ts`: gold rewards are credited when enemies die.

## Boss

- `src/managers/EnemySpawner.ts`: Act Guardian HP, damage, speed, scale, and XP.
- `src/entities/Enemy.ts`: boss knockback and stun resistance.
