import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const banners = [
  {
    id: 1,
    image: 'https://cdn.galaxycine.vn/media/2026/5/4/tham-my-vien-am-phu-2048_1777881826208.jpg',
    title: 'Thẩm Mỹ Viện Âm Phủ',
  },
  {
    id: 2,
    image: 'https://cdn.galaxycine.vn/media/2026/4/24/doi-tham-tu-cuu-2048_1777004770388.jpg',
    title: 'Đội Thám Tử Cừu',
  },
  {
    id: 3,
    image: 'https://cdn.galaxycine.vn/media/2026/5/6/galaxy-go-an-lac-1_1778039054087.jpg',
    title: 'Galaxy Cine Go An Lạc',
  },
  {
    id: 4,
    image: 'https://cdn.galaxycine.vn/media/2026/4/22/qua-tang-ruc-ro---xem-phim-het-co-2048_1776832668618.jpg',
    title: 'Quà Tặng Rực Rỡ',
  },
];

const BannerSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === banners.length - 1 ? 0 : prevIndex + 1));
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? banners.length - 1 : prevIndex - 1));
  };

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide, isHovered]);

  return (
    <div
      className="relative w-full overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-[250px] md:h-[60vh] flex items-center justify-center">
        {/* Main Banner Container */}
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          {banners.map((banner, index) => {
            // Calculate relative position
            let position = 'translate-x-full opacity-0 scale-90';
            if (index === currentIndex) {
              position = 'translate-x-0 opacity-100 scale-100 z-20';
            } else if (index === (currentIndex === 0 ? banners.length - 1 : currentIndex - 1)) {
              position = '-translate-x-[75%] opacity-40 scale-90 z-10';
            } else if (index === (currentIndex === banners.length - 1 ? 0 : currentIndex + 1)) {
              position = 'translate-x-[75%] opacity-40 scale-90 z-10';
            }

            return (
              <div
                key={banner.id}
                className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out flex items-center justify-center ${position}`}
              >
                <div className="w-full h-[90%] md:w-[80%] relative overflow-hidden">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-fill"
                  />
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 md:left-8 z-30 p-3 rounded-full bg-black/30 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/50 hover:scale-110 active:scale-95"
          aria-label="Previous slide"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 md:right-8 z-30 p-3 rounded-full bg-black/30 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/50 hover:scale-110 active:scale-95"
          aria-label="Next slide"
        >
          <ChevronRight size={24} />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 transition-all duration-300 rounded-full ${index === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BannerSlider;
