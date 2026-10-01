import { getPcmWorkletUrl } from './pcm-worklet';

export type MicFailure = 'unsupported' | 'denied' | 'unavailable';
export class MicError extends Error {
  readonly reason: MicFailure;
  constructor(reason: MicFailure) {
    super(reason);
    this.name = 'MicError';
    this.reason = reason;
  }
}

export function isRealtimeVoiceSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof AudioWorkletNode !== 'undefined' &&
    typeof WebSocket !== 'undefined'
  );
}

/** Captures the microphone and emits 16kHz PCM16 chunks via onChunk until stop() is called. */
export class MicCapture {
  private context: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private node: AudioWorkletNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  async start(onChunk: (chunk: ArrayBuffer) => void, onLevel?: (level: number) => void): Promise<void> {
    if (!isRealtimeVoiceSupported()) throw new MicError('unsupported');
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 } });
    } catch (error) {
      const denied = error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'SecurityError');
      throw new MicError(denied ? 'denied' : 'unavailable');
    }

    try {
      const context = new AudioContext();
      await context.audioWorklet.addModule(getPcmWorkletUrl());
      const source = context.createMediaStreamSource(stream);
      const node = new AudioWorkletNode(context, 'pcm-downsampler');
      node.port.onmessage = (event: MessageEvent<ArrayBuffer>) => {
        onChunk(event.data);
        if (onLevel) {
          const samples = new Int16Array(event.data);
          let peak = 0;
          for (const sample of samples) peak = Math.max(peak, Math.abs(sample) / 0x8000);
          onLevel(peak);
        }
      };
      source.connect(node);
      // The worklet never produces audible output; connecting to a muted
      // destination keeps the graph alive on browsers that suspend
      // otherwise-disconnected audio graphs.
      const silence = context.createGain();
      silence.gain.value = 0;
      node.connect(silence);
      silence.connect(context.destination);

      this.context = context;
      this.stream = stream;
      this.source = source;
      this.node = node;
    } catch {
      stream.getTracks().forEach((track) => track.stop());
      throw new MicError('unavailable');
    }
  }

  stop(): void {
    this.node?.port.close();
    this.node?.disconnect();
    this.source?.disconnect();
    this.stream?.getTracks().forEach((track) => track.stop());
    void this.context?.close().catch(() => {});
    this.node = null;
    this.source = null;
    this.stream = null;
    this.context = null;
  }
}
