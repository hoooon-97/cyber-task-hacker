let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

function resumeCtx() {
  const ctx = getCtx();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
}

function playBeep(freq = 800, duration = 0.08, type: OscillatorType = 'sine', vol = 0.1) {
  resumeCtx();
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);

  gain.gain.setValueAtTime(vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

function playTyping() {
  resumeCtx();
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const noise = ctx.createBufferSource();

  const bufferSize = ctx.sampleRate * 0.03;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 2000;

  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(ctx.currentTime);
  noise.stop(ctx.currentTime + 0.03);

  osc.type = 'square';
  osc.frequency.setValueAtTime(200 + Math.random() * 400, ctx.currentTime);
  const clickGain = ctx.createGain();
  clickGain.gain.setValueAtTime(0.03, ctx.currentTime);
  clickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
  osc.connect(clickGain);
  clickGain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.02);
}

export class SoundEngine {
  static enabled = true;

  static playClick() {
    if (!this.enabled) return;
    playBeep(1200, 0.05, 'sine', 0.08);
  }

  static playHover() {
    if (!this.enabled) return;
    playBeep(600, 0.03, 'sine', 0.03);
  }

  static playTyping() {
    if (!this.enabled) return;
    playTyping();
  }

  static playBreachSuccess() {
    if (!this.enabled) return;
    for (let i = 0; i < 8; i++) {
      setTimeout(() => playTyping(), i * 80);
    }
    setTimeout(() => {
      resumeCtx();
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.5);
    }, 700);
  }

  static playLevelUp() {
    if (!this.enabled) return;
    resumeCtx();
    const ctx = getCtx();
    const notes = [440, 554, 659, 880, 1109, 1319, 1760];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);

      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + i * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.4);
    });
  }

  static playAlert() {
    if (!this.enabled) return;
    resumeCtx();
    const ctx = getCtx();
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(800, ctx.currentTime + i * 0.2);
      osc.frequency.setValueAtTime(600, ctx.currentTime + i * 0.2 + 0.1);

      gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.2 + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + i * 0.2);
      osc.stop(ctx.currentTime + i * 0.2 + 0.15);
    }
  }

  static playBootBeep() {
    if (!this.enabled) return;
    playBeep(1000, 0.1, 'sine', 0.1);
  }

  static playMissionComplete() {
    if (!this.enabled) return;
    playBeep(1200, 0.1, 'sine', 0.12);
    setTimeout(() => playBeep(1500, 0.15, 'sine', 0.12), 120);
    setTimeout(() => playBeep(2000, 0.2, 'sine', 0.15), 280);
  }

  static playTick() {
    if (!this.enabled) return;
    playBeep(2000, 0.02, 'sine', 0.03);
  }
}
