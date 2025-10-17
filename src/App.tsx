import React, { useState, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ControlPanel } from './components/ControlPanel';
import { BinaryLayerView } from './components/BinaryLayerView';
import { AsciiArtSimulator } from './components/AsciiArtSimulator';
import { HelpModal } from './components/HelpModal';
import { HelpButton } from './components/HelpButton';
import { processImage, convertToBinaryLayers, BinaryLayer } from './utils/imageProcessor';
import { generateAsciiLayers, AsciiLayer } from './utils/asciiGenerator';
import { downloadAllLayersAsZip } from './utils/downloadHelper';
import './styles/main.css';

function App() {
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [imageAspectRatio, setImageAspectRatio] = useState(1);
  const [numLayers, setNumLayers] = useState(4);
  const [gridRows, setGridRows] = useState(30);
  const [gridCols, setGridCols] = useState(30);
  const [binaryLayers, setBinaryLayers] = useState<BinaryLayer[]>([]);
  const [asciiLayers, setAsciiLayers] = useState<AsciiLayer[]>([]);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleImageLoad = (image: HTMLImageElement) => {
    setLoadedImage(image);
    setImageAspectRatio(image.width / image.height);
    setBinaryLayers([]);
    setAsciiLayers([]);
  };

  // Real-time generation when parameters change
  useEffect(() => {
    if (!loadedImage) return;

    const generateLayers = async () => {
      try {
        const pixels = processImage(loadedImage, gridRows, gridCols);
        const binLayers = convertToBinaryLayers(pixels, numLayers);
        setBinaryLayers(binLayers);

        const asciiLyrs = generateAsciiLayers(
          binLayers.map(l => l.pixels),
          gridRows,
          gridCols
        );
        setAsciiLayers(asciiLyrs);
      } catch (error) {
        console.error('Error processing image:', error);
      }
    };

    generateLayers();
  }, [loadedImage, numLayers, gridRows, gridCols]);

  const handleDownloadAllBinary = async () => {
    if (binaryLayers.length === 0 || asciiLayers.length === 0) return;
    await downloadAllLayersAsZip(
      binaryLayers.map(l => l.pixels),
      asciiLayers.map(l => l.text),
      imageAspectRatio
    );
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>トレーシングペーパーのやつ</h1>
        <HelpButton onClick={() => setIsHelpOpen(true)} />
      </header>

      <main className="app-main">
        <section className="input-section">
          <ImageUploader onImageLoad={handleImageLoad} />
          <ControlPanel
            numLayers={numLayers}
            gridRows={gridRows}
            gridCols={gridCols}
            onNumLayersChange={setNumLayers}
            onGridRowsChange={setGridRows}
            onGridColsChange={setGridCols}
          />
        </section>

        {binaryLayers.length > 0 && (
          <section className="output-section">
            <BinaryLayerView
              layers={binaryLayers.map(l => l.pixels)}
              aspectRatio={imageAspectRatio}
              onDownloadAll={handleDownloadAllBinary}
            />
            <AsciiArtSimulator
              asciiLayers={asciiLayers}
              aspectRatio={imageAspectRatio}
            />
          </section>
        )}
      </main>

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}

export default App;