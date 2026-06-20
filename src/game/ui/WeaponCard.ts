import Phaser from 'phaser';
import { specializationDefinitions } from '../data/specializations';
import { getWeaponLevelDamageMultiplier, WEAPON_LEVEL_DAMAGE_BONUS, weaponDefinitions } from '../data/weapons';
import { SpecializationSystem } from '../systems/SpecializationSystem';
import type { RunState } from '../types';
import { FantasyTheme, fantasyText } from './FantasyTheme';

const romanLevel = (level: number): string => level <= 5 ? ['I', 'II', 'III', 'IV', 'V'][level - 1] : `Lv.${level}`;

const createWeaponIcon = (scene: Phaser.Scene, x: number, y: number, icon: 'blade' | 'tower-shield' | 'pike', color: number): Phaser.GameObjects.Container => {
  if (icon === 'tower-shield') {
    return scene.add.container(x, y, [scene.add.rectangle(0, 0, 27, 47, color).setStrokeStyle(3, 0xe8f7f6), scene.add.circle(0, 0, 5, 0xf4d35e)]);
  }
  const length = icon === 'pike' ? 70 : 48;
  const shaft = scene.add.rectangle(0, 0, length, icon === 'pike' ? 4 : 7, color).setRotation(-0.65);
  const tip = scene.add.triangle(25, -18, -8, -7, 8, 0, -8, 7, 0xffffff).setRotation(-0.65);
  return scene.add.container(x, y, [shaft, tip]);
};

export class WeaponCard extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number, width: number, state: RunState) {
    const specialization = state.specializationId ? specializationDefinitions[state.specializationId] : undefined;
    const weapon = weaponDefinitions[state.weaponId];
    const [primary, secondary] = SpecializationSystem.getAttacks(state.specializationId, state.specializationLevel);
    const background = scene.add.rectangle(0, 0, width, 140, FantasyTheme.panelRaised).setStrokeStyle(1, specialization?.color ?? FantasyTheme.border);
    const iconBack = scene.add.circle(-width / 2 + 48, 0, 31, specialization?.color ?? FantasyTheme.gold, 0.14)
      .setStrokeStyle(2, specialization?.color ?? FantasyTheme.gold);
    const icon = createWeaponIcon(scene, -width / 2 + 48, 0, specialization?.icon ?? 'blade', specialization?.color ?? FantasyTheme.gold);
    const left = -width / 2 + 92;
    const weaponName = specialization?.weaponName ?? weapon.displayName;
    const currentMultiplier = getWeaponLevelDamageMultiplier(state.weaponLevel);
    const nextMultiplier = getWeaponLevelDamageMultiplier(state.weaponLevel + 1);
    const damage = (baseDamage: number, multiplier: number): number => Math.round((baseDamage * state.playerStats.damage + state.playerStats.flatDamage) * multiplier);
    const effectiveCooldown = primary.cooldownMs * (1 - state.playerStats.cooldownReduction) / state.playerStats.attackSpeed / 1000;
    const title = scene.add.text(left, -52, `${weaponName} ${romanLevel(state.weaponLevel)}`, fantasyText(16, '#ffffff', '900')).setOrigin(0, 0.5);
    const path = scene.add.text(left, -28, `Path: ${specialization ? `${specialization.displayName} ${romanLevel(state.specializationLevel)}` : 'Unchosen'}  ·  Range: ${specialization?.rangeLabel ?? 'Medium'}`, fantasyText(12, '#d8ad55', '900')).setOrigin(0, 0.5);
    const details = scene.add.text(left, -4, `Sword: ${damage(primary.baseDamage, currentMultiplier)}  ·  Shield: ${damage(secondary.baseDamage, currentMultiplier)}  ·  Cooldown: ${effectiveCooldown.toFixed(2)}s`, fantasyText(12, FantasyTheme.muted)).setOrigin(0, 0.5);
    const upgrade = scene.add.text(left, 20, `NEXT LV  ·  Sword ${damage(primary.baseDamage, currentMultiplier)} → ${damage(primary.baseDamage, nextMultiplier)}  ·  Shield ${damage(secondary.baseDamage, currentMultiplier)} → ${damage(secondary.baseDamage, nextMultiplier)}  (+${Math.round(WEAPON_LEVEL_DAMAGE_BONUS * 100)}%)`, {
      ...fantasyText(11, '#66e39a', '900'), fixedWidth: width - 116, wordWrap: { width: width - 122 },
    }).setOrigin(0, 0.5);
    const special = scene.add.text(left, 49, specialization?.specialText ?? 'Sword arc and shield bash', {
      ...fantasyText(12, '#ddd5c7'), fixedWidth: width - 116, wordWrap: { width: width - 122 },
    }).setOrigin(0, 0.5);
    super(scene, x, y, [background, iconBack, icon, title, path, details, upgrade, special]);
    scene.add.existing(this);
  }

}
