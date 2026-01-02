export interface WatermarkConfig {
  logoSize: number;
  marginRight: number;
  marginBottom: number;
}

export interface WatermarkPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BgCaptures {
  bg48: HTMLImageElement | null;
  bg96: HTMLImageElement | null;
}

export interface ProcessedImage {
  id: string;
  name: string;
  originalSrc: string;
  processedSrc: string;
  originalWidth: number;
  originalHeight: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

// Declaration for the external JSZip library loaded via CDN
declare global {
  var JSZip: any;
}