import React, { useState } from 'react';
import { Upload } from 'lucide-react';

interface ImageUploaderProps {
  onImageLoad: (image: HTMLImageElement) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageLoad }) => {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgUrl = event.target?.result as string;
      setPreview(imgUrl);

      const img = new Image();
      img.onload = () => {
        onImageLoad(img);
      };
      img.src = imgUrl;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="image-uploader">
      <label className="upload-label">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="upload-input"
        />
        <div className="upload-button">
          <Upload size={24} />
          <span>画像をアップロード</span>
        </div>
      </label>
      {preview && (
        <div className="preview-container">
          <img src={preview} alt="Preview" className="preview-image" />
        </div>
      )}
    </div>
  );
};