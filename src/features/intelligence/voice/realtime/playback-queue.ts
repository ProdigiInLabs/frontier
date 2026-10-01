/**
 * Schedules incoming 24kHz PCM16 audio chunks for gapless playback, and can
 * be cleared instantly — the mechanism behind barge-in: when the model is
 * interrupted mid-reply, the UI calls clear() and playback stops immediately
 * instead of finishing the already-buffered audio.
 */
export class RealtimePlaybackQueue {
  private readonly context: AudioContext;
  private readonly gain: GainNode;
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();
  private onLevel?: (level: number) => void;

  constructor(onLevel?: (level: number) => void) {
    this.context = new AudioContext({ sampleRate: 24000 });
    this.gain = this.context.createGain();
    this.gain.connect(this.context.destination);
    this.onLevel = onLevel;
  }

  get currentTime(): number {
    return this.context.currentTime;
  }

  /** True while there is still scheduled audio ahead of playback. */
  get isSpeaking(): boolean {
    return this.nextStartTime > this.context.currentTime + 0.02;
  }

  async resume(): Promise<void> {
    if (this.context.state === 'suspended') await this.context.resume();
  }

  enqueue(pcm16: ArrayBuffer): void {
    const samples = new Int16Array(pcm16);
    const float32 = new Float32Array(samples.length);
    let peak = 0;
    for (let i = 0; i < samples.length; i += 1) {
      const value = (samples[i] ?? 0) / 0x8000;
      float32[i] = value;
      peak = Math.max(peak, Math.abs(value));
    }
    this.onLevel?.(peak);

    const buffer = this.context.createBuffer(1, float32.length, 24000);
    buffer.copyToChannel(float32, 0);

    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.gain);
    const startAt = Math.max(this.nextStartTime, this.context.currentTime);
    source.start(startAt);
    this.nextStartTime = startAt + buffer.duration;
    this.sources.add(source);
    source.onended = () => this.sources.delete(source);
  }

  /** Stops all buffered/playing audio immediately (barge-in). */
  clear(): void {
    for (const source of this.sources) {
      source.onended = null;
      try {
        source.stop();
      } catch {
        /* already stopped */
      }
    }
    this.sources.clear();
    this.nextStartTime = this.context.currentTime;
  }

  async close(): Promise<void> {
    this.clear();
    await this.context.close().catch(() => {});
  }
}
