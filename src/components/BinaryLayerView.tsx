import React, { useEffect, useRef } from 'react';
import { Download } from 'lucide-react';
import { generateBinaryLayerCanvas, downloadCanvas as downloadCanvasUtil } from '../utils/downloadHelper';

interface BinaryLayerViewProps {
  layers: boolean[][][];
  aspectRatio: number;
  onDownloadAll: () => void;
}

export const BinaryLayerView: React.FC<BinaryLayerViewProps> = ({ layers, aspectRatio, onDownloadAll }) => {
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  useEffect(() => {
    layers.forEach((layer, index) => {
      const canvas = canvasRefs.current[index];
      if (canvas) {
        // Calculate canvas dimensions based on aspect ratio
        const maxWidth = 150;
        const maxHeight = 150;
        let width, height;

        if (aspectRatio > 1) {
          // Landscape
          width = maxWidth;
          height = maxWidth / aspectRatio;
        } else {
          // Portrait or square
          height = maxHeight;
          width = maxHeight * aspectRatio;
        }

        const generatedCanvas = generateBinaryLayerCanvas(layer, width, height);

        canvas.width = generatedCanvas.width;
        canvas.height = generatedCanvas.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(generatedCanvas, 0, 0);
      }
    });
  }, [layers, aspectRatio]);

  const handleDownloadLayer = async (index: number) => {
    const layer = layers[index];
    // Generate a larger canvas for download
    const downloadWidth = 500;
    const downloadHeight = downloadWidth / aspectRatio;
    const canvas = generateBinaryLayerCanvas(layer, downloadWidth, downloadHeight);
    await downloadCanvasUtil(canvas, `binary_layer_${index + 1}.png`);
  };

  if (layers.length === 0) return null;

  return (
    <div className="binary-layer-view">
      <h3>二値画像レイヤー</h3>
      <div className="layer-grid">
        {layers.map((_, index) => (
          <div key={index} className="layer-item">
            <div className="layer-header">
              <span>Layer {index + 1}</span>
              <button
                onClick={() => handleDownloadLayer(index)}
                className="download-btn"
                title="ダウンロード"
              >
                <Download size={16} />
              </button>
            </div>
            <canvas
              ref={(el) => { canvasRefs.current[index] = el; }}
              className="layer-canvas"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
        ))}
      </div>
      <button onClick={onDownloadAll} className="download-all-btn">
        <Download size={20} />
        全レイヤーをZIPでダウンロード
      </button>
    </div>
  );
};