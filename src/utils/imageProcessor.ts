export interface ProcessedPixel {
  x: number;
  y: number;
  brightness: number;
}

export interface BinaryLayer {
  layer: number;
  pixels: boolean[][];
}

export const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const processImage = (
  img: HTMLImageElement,
  gridRows: number,
  gridCols: number
): ProcessedPixel[][] => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = gridCols;
  canvas.height = gridRows;

  ctx.drawImage(img, 0, 0, gridCols, gridRows);

  const imageData = ctx.getImageData(0, 0, gridCols, gridRows);
  const data = imageData.data;

  const pixels: ProcessedPixel[][] = [];

  for (let y = 0; y < gridRows; y++) {
    const row: ProcessedPixel[] = [];
    for (let x = 0; x < gridCols; x++) {
      const i = (y * gridCols + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Invert brightness: 0 = black, 1 = white -> 0 = white, 1 = black
      const brightness = 1 - (r * 0.299 + g * 0.587 + b * 0.114) / 255;

      row.push({ x, y, brightness });
    }
    pixels.push(row);
  }

  return pixels;
};

export const convertToBinaryLayers = (
  pixels: ProcessedPixel[][],
  numLayers: number
): BinaryLayer[] => {
  const layers: BinaryLayer[] = [];

  for (let layer = 0; layer < numLayers; layer++) {
    const weight = Math.pow(2, -(layer + 1));
    const layerPixels: boolean[][] = [];

    for (let y = 0; y < pixels.length; y++) {
      const row: boolean[] = [];
      for (let x = 0; x < pixels[y].length; x++) {
        const brightness = pixels[y][x].brightness;
        const binaryValue = Math.floor(brightness / weight) % 2;
        row.push(binaryValue === 1);
      }
      layerPixels.push(row);
    }

    layers.push({
      layer: layer + 1,
      pixels: layerPixels
    });
  }

  return layers;
};