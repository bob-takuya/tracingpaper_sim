import React from 'react';

interface HelpButtonProps {
  onClick: () => void;
}

export const HelpButton: React.FC<HelpButtonProps> = ({ onClick }) => {
  return (
    <button className="help-button" onClick={onClick} title="ヘルプ">
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="10"
          cy="10"
          r="9"
          stroke="#999"
          strokeWidth="1"
        />
        <text
          x="10"
          y="14"
          textAnchor="middle"
          fontSize="12"
          fill="#999"
          fontFamily="sans-serif"
        >
          ?
        </text>
      </svg>
    </button>
  );
};