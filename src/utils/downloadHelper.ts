import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export const generateBinaryLayerCanvas = (
  pixels: boolean[][],
  canvasWidth: number,
  canvasHeight: number
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  const rows = pixels.length;
  const cols = pixels[0].length;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // Calculate cell dimensions to fit the aspect ratio
  const cellWidth = canvasWidth / cols;
  const cellHeight = canvasHeight / rows;

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'black';
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (pixels[y][x]) {
        ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
      }
    }
  }

  return canvas;
};

export const downloadCanvas = async (canvas: HTMLCanvasElement, filename: string) => {
  return new Promise<void>((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, filename);
      }
      resolve();
    });
  });
};

export const downloadAsciiText = (text: string, filename: string) => {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, filename);
};

export const downloadAllLayersAsZip = async (
  binaryLayers: boolean[][][],
  asciiLayers: string[][][],
  aspectRatio: number
) => {
  const zip = new JSZip();

  const binaryFolder = zip.folder('binary_layers');
  const asciiFolder = zip.folder('ascii_layers');

  // Calculate canvas size for downloads
  const downloadWidth = 500;
  const downloadHeight = downloadWidth / aspectRatio;

  for (let i = 0; i < binaryLayers.length; i++) {
    const canvas = generateBinaryLayerCanvas(binaryLayers[i], downloadWidth, downloadHeight);
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob!));
    });
    binaryFolder?.file(`layer_${i + 1}.png`, blob);

    const asciiText = asciiLayers[i].map(row => row.join('')).join('\n');
    asciiFolder?.file(`layer_${i + 1}.txt`, asciiText);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, 'tracing_paper_layers.zip');
};

export const generateAsciiCanvas = (
  text: string[][],
  canvasWidth: number,
  canvasHeight: number,
  opacity: number = 1
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  const rows = text.length;
  const cols = text[0].length;

  // Set canvas size to match the desired dimensions
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // Calculate cell size based on canvas dimensions and grid
  const cellWidth = canvasWidth / cols;
  const cellHeight = canvasHeight / rows;

  // Choose appropriate font size based on cell size
  const fontSize = Math.min(cellWidth, cellHeight) * 0.8;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = `${fontSize}px monospace`;
  ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (text[y][x] !== ' ') {
        // Center each character in its grid cell
        const centerX = x * cellWidth + cellWidth / 2;
        const centerY = y * cellHeight + cellHeight / 2;
        ctx.fillText(text[y][x], centerX, centerY);
      }
    }
  }

  return canvas;
};