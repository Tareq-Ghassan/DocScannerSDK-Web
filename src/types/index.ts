export interface DocScannerOptions {
  showCropOverlay?: boolean;
  overlayBorderColor?: string;
  overlayHeightRatio?: number;
  overlayHorizontalInset?: number;
  scanBothSides?: boolean;
  jpegQuality?: number;
}

export interface ScanResult {
  frontImageDataUrl?: string;
  backImageDataUrl?: string;
  isSuccess: boolean;
  errorMessage?: string;
}
