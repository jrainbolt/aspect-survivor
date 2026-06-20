export class AudioSystem {
  private static context?: AudioContext;

  playHit(): void { this.tone(170, 90, 0.045, 'square', 0.025); }
  playPickup(): void { this.tone(620, 920, 0.1, 'sine', 0.035); }
  playLevelUp(): void {
    [523, 659, 784, 1047].forEach((frequency, index) => this.tone(frequency, frequency, 0.18, 'triangle', 0.045, index * 0.08));
  }
  playPlayerHurt(): void { this.tone(150, 70, 0.22, 'sawtooth', 0.055); }
  playBossSpawn(): void { this.tone(82, 46, 0.85, 'sawtooth', 0.07); this.noise(0.7, 0.035); }
  playWeaponFire(): void { this.tone(480, 230, 0.1, 'triangle', 0.035); }
  playMeleeSwing(): void { this.noise(0.11, 0.024); this.tone(240, 110, 0.1, 'sine', 0.022); }
  playShieldBash(): void { this.tone(115, 62, 0.2, 'square', 0.045); this.noise(0.08, 0.025); }
  playBossAttack(): void { this.tone(105, 48, 0.36, 'sawtooth', 0.06); }
  playEnemyDeath(): void { this.tone(120, 65, 0.08, 'triangle', 0.018); }
  playTownPurchase(): void { this.tone(440, 660, 0.12, 'sine', 0.04); }
  playVictory(): void {
    [392, 523, 659, 784].forEach((frequency, index) => this.tone(frequency, frequency, 0.32, 'triangle', 0.055, index * 0.14));
  }

  private getContext(): AudioContext | undefined {
    if (typeof window === 'undefined' || !window.AudioContext) return undefined;
    AudioSystem.context ??= new AudioContext();
    if (AudioSystem.context.state === 'suspended') void AudioSystem.context.resume();
    return AudioSystem.context;
  }

  private tone(startFrequency: number, endFrequency: number, duration: number, type: OscillatorType, volume: number, delay = 0): void {
    const context = this.getContext();
    if (!context) return;
    const start = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(startFrequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), start + duration);
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration);
  }

  private noise(duration: number, volume: number): void {
    const context = this.getContext();
    if (!context) return;
    const frames = Math.ceil(context.sampleRate * duration);
    const buffer = context.createBuffer(1, frames, context.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let index = 0; index < frames; index += 1) channel[index] = Math.random() * 2 - 1;
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    gain.gain.setValueAtTime(volume, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    source.connect(gain).connect(context.destination);
    source.start();
  }
}
