import { BgCaptures, WatermarkConfig, WatermarkPosition } from '../types';

const ALPHA_THRESHOLD = 0.002;
const MAX_ALPHA = 0.99;
const LOGO_VALUE = 255;

export const loadImage = (source: string | Blob | File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous"; // Enable CORS for external URLs
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        
        if (typeof source === 'string') {
            img.src = source;
        } else {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    img.src = e.target.result as string;
                }
            };
            reader.readAsDataURL(source);
        }
    });
};

function removeWatermarkLogic(imageData: ImageData, alphaMap: Float32Array, position: WatermarkPosition) {
    const { x, y, width, height } = position;
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const imgIdx = ((y + row) * imageData.width + (x + col)) * 4;
            const alphaIdx = row * width + col;
            let alpha = alphaMap[alphaIdx];

            if (alpha < ALPHA_THRESHOLD) continue;
            alpha = Math.min(alpha, MAX_ALPHA);
            const oneMinusAlpha = 1.0 - alpha;

            for (let c = 0; c < 3; c++) {
                const watermarked = imageData.data[imgIdx + c];
                const original = (watermarked - alpha * LOGO_VALUE) / oneMinusAlpha;
                imageData.data[imgIdx + c] = Math.max(0, Math.min(255, Math.round(original)));
            }
        }
    }
}

function calculateAlphaMap(bgCaptureImageData: ImageData): Float32Array {
    const { width, height, data } = bgCaptureImageData;
    const alphaMap = new Float32Array(width * height);
    for (let i = 0; i < alphaMap.length; i++) {
        const idx = i * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const maxChannel = Math.max(r, g, b);
        alphaMap[i] = maxChannel / 255.0;
    }
    return alphaMap;
}

function detectWatermarkConfig(imageWidth: number, imageHeight: number): WatermarkConfig {
    if (imageWidth > 1024 && imageHeight > 1024) {
        return { logoSize: 96, marginRight: 64, marginBottom: 64 };
    } else {
        return { logoSize: 48, marginRight: 32, marginBottom: 32 };
    }
}

function calculateWatermarkPosition(imageWidth: number, imageHeight: number, config: WatermarkConfig): WatermarkPosition {
    const { logoSize, marginRight, marginBottom } = config;
    return {
        x: imageWidth - marginRight - logoSize,
        y: imageHeight - marginBottom - logoSize,
        width: logoSize,
        height: logoSize
    };
}

export class WatermarkEngine {
    bgCaptures: BgCaptures;
    alphaMaps: { [key: number]: Float32Array } = {};

    constructor(bgCaptures: BgCaptures) {
        this.bgCaptures = bgCaptures;
    }

    static async create(): Promise<WatermarkEngine> {
        const load = async (key: string, defaultUrl: string): Promise<HTMLImageElement | null> => {
            // Try Local Storage first
            const cached = localStorage.getItem(key);
            if (cached) {
                try {
                    return await loadImage(cached);
                } catch (e) {
                    console.error(`Failed to load cached image for ${key}`, e);
                }
            }
            
            // Fallback to default URL
            try {
                const response = await fetch(defaultUrl);
                if (response.ok) {
                    const blob = await response.blob();
                    return await loadImage(blob);
                }
            } catch (e) {
                console.warn(`Failed to load default asset ${defaultUrl}`, e);
            }
            
            return null;
        };

        const bg48 = await load('bg_48_data', 'https://raw.githubusercontent.com/journey-ad/gemini-watermark-remover/refs/heads/main/src/assets/bg_48.png');
        const bg96 = await load('bg_96_data', 'https://raw.githubusercontent.com/journey-ad/gemini-watermark-remover/refs/heads/main/src/assets/bg_96.png');

        return new WatermarkEngine({ bg48, bg96 });
    }

    hasAssets(): boolean {
        return !!this.bgCaptures.bg48 && !!this.bgCaptures.bg96;
    }

    async getAlphaMap(size: number): Promise<Float32Array> {
        if (this.alphaMaps[size]) return this.alphaMaps[size];

        const bgImage = size === 48 ? this.bgCaptures.bg48 : this.bgCaptures.bg96;

        if (!bgImage || bgImage.width <= 1) {
            console.warn("Alpha map asset missing or invalid.");
            return new Float32Array(size * size).fill(0);
        }

        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Could not get 2d context");
        
        ctx.drawImage(bgImage, 0, 0);
        const imageData = ctx.getImageData(0, 0, size, size);
        const alphaMap = calculateAlphaMap(imageData);
        this.alphaMaps[size] = alphaMap;
        return alphaMap;
    }

    async removeWatermarkFromImage(image: HTMLImageElement): Promise<string> {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Could not get 2d context");

        ctx.drawImage(image, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const config = detectWatermarkConfig(canvas.width, canvas.height);
        const position = calculateWatermarkPosition(canvas.width, canvas.height, config);

        const alphaMap = await this.getAlphaMap(config.logoSize);
        removeWatermarkLogic(imageData, alphaMap, position);

        ctx.putImageData(imageData, 0, 0);
        return canvas.toDataURL('image/png');
    }
}