import React, { useRef, useCallback } from 'react';

interface ImageUploadCardProps {
  title: string;
  onImageSelect: (file: File) => void;
  previewUrl: string | null;
}

const ImageUploadCard: React.FC<ImageUploadCardProps> = ({ title, onImageSelect, previewUrl }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  }, [onImageSelect]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };


  return (
    <div className="bg-white w-full shadow-lg rounded-2xl p-6 flex flex-col items-center">
      <h3 className="text-xl font-bold mb-4 text-gray-800">{title}</h3>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-400 w-full h-48 flex items-center justify-center rounded-xl cursor-pointer hover:bg-gray-50 transition-colors duration-300 bg-cover bg-center"
        style={{ backgroundImage: `url(${previewUrl})` }}
      >
        {!previewUrl && (
          <div className="text-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            <span className="mt-2 block font-semibold">اضغط لرفع الصورة</span>
            <span className="mt-1 block text-xs">أو اسحبها وأفلتها هنا</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploadCard;
