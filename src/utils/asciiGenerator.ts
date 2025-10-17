const SAMPLE_TEXT = '我輩は猫である。名前はまだ無い。どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。吾輩はここで始めて人間というものを見た。';

export interface AsciiLayer {
  layer: number;
  text: string[][];
  opacity: number;
}

export const generateAsciiLayers = (
  binaryLayers: boolean[][][],
  gridRows: number,
  gridCols: number
): AsciiLayer[] => {
  const asciiLayers: AsciiLayer[] = [];
  let textIndex = 0;

  for (let layerIndex = 0; layerIndex < binaryLayers.length; layerIndex++) {
    const layer = binaryLayers[layerIndex];
    const textGrid: string[][] = [];
    const opacity = Math.pow(0.5, layerIndex + 1);

    for (let y = 0; y < gridRows; y++) {
      const row: string[] = [];
      for (let x = 0; x < gridCols; x++) {
        if (layer[y] && layer[y][x]) {
          row.push(SAMPLE_TEXT[textIndex % SAMPLE_TEXT.length]);
          textIndex++;
        } else {
          row.push(' ');
        }
      }
      textGrid.push(row);
    }

    asciiLayers.push({
      layer: layerIndex + 1,
      text: textGrid,
      opacity
    });
  }

  return asciiLayers;
};

export const mergeAsciiLayers = (
  asciiLayers: AsciiLayer[],
  activeLayers: Set<number>
): string => {
  if (asciiLayers.length === 0) return '';

  const rows = asciiLayers[0].text.length;
  const cols = asciiLayers[0].text[0].length;
  const result: string[] = [];

  for (let y = 0; y < rows; y++) {
    let row = '';
    for (let x = 0; x < cols; x++) {
      let char = ' ';
      for (const layer of asciiLayers) {
        if (activeLayers.has(layer.layer) && layer.text[y][x] !== ' ') {
          char = layer.text[y][x];
          break;
        }
      }
      row += char;
    }
    result.push(row);
  }

  return result.join('\n');
};