export const FantasyTheme = {
  background: 0x0d1117,
  panel: 0x171c24,
  panelRaised: 0x202733,
  border: 0x65522f,
  gold: 0xd8ad55,
  goldBright: 0xffd77a,
  text: '#e8e2d5',
  muted: '#a9a397',
  teal: 0x4ecdc4,
};

export const fantasyText = (fontSize: number, color = FantasyTheme.text, weight = '700'): Phaser.Types.GameObjects.Text.TextStyle => ({
  color, fontFamily: 'Georgia, Times New Roman, serif', fontSize: `${fontSize}px`, fontStyle: weight,
});
