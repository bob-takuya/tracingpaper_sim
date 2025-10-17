import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Download } from 'lucide-react';
import { AsciiLayer } from '../utils/asciiGenerator';
import { generateAsciiCanvas, downloadCanvas } from '../utils/downloadHelper';

interface AsciiArtSimulatorProps {
  asciiLayers: AsciiLayer[];
  aspectRatio: number;
}

export const AsciiArtSimulator: React.FC<AsciiArtSimulatorProps> = ({ asciiLayers, aspectRatio }) => {
  const [activeLayers, setActiveLayers] = useState<Set<number>>(new Set());
  const [opacityMultiplier, setOpacityMultiplier] = useState(0.5);
  const mergedCanvasRef = useRef<HTMLCanvasElement>(null);
  const layerCanvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  useEffect(() => {
    if (asciiLayers.length > 0) {
      setActiveLayers(new Set(asciiLayers.map(l => l.layer)));
    }
  }, [asciiLayers]);

  useEffect(() => {
    renderMergedView();
    renderIndividualLayers();
  }, [asciiLayers, activeLayers, opacityMultiplier, aspectRatio]);

  const renderMergedView = () => {
    const canvas = mergedCanvasRef.current;
    if (!canvas || asciiLayers.length === 0) return;

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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    asciiLayers.forEach((layer) => {
      if (!activeLayers.has(layer.layer)) return;

      // Apply opacity multiplier to each layer
      const adjustedOpacity = Math.pow(opacityMultiplier, layer.layer);
      const layerCanvas = generateAsciiCanvas(layer.text, canvasWidth, canvasHeight, adjustedOpacity);
      ctx.drawImage(layerCanvas, 0, 0);
    });
  };

  const renderIndividualLayers = () => {
    asciiLayers.forEach((layer, index) => {
      const canvas = layerCanvasRefs.current[index];
      if (!canvas) return;

      // Calculate canvas dimensions for individual layers
      const maxSize = 200;
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

      const generatedCanvas = generateAsciiCanvas(layer.text, canvasWidth, canvasHeight, 1);
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
      await downloadCanvas(mergedCanvasRef.current, 'ascii_merged.png');
    }
  };

  const handleDownloadLayer = async (index: number) => {
    const canvas = layerCanvasRefs.current[index];
    if (canvas) {
      await downloadCanvas(canvas, `ascii_layer_${index + 1}.png`);
    }
  };

  if (asciiLayers.length === 0) return null;

  return (
    <div className="ascii-simulator">
      <h3>文字のやつ</h3>

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
          {asciiLayers.map((layer) => (
            <button
              key={layer.layer}
              onClick={() => toggleLayer(layer.layer)}
              className={`layer-toggle ${activeLayers.has(layer.layer) ? 'active' : ''}`}
            >
              {activeLayers.has(layer.layer) ? <Eye size={16} /> : <EyeOff size={16} />}
              Layer {layer.layer}
            </button>
          ))}
        </div>
      </div>

      <div className="individual-layers">
        <div className="section-header">
          <h4>個別レイヤー</h4>
          <div className="opacity-control">
            <label htmlFor="opacity-slider">透過率倍率: {opacityMultiplier.toFixed(2)}</label>
            <input
              id="opacity-slider"
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
        <div className="layer-list">
          {asciiLayers.map((layer, index) => {
            const adjustedOpacity = Math.pow(opacityMultiplier, layer.layer);
            return (
              <div key={layer.layer} className="layer-item">
                <div className="layer-header">
                  <span>Layer {layer.layer} (透過率: {(adjustedOpacity * 100).toFixed(1)}%)</span>
                  <button
                    onClick={() => handleDownloadLayer(index)}
                    className="download-btn"
                    title="ダウンロード"
                  >
                    <Download size={16} />
                  </button>
                </div>
                <canvas
                  ref={(el) => (layerCanvasRefs.current[index] = el)}
                  className="layer-canvas small"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};