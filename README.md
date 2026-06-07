# Aspect Survivor

A browser survival arena game inspired by Brotato, built with Phaser 3, TypeScript, and Vite.

## Play

```bash
npm install
npm run dev
```

Controls:

- `WASD` moves the player.
- The player automatically shoots the nearest enemy.
- Pick one upgrade whenever you level up.
- Press `R` after game over to restart.

## Build

```bash
npm run build
```

The Vite config uses `/aspect-survivor/` during GitHub Actions builds, so the `dist` output works on the project site at `https://jrainbolt.github.io/aspect-survivor/`.

## Deploy

Push to `main` to run `.github/workflows/deploy.yml`. In the repository settings, set Pages to deploy from `GitHub Actions`, not from the `main` branch root.

## Architecture

- `src/entities`: player, enemies, projectiles, XP orbs.
- `src/managers`: waves, spawning, XP, upgrades.
- `src/weapons`: weapon interface and the initial blaster.
- `src/upgrades`: typed upgrade catalog.
- `src/ui`: HUD and level-up panel.

New weapons implement `Weapon` and can be registered in `WeaponManager`. New upgrades can be added to `upgradeCatalog`.
