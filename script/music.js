class MusicPlayer {
  constructor(tracks = [], options = {}) {
    this.tracks = tracks;
    this.audio = new Audio();
    this.audio.volume = options.volume ?? 0.5;
    this.shuffle = options.shuffle ?? false;
    this.currentTrack = 0;
    this.started = false;
    this.muted = false;

    if (this.shuffle) this._shuffleTracks();
    this.audio.addEventListener('ended', () => this.playNext());
  }

  _shuffleTracks() {
    for (let i = this.tracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.tracks[i], this.tracks[j]] = [this.tracks[j], this.tracks[i]];
    }
  }

  playTrack(index) {
    if (this.tracks.length === 0) return;
    this.currentTrack = (index + this.tracks.length) % this.tracks.length;
    this.audio.src = this.tracks[this.currentTrack];
    this.audio.play().catch(err => console.log("Playback blocked:", err));
  }

  playNext() {
    this.playTrack(this.currentTrack + 1);
  }

  start() {
    if (this.started) return;
    this.started = true;
    this.playNext();
  }

  startOnUserInteraction() {
    const startHandler = () => this.start();
    document.addEventListener("click", startHandler, { once: true });
    document.addEventListener("keydown", startHandler, { once: true });
    document.addEventListener("touchstart", startHandler, { once: true });
  }

  setVolume(volume) {
    this.audio.volume = Math.min(Math.max(volume, 0), 1);
  }

  toggleMute() {
    this.muted = !this.muted;
    this.audio.muted = this.muted;
    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) muteBtn.textContent = this.muted ? '🔇' : '🔊';
  }
}

const tracks = [
  'assets/music/Come-Out-And-Play.mp3',
  'assets/music/Come-Play-with-Me.mp3',
  'assets/music/Demented-Nightmare.mp3',
  'assets/music/Hitman.mp3',
  'assets/music/Sneaky-Adventure.mp3'
];

const player = new MusicPlayer(tracks, { volume: 0.4, shuffle: true });
player.startOnUserInteraction();

// Volume
document.getElementById('volume-slider').addEventListener('input', (e) => {
  player.setVolume(parseFloat(e.target.value));
});

// Mute
document.getElementById('mute-btn').addEventListener('click', () => {
  player.toggleMute();
});

// Next track
document.getElementById('next-track').addEventListener('click', () => {
  player.playNext();
});
