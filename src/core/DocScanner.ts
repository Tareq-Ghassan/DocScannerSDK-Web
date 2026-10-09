import type { DocScannerOptions, ScanResult } from '../types';

/**
 * Browser document scanner.
 * Draws a white crop rectangle over <video> and crops on capture via canvas.
 */
export class DocScanner {
  static readonly VERSION = '1.0.0';

  private video: HTMLVideoElement | null = null;
  private overlay: HTMLDivElement | null = null;
  private stream: MediaStream | null = null;
  private options: Required<DocScannerOptions> = {
    showCropOverlay: true,
    overlayBorderColor: '#ffffff',
    overlayHeightRatio: 0.35,
    overlayHorizontalInset: 32,
    scanBothSides: false,
    jpegQuality: 0.95,
  };

  configure(options: DocScannerOptions) {
    this.options = { ...this.options, ...options };
  }

  async start(container: HTMLElement): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false,
    });
    this.video = document.createElement('video');
    this.video.playsInline = true;
    this.video.autoplay = true;
    this.video.srcObject = this.stream;
    this.video.style.width = '100%';
    this.video.style.height = '100%';
    this.video.style.objectFit = 'cover';
    container.style.position = 'relative';
    container.appendChild(this.video);

    if (this.options.showCropOverlay) {
      this.overlay = document.createElement('div');
      Object.assign(this.overlay.style, {
        position: 'absolute',
        left: `${this.options.overlayHorizontalInset}px`,
        right: `${this.options.overlayHorizontalInset}px`,
        top: '50%',
        height: `${this.options.overlayHeightRatio * 100}%`,
        transform: 'translateY(-50%)',
        border: `3px solid ${this.options.overlayBorderColor}`,
        borderRadius: '12px',
        boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
        pointerEvents: 'none',
      } as CSSStyleDeclaration);
      container.appendChild(this.overlay);
    }
    await this.video.play();
  }

  /** Capture current frame and crop to the white overlay rectangle. */
  async capture(): Promise<ScanResult> {
    if (!this.video || !this.overlay) {
      return { isSuccess: false, errorMessage: 'Scanner not started' };
    }
    const vw = this.video.videoWidth;
    const vh = this.video.videoHeight;
    const rect = this.overlay.getBoundingClientRect();
    const videoRect = this.video.getBoundingClientRect();
    const scaleX = vw / videoRect.width;
    const scaleY = vh / videoRect.height;
    const sx = (rect.left - videoRect.left) * scaleX;
    const sy = (rect.top - videoRect.top) * scaleY;
    const sw = rect.width * scaleX;
    const sh = rect.height * scaleY;

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.floor(sw));
    canvas.height = Math.max(1, Math.floor(sh));
    const ctx = canvas.getContext('2d');
    if (!ctx) return { isSuccess: false, errorMessage: 'Canvas unavailable' };
    ctx.drawImage(this.video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    return {
      isSuccess: true,
      frontImageDataUrl: canvas.toDataURL('image/jpeg', this.options.jpegQuality),
    };
  }

  stop() {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.video?.remove();
    this.overlay?.remove();
    this.video = null;
    this.overlay = null;
  }
}
