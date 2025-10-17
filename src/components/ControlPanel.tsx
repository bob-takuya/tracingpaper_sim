import React from 'react';

interface ControlPanelProps {
  numLayers: number;
  gridRows: number;
  gridCols: number;
  onNumLayersChange: (value: number) => void;
  onGridRowsChange: (value: number) => void;
  onGridColsChange: (value: number) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  numLayers,
  gridRows,
  gridCols,
  onNumLayersChange,
  onGridRowsChange,
  onGridColsChange,
}) => {
  return (
    <div className="control-panel">
      <div className="control-item">
        <label htmlFor="num-layers">トレーシングペーパー枚数: {numLayers}</label>
        <input
          id="num-layers"
          type="range"
          min="1"
          max="10"
          value={numLayers}
          onChange={(e) => onNumLayersChange(Number(e.target.value))}
          className="slider"
        />
      </div>

      <div className="control-item">
        <label htmlFor="grid-rows">縦分割数: {gridRows}</label>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            id="grid-rows"
            type="range"
            min="5"
            max="100"
            value={gridRows}
            onChange={(e) => onGridRowsChange(Number(e.target.value))}
            className="slider"
            style={{ flex: 1 }}
          />
          <input
            type="number"
            min="5"
            max="100"
            value={gridRows}
            onChange={(e) => onGridRowsChange(Number(e.target.value))}
            className="number-input"
            style={{ width: '60px' }}
          />
        </div>
      </div>

      <div className="control-item">
        <label htmlFor="grid-cols">横分割数: {gridCols}</label>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            id="grid-cols"
            type="range"
            min="5"
            max="100"
            value={gridCols}
            onChange={(e) => onGridColsChange(Number(e.target.value))}
            className="slider"
            style={{ flex: 1 }}
          />
          <input
            type="number"
            min="5"
            max="100"
            value={gridCols}
            onChange={(e) => onGridColsChange(Number(e.target.value))}
            className="number-input"
            style={{ width: '60px' }}
          />
        </div>
      </div>
    </div>
  );
};