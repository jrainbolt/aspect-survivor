export class FullscreenSystem {
  static install(scene: Phaser.Scene): void {
    scene.input.keyboard?.on('keydown-F', this.toggle, scene);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      scene.input.keyboard?.off('keydown-F', this.toggle, scene);
    });
  }

  private static toggle(this: Phaser.Scene): void {
    if (this.scale.isFullscreen) {
      this.scale.stopFullscreen();
    } else {
      this.scale.startFullscreen();
    }
  }
}
