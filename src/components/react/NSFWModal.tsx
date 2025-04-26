// src/components/react/NSFWModal.jsx
import React, { useState, useEffect, useRef } from 'react';

// 定义 props 类型接口，预留扩展性
interface NSFWModalProps {
  isNSFW: boolean;
  onClose?: () => void;
  onAgeConfirmed?: (confirmed: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    fontFamily?: string;
  };
  animationType?: 'fade' | 'bounce' | 'slide'; // 弹窗动画类型
  draggable?: boolean; // 是否支持拖动
}

export default function NSFWModal({ 
  isNSFW, 
  onClose = () => {}, 
  onAgeConfirmed = () => {}, 
  className = '', 
  style = {}, 
  theme = {}, 
  animationType = 'bounce',
  draggable = false
}: NSFWModalProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [isAdult, setIsAdult] = useState<boolean | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedAge = localStorage.getItem('isAdult');
    if (storedAge !== null) {
      setIsAdult(storedAge === 'true');
    } else {
      const confirmed = window.confirm('您已满18岁吗？');
      setIsAdult(confirmed);
      localStorage.setItem('isAdult', confirmed.toString());
      onAgeConfirmed(confirmed);
    }
    if (isNSFW && storedAge !== null && storedAge !== 'true') {
      setShowWarning(true);
    }
  }, [isNSFW, onAgeConfirmed]);

  // 键盘快捷键支持（如 Escape 关闭）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    if (showWarning) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [showWarning]);

  // 拖动支持
  const handleMouseDown = (e: React.MouseEvent) => {
    if (draggable) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && dragStart) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  // 触摸拖动支持
  const handleTouchStart = (e: React.TouchEvent) => {
    if (draggable) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && dragStart) {
      const touch = e.touches[0];
      const newX = touch.clientX - dragStart.x;
      const newY = touch.clientY - dragStart.y;
      setPosition({ x: newX, y: newY });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  const handleResetAge = () => {
    localStorage.removeItem('isAdult');
    setIsAdult(null);
    setShowWarning(false);
    // 触发重新确认
    const confirmed = window.confirm('您已满18岁吗？');
    setIsAdult(confirmed);
    localStorage.setItem('isAdult', confirmed.toString());
    onAgeConfirmed(confirmed);
    if (!confirmed && isNSFW) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setShowWarning(false);
      onClose();
    }, 300); // 匹配关闭动画时长
  };

  if (!showWarning && !isClosing) return null;

  // 动态选择弹窗动画类
  const getAnimationClass = () => {
    if (isClosing) {
      switch (animationType) {
        case 'slide':
          return 'animate-modalSlideOut';
        case 'bounce':
          return 'animate-modalBounceOut';
        default:
          return 'animate-modalFadeOut';
      }
    } else {
      switch (animationType) {
        case 'slide':
          return 'animate-modalSlideIn';
        case 'bounce':
          return 'animate-modalBounceIn';
        default:
          return 'animate-modalFadeIn';
      }
    }
  };

  // 应用主题样式
  const primaryColor = theme.primaryColor || '#9333ea'; // purple-500
  const secondaryColor = theme.secondaryColor || '#d1d5db'; // gray-300
  const backgroundColor = theme.backgroundColor || '#ffffff'; // white
  const textColor = theme.textColor || '#374151'; // gray-700
  const borderColor = theme.borderColor || '#e5e7eb'; // gray-200
  const fontFamily = theme.fontFamily || 'inherit';

  // 动态调整弹窗位置，确保不超出视口
  const modalStyle = draggable 
    ? { 
        position: 'absolute', 
        left: '50%', 
        top: '50%', 
        transform: 'translate(-50%, -50%)', 
        margin: 0,
        ...style,
        ...position
      } 
    : style;

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm flex items-center justify-center z-50 px-2 sm:px-4 ${className}`} 
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        ref={modalRef}
        className={`p-4 sm:p-6 rounded-xl shadow-2xl max-w-sm sm:max-w-md w-full text-center transition-all duration-300 ${getAnimationClass()} border`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <h2 className="text-lg sm:text-2xl font-bold text-red-500 mb-3 sm:mb-4">内容限制</h2>
        <p className="mb-4 sm:mb-6 text-sm sm:text-base" style={{ color: textColor }}>
          抱歉，此商品不适合未成年人查看。
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <button 
            onClick={handleClose} 
            className="text-white px-3 py-1 sm:px-4 sm:py-2 rounded-lg hover:bg-opacity-90 transition-all duration-200 transform hover:scale-105 relative group active:bg-opacity-80"
            style={{ backgroundColor: primaryColor }}
          >
            关闭
            {/* 按钮悬停发光效果 */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300 -z-10 rounded-lg supports-reduced-motion:opacity-0"
              style={{ backgroundColor: primaryColor }}
            ></div>
            {/* 按钮点击涟漪效果 */}
            <span 
              className="absolute inset-0 opacity-0 active:opacity-20 active:animate-ripple rounded-lg transform scale-0 supports-reduced-motion:opacity-0"
              style={{ backgroundColor: primaryColor }}
            ></span>
          </button>
          <button 
            onClick={handleResetAge} 
            className="px-3 py-1 sm:px-4 sm:py-2 rounded-lg hover:bg-opacity-90 transition-all duration-200 transform hover:scale-105 relative group active:bg-opacity-80"
            style={{ backgroundColor: secondaryColor, color: textColor }}
          >
            重新确认年龄
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300 -z-10 rounded-lg supports-reduced-motion:opacity-0"
              style={{ backgroundColor: secondaryColor }}
            ></div>
            <span 
              className="absolute inset-0 opacity-0 active:opacity-20 active:animate-ripple rounded-lg transform scale-0 supports-reduced-motion:opacity-0"
              style={{ backgroundColor: secondaryColor }}
            ></span>
          </button>
        </div>
      </div>
    </div>
  );
}