import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (file: File, dataUrl: string) => void;
  onClose?: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  onClose,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const processFile = (file: File) => {
    setErrorMessage(null);
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please provide a valid image file (JPEG, PNG, WEBP, HEIC).');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 20MB limit. Please choose a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        onImageSelected(file, dataUrl);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Unable to read the selected image file. Please try another.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        id="dish-file-upload-input"
      />
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-10 transition-all cursor-pointer flex flex-col items-center justify-center text-center group ${
          isDragging
            ? 'border-[#263A20] bg-[#EDE5DA]'
            : 'border-[#263A20]/25 bg-[#FAF7F0] hover:bg-[#EDE5DA]/50 hover:border-[#263A20]/45'
        }`}
      >
        {/* Center Icon Badge */}
        <div className="w-16 h-16 rounded-full bg-[#263A20]/10 flex items-center justify-center text-[#263A20] mb-4 group-hover:scale-105 transition-transform">
          <Upload className="w-7 h-7 stroke-[1.75]" />
        </div>

        {/* Text Guidelines */}
        <div className="space-y-1.5 max-w-sm mb-5">
          <p className="font-serif font-bold text-base sm:text-lg text-[#263A20]">
            Drag and drop your dish photo
          </p>
          <p className="text-xs text-[#263A20]/65 leading-relaxed">
            Supports food photos, dinner plates, restaurant snapshots, or homemade creations (PNG, JPG, WEBP)
          </p>
        </div>

        {/* Upload Action */}
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="bg-[#263A20] hover:bg-[#1C2C17] text-white px-5 py-2.5 rounded-full text-xs font-medium shadow-xs transition-colors cursor-pointer flex items-center gap-2"
          >
            <ImageIcon className="w-4 h-4" />
            Browse Device Photos
          </button>
        </div>

        {/* Error Feedback */}
        {errorMessage && (
          <div className="mt-4 flex items-center gap-2 text-xs text-red-700 bg-red-100/80 px-3.5 py-2 rounded-xl border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
