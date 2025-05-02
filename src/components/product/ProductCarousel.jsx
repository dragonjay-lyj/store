import React, { useState, useRef, useEffect } from 'react';

export default function ProductCarousel({ images, alt, children }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState({ src: '', alt: '' });
  const carouselRef = useRef(null);

  useEffect(() => {
    const carouselContainer = carouselRef.current;
    let touchStartX = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      if (diff > 50) {
        handleNext(); // 向左滑动，下一张
      } else if (diff < -50) {
        handlePrev(); // 向右滑动，上一张
      }
    };

    if (carouselContainer) {
      carouselContainer.addEventListener('touchstart', handleTouchStart);
      carouselContainer.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      if (carouselContainer) {
        carouselContainer.removeEventListener('touchstart', handleTouchStart);
        carouselContainer.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const goToImage = (index) => {
    setCurrentIndex(index);
  };

  const openModal = (src, alt) => {
    setModalImage({ src, alt });
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden'; // 防止背景滚动
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = ''; // 恢复背景滚动
  };

  return (
    <div className="product-detail-container grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-fade-in">
      {/* 左边：商品封面图或轮播图 */}
      <div
        ref={carouselRef}
        className="carousel-container relative w-full h-0 pb-[100%] md:pb-[100%] bg-gray-100 rounded-xl overflow-hidden shadow-lg"
      >
        {/* 图片列表 */}
        <div className="carousel-images absolute inset-0 w-full h-full">
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`${alt} 图片 ${index + 1}`}
              className={`carousel-image absolute inset-0 w-full h-full object-cover transition-opacity duration-700 transform ${
                index === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
              fetchpriority={index === 0 ? 'high' : 'low'}
              onClick={() => openModal(img, `${alt} 图片 ${index + 1}`)}
            />
          ))}
        </div>

        {/* 左右切换箭头（桌面端显示） */}
        <button
          onClick={handlePrev}
          className="carousel-prev absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center hidden md:flex transition-all duration-200 transform hover:scale-110 hover:bg-indigo-600 hover:bg-opacity-80 shadow-md"
          aria-label="上一张图片"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          onClick={handleNext}
          className="carousel-next absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center hidden md:flex transition-all duration-200 transform hover:scale-110 hover:bg-indigo-600 hover:bg-opacity-80 shadow-md"
          aria-label="下一张图片"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* 底部小圆点指示器 */}
        <div className="carousel-indicators absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black bg-opacity-50 rounded-full p-2 shadow-md">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 transform hover:scale-125 ${
                index === currentIndex ? 'bg-indigo-400 scale-125' : 'bg-gray-300'
              }`}
              aria-label={`切换到第 ${index + 1} 张图片`}
            ></button>
          ))}
        </div>
      </div>

      {/* 右边：商品内容信息 */}
      <div className="product-info animate-fade-in-right">{children}</div>

      {/* 图片放大预览模态框 */}
      {isModalOpen && (
        <div
          className="image-modal fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity duration-400 opacity-100 animate-fade-in"
          onClick={closeModal}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={modalImage.src}
              alt={modalImage.alt}
              className="modal-image max-w-[90%] max-h-[90%] object-contain transform transition-transform duration-500 scale-105"
            />
            <button
              onClick={closeModal}
              className="modal-close absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-75 text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 hover:bg-indigo-600 hover:bg-opacity-80 shadow-md"
              aria-label="关闭图片预览"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}