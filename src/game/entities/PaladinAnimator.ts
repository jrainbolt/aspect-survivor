import Phaser from 'phaser';
import { PaladinVisual } from '../visuals/PaladinVisual';
import type { SpecializationId } from '../types';

export type PaladinAnimationState = 'idle' | 'walk' | 'sword-attack' | 'shield-bash' | 'hurt' | 'level-up';

export class PaladinAnimator {
  private state: PaladinAnimationState = 'idle';
  private stateUntil = 0;
  private readonly visual: PaladinVisual;

  constructor(scene: Phaser.Scene, x: number, y: number, specializationId?: SpecializationId) { this.visual = new PaladinVisual(scene, x, y, specializationId); }

  update(x: number, y: number, alpha: number, moving: boolean, time: number): void {
    if (time >= this.stateUntil && !['idle', 'walk'].includes(this.state)) this.state = moving ? 'walk' : 'idle';
    if (this.state === 'idle' || this.state === 'walk') this.state = moving ? 'walk' : 'idle';
    this.visual.setPosition(x, y);
    this.visual.setAlpha(alpha);
    this.visual.setLocomotion(this.state, time);
  }

  setFacing(direction: Phaser.Math.Vector2): void { this.visual.setFacing(direction); }
  swordAttack(time: number): void { this.state = 'sword-attack'; this.stateUntil = time + 260; this.visual.playSwordHack(); }
  pikeThrust(time: number): void { this.state = 'sword-attack'; this.stateUntil = time + 260; this.visual.playPikeThrust(); }
  shieldBash(time: number): void { this.state = 'shield-bash'; this.stateUntil = time + 360; this.visual.playShieldBash(); }
  hurt(time: number): void { this.state = 'hurt'; this.stateUntil = time + 230; this.visual.playHurt(); }
  celebrate(time: number): void { this.state = 'level-up'; this.stateUntil = time + 700; this.visual.playCelebration(); }
  guardFlash(): void { this.visual.playGuardFlash(); }
}
