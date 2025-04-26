// src/components/react/ImageCarousel.jsx (最终修正)
import React, { useState, useEffect, useCallback, useRef } from 'react';

export default function ImageCarousel({ 
  images = [], // 添加默认值以避免空数组问题
  autoPlay = true, 
  interval = 5000, 
  animationType = 'fade', // 支持 'fade', 'slide', 'zoom'
  touchThreshold = 50,
  preloadImages = true // 是否预加载图片
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobileAdjusted, setIsMobileAdjusted] = useState(false);
  const [adjustedThreshold, setAdjustedThreshold] = useState(touchThreshold);
  const [touchDirection, setTouchDirection] = useState(null);
  const [preloaded, setPreloaded] = useState(false);
  const pulseTimerRef = useRef(null);

  // 将 useCallback 函数定义提前，确保在 useEffect 之前初始化
  // 注释：确保依赖数组中引用的函数在定义时已初始化，避免 ReferenceError
  const nextImage = useCallback(() => {
    if (images.length > 0) {
      setCurrentIndex((currentIndex + 1) % images.length);
    }
  }, [currentIndex, images.length]);

  const prevImage = useCallback(() => {
    if (images.length > 0) {
      setCurrentIndex((currentIndex - 1 + images.length) % images.length);
    }
  }, [currentIndex, images.length]);

  // 自动播放
  useEffect(() => {
    if (autoPlay && images.length > 1 && !isPaused) {
      const timer = setInterval(nextImage, interval);
      return () => clearInterval(timer);
    }
  }, [autoPlay, images.length, interval, nextImage, isPaused]);

  // 页面可见性监听，离开页面时暂停播放
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPaused(true);
      } else if (autoPlay) {
        setIsPaused(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [autoPlay]);

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
      setIsPaused(true); // 用户交互时暂停自动播放
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextImage, prevImage]);

  // 动态调整触摸阈值，移动端更灵敏
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 640;
      setIsMobileAdjusted(mobile);
      setAdjustedThreshold(mobile ? touchThreshold * 0.8 : touchThreshold);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [touchThreshold]);

  // 预加载图片
  useEffect(() => {
    if (preloadImages && images.length > 0) {
      const preload = async () => {
        const promises = images.map(img => {
          return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = resolve;
            image.onerror = reject;
            image.src = img;
          });
        });
        try {
          await Promise.all(promises);
          setPreloaded(true);
        } catch (err) {
          console.error('图片预加载失败:', err);
          setPreloaded(true); // 即使失败也继续显示
        }
      };
      preload();
    } else {
      setPreloaded(true);
    }
  }, [images, preloadImages]);

  // 触摸滑动
  const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX);
  const handleTouchMove = (e) => {
    if (touchStart !== null) {
      const touchCurrent = e.touches[0].clientX;
      if (touchStart - touchCurrent > adjustedThreshold / 2) {
        setTouchDirection('right');
      } else if (touchCurrent - touchStart > adjustedThreshold / 2) {
        setTouchDirection('left');
      } else {
        setTouchDirection(null);
      }
    }
  };
  const handleTouchEnd = (e) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    if (touchStart - touchEnd > adjustedThreshold) nextImage();
    if (touchEnd - touchStart > adjustedThreshold) prevImage();
    setTouchStart(null);
    setTouchDirection(null);
    setIsPaused(true); // 用户交互时暂停自动播放
  };

  const togglePause = () => setIsPaused(!isPaused);

  // 动态选择动画类
  const getImageAnimationClass = () => {
    switch (animationType) {
      case 'slide':
        return 'transition-transform duration-500';
      case 'zoom':
        return 'transition-transform duration-500';
      default:
        return 'transition-opacity duration-500';
    }
  };

  // 动态样式，基于动画类型
  const getImageContainerStyle = () => {
    if (animationType === 'slide') {
      return { transform: `translateX(-${currentIndex * 100}%)` };
    }
    return {};
  };

  return (
    <div 
      className="relative w-full rounded-xl overflow-hidden shadow-xl bg-black/10"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {!preloaded ? (
        <div className="w-full h-56 sm:h-80 flex items-center justify-center bg-gray-200 rounded-xl animate-pulse">
          <p className="text-gray-500 text-sm sm:text-base">图片加载中...</p>
        </div>
      ) : images.length === 0 ? (
        <div className="w-full h-56 sm:h-80 flex items-center justify-center bg-gray-200 rounded-xl">
          <p className="text-gray-500 text-sm sm:text-base">暂无图片</p>
        </div>
      ) : (
        <div className="relative w-full h-56 sm:h-80 overflow-hidden">
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`商品图片 ${index + 1}/${images.length}`}
              className={`absolute inset-0 w-full h-full object-cover rounded-xl ${
                index === currentIndex 
                  ? 'opacity-100 scale-100' 
                  : animationType === 'fade' 
                    ? 'opacity-0 scale-100' 
                    : animationType === 'slide' 
                      ? 'opacity-100 scale-100' 
                      : 'opacity-0 scale-105'
              } ${getImageAnimationClass()}`}
              style={animationType === 'slide' ? { left: `${(index - currentIndex) * 100}%` } : {}}
            />
          ))}
        </div>
      )}
      {images.length > 0 && (
        <>
          <button 
            onClick={prevImage} 
            className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-full hover:bg-opacity-75 transition-all duration-200 transform hover:scale-110 relative group"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            {/* 按钮悬停发光效果 */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10 bg-white rounded-full supports-reduced-motion:opacity-0"></div>
          </button>
          <button 
            onClick={nextImage} 
            className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-full hover:bg-opacity-75 transition-all duration-200 transform hover:scale-110 relative group"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10 bg-white rounded-full supports-reduced-motion:opacity-0"></div>
          </button>
          {images.length > 1 && (
            <button 
              onClick={togglePause} 
              className="absolute left-1/2 bottom-2 sm:bottom-3 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full hover:bg-opacity-75 transition-all duration-200 text-xs sm:text-sm relative group"
            >
              {isPaused ? '播放' : '暂停'}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10 bg-white rounded-full supports-reduced-motion:opacity-0"></div>
            </button>
          )}
          <div className="absolute bottom-2 sm:bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1 sm:gap-2 mt-2">
            {images.map((_, index) => (
              <span
                key={index}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 transform relative ${
                  index === currentIndex 
                    ? 'bg-white scale-125 animate-pulseDot' 
                    : 'bg-gray-300 hover:scale-110'
                }`}
              >
                {index === currentIndex && (
                  <div className="absolute inset-0 rounded-full bg-white opacity-0 animate-pulseRing -z-10 supports-reduced-motion:opacity-0"></div>
                )}
              </span>
            ))}
          </div>
          {/* 触摸滑动指示器 */}
          {touchDirection && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
              <svg 
                className={`w-8 h-8 sm:w-12 sm:h-12 text-white opacity-70 animate-touchIndicator ${
                  touchDirection === 'right' ? 'rotate-0' : 'rotate-180'
                }`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          )}
        </>
      )}
      {/* 背景渐变装饰 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-30 -z-10 rounded-xl"></div>
    </div>
  );
}