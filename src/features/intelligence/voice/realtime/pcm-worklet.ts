/**
 * AudioWorklet processor source, compiled to a Blob URL at runtime (no
 * separate asset file to manage). Runs on the audio render thread: resamples
 * the device's native sample rate down to 16 kHz and converts Float32 to
 * signed 16-bit PCM, batching ~100ms per message to keep postMessage traffic
 * low on slower devices.
 */
const PROCESSOR_SOURCE = `
class PcmDownsampler extends AudioWorkletProcessor {
  constructor() {
    super();
    this.targetRate = 16000;
    this.ratio = sampleRate / this.targetRate;
    this.carry = 0;
    this.buffer = [];
    this.batchSamples = Math.round(this.targetRate * 0.1);
  }

  process(inputs) {
    const channel = inputs[0]?.[0];
    if (!channel || channel.length === 0) return true;

    // Linear-interpolated downsampling from the hardware rate to 16kHz.
    let position = this.carry;
    while (position < channel.length) {
      const index = Math.floor(position);
      const frac = position - index;
      const a = channel[index] ?? 0;
      const b = channel[index + 1] ?? a;
      this.buffer.push(a + (b - a) * frac);
      position += this.ratio;
    }
    this.carry = position - channel.length;

    while (this.buffer.length >= this.batchSamples) {
      const chunk = this.buffer.splice(0, this.batchSamples);
      const pcm16 = new Int16Array(chunk.length);
      for (let i = 0; i < chunk.length; i += 1) {
        const sample = Math.max(-1, Math.min(1, chunk[i]));
        pcm16[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      }
      this.port.postMessage(pcm16.buffer, [pcm16.buffer]);
    }
    return true;
  }
}
registerProcessor('pcm-downsampler', PcmDownsampler);
`;

let moduleUrl: string | null = null;

/** Returns a Blob URL for the worklet module, created once and reused. */
export function getPcmWorkletUrl(): string {
  moduleUrl ??= URL.createObjectURL(new Blob([PROCESSOR_SOURCE], { type: 'text/javascript' }));
  return moduleUrl;
}
