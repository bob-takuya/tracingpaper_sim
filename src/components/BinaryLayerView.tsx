import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Download } from 'lucide-react';
import { generateBinaryLayerCanvas, downloadCanvas as downloadCanvasUtil } from '../utils/downloadHelper';

interface BinaryLayerViewProps {
  layers: boolean[][][];
  aspectRatio: number;
  onDownloadAll: () => void;
}

export const BinaryLayerView: React.FC<BinaryLayerViewProps> = ({ layers, aspectRatio, onDownloadAll }) => {
  const [activeLayers, setActiveLayers] = useState<Set<number>>(new Set());
  const [opacityMultiplier, setOpacityMultiplier] = useState(0.5);
  const mergedCanvasRef = useRef<HTMLCanvasElement>(null);
  const layerCanvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  useEffect(() => {
    if (layers.length > 0) {
      setActiveLayers(new Set(layers.map((_, index) => index + 1)));
    }
  }, [layers]);

  useEffect(() => {
    renderMergedView();
    renderIndividualLayers();
  }, [layers, activeLayers, opacityMultiplier, aspectRatio]);

  const renderMergedView = () => {
    const canvas = mergedCanvasRef.current;
    if (!canvas || layers.length === 0) return;

    // Calculate canvas dimensions based on aspect ratio
    const maxSize = 400;
    let canvasWidth, canvasHeight;

    if (aspectRatio > 1) {
      // Landscape
      canvasWidth = maxSize;
      canvasHeight = maxSize / aspectRatio;
    } else {
      // Portrait or square
      canvasHeight = maxSize;
      canvasWidth = maxSize * aspectRatio;
    }

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    layers.forEach((layer, index) => {
      const layerIndex = index + 1;
      if (!activeLayers.has(layerIndex)) return;

      const layerCanvas = generateBinaryLayerCanvas(layer, canvasWidth, canvasHeight);
      const opacity = Math.pow(opacityMultiplier, layerIndex);

      ctx.globalAlpha = opacity;
      ctx.drawImage(layerCanvas, 0, 0);
    });

    ctx.globalAlpha = 1;
  };

  const renderIndividualLayers = () => {
    layers.forEach((layer, index) => {
      const canvas = layerCanvasRefs.current[index];
      if (!canvas) return;

      // Calculate canvas dimensions for individual layers
      const maxSize = 150;
      let width, height;

      if (aspectRatio > 1) {
        width = maxSize;
        height = maxSize / aspectRatio;
      } else {
        height = maxSize;
        width = maxSize * aspectRatio;
      }

      const generatedCanvas = generateBinaryLayerCanvas(layer, width, height);
      canvas.width = generatedCanvas.width;
      canvas.height = generatedCanvas.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(generatedCanvas, 0, 0);
    });
  };

  const toggleLayer = (layerNum: number) => {
    setActiveLayers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(layerNum)) {
        newSet.delete(layerNum);
      } else {
        newSet.add(layerNum);
      }
      return newSet;
    });
  };

  const handleDownloadMerged = async () => {
    if (mergedCanvasRef.current) {
      await downloadCanvasUtil(mergedCanvasRef.current, 'binary_merged.png');
    }
  };

  const handleDownloadLayer = async (index: number) => {
    const layer = layers[index];
    const downloadWidth = 500;
    const downloadHeight = downloadWidth / aspectRatio;
    const canvas = generateBinaryLayerCanvas(layer, downloadWidth, downloadHeight);
    await downloadCanvasUtil(canvas, `binary_layer_${index + 1}.png`);
  };

  if (layers.length === 0) return null;

  return (
    <div className="binary-layer-view">
      <h3>二値画像レイヤー</h3>

      <div className="merged-view">
        <div className="section-header">
          <h4>合成プレビュー</h4>
          <button onClick={handleDownloadMerged} className="download-btn">
            <Download size={16} />
            ダウンロード
          </button>
        </div>
        <canvas ref={mergedCanvasRef} className="merged-canvas" />

        <div className="layer-toggles">
          {layers.map((_, index) => {
            const layerNum = index + 1;
            return (
              <button
                key={layerNum}
                onClick={() => toggleLayer(layerNum)}
                className={`layer-toggle ${activeLayers.has(layerNum) ? 'active' : ''}`}
              >
                {activeLayers.has(layerNum) ? <Eye size={16} /> : <EyeOff size={16} />}
                Layer {layerNum}
              </button>
            );
          })}
        </div>
      </div>

      <div className="individual-layers">
        <div className="section-header">
          <h4>個別レイヤー</h4>
          <div className="opacity-control">
            <label htmlFor="binary-opacity-slider">透過率倍率: {opacityMultiplier.toFixed(2)}</label>
            <input
              id="binary-opacity-slider"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={opacityMultiplier}
              onChange={(e) => setOpacityMultiplier(Number(e.target.value))}
              className="slider"
              style={{ width: '150px', marginLeft: '10px' }}
            />
          </div>
        </div>

        <div className="layer-grid">
          {layers.map((_, index) => {
            const layerNum = index + 1;
            const adjustedOpacity = Math.pow(opacityMultiplier, layerNum);
            return (
              <div key={layerNum} className="layer-item">
                <div className="layer-header">
                  <span>Layer {layerNum} (透過率: {(adjustedOpacity * 100).toFixed(1)}%)</span>
                  <button
                    onClick={() => handleDownloadLayer(index)}
                    className="download-btn"
                    title="ダウンロード"
                  >
                    <Download size={16} />
                  </button>
                </div>
                <canvas
                  ref={(el) => { layerCanvasRefs.current[index] = el; }}
                  className="layer-canvas"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>
            );
          })}
        </div>

        <button onClick={onDownloadAll} className="download-all-btn">
          <Download size={20} />
          全レイヤーをZIPでダウンロード
        </button>
      </div>
    </div>
  );
};