import React from "react";

interface ReviewGalleryProps {
  images: string[];
  onImageClick: (index: number) => void;
}

export const ReviewGallery: React.FC<ReviewGalleryProps> = ({ images, onImageClick }) => {
  if (images.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar justify-end">
      {images.slice(0, 5).map((img, idx) => (
        <div
          key={idx}
          className="relative group cursor-pointer shrink-0"
          onClick={() => onImageClick(idx)}
        >
          <img
            src={img}
            className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-md border border-slate-200 group-hover:opacity-80 transition-opacity"
            alt={`Gallery ${idx}`}
          />
          {idx === 4 && images.length > 5 && (
            <div className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center text-white font-bold text-sm">
              +{images.length - 5}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

interface ReviewImageGridProps {
  images: string[];
  allImages: string[];
  onImageClick: (globalIndex: number) => void;
}

export const ReviewImageGrid: React.FC<ReviewImageGridProps> = ({ images, allImages, onImageClick }) => {
  if (!images || images.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {images.map((pic, idx) => (
        <img
          key={idx}
          src={pic}
          alt="Review"
          className="w-24 h-24 object-cover rounded-lg border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => {
            const globalIdx = allImages.indexOf(pic);
            onImageClick(globalIdx !== -1 ? globalIdx : 0);
          }}
        />
      ))}
    </div>
  );
};
