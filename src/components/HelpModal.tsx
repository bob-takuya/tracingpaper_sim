import React from 'react';
import { X } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>これはなんですか</h2>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <p>
            文字を書いたトレーシングペーパーを重ねると下の層ほど薄くなります。
          </p>
          <p>
            この倍率が半分だとすると、ピクセルの濃淡（0-1）を２進数で表した各桁を取ってくれば各層でどこを塗ればいいかわかるはず。とおもったんですが、どうでしょうか……
          </p>
        </div>
      </div>
    </div>
  );
};