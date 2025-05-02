import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export default function AgeVerificationModal({ isAgeRestricted, productTitle }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // 检查 Cookie 是否已记录用户确认
    const isAgeVerified = Cookies.get('ageVerified');
    if (isAgeRestricted && !isAgeVerified) {
      setIsModalOpen(true);
    } else if (isAgeVerified === 'true') {
      setIsConfirmed(true);
    }
  }, [isAgeRestricted]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        handleCancel();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // 防止背景滚动
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = ''; // 恢复背景滚动
    };
  }, [isModalOpen]);

  const handleConfirm = () => {
    // 记录用户确认到 Cookie（有效期 30 天）
    Cookies.set('ageVerified', 'true', { expires: 30 });
    setIsConfirmed(true);
    setIsModalOpen(false);
    setShowNotification(true);

    // 3 秒后隐藏通知
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleCancel = () => {
    // 记录用户拒绝到 Cookie（有效期 1 天）
    Cookies.set('ageVerified', 'false', { expires: 1 });
    setIsModalOpen(false);
    // 跳转到首页或安全页面
    window.location.href = '/';
  };

  if (!isAgeRestricted || isConfirmed) {
    return showNotification ? (
      <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-xl z-50 flex items-center gap-2 animate-bounce-in transform transition-all duration-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
        已确认
      </div>
    ) : null;
  }

  return (
    isModalOpen && (
      <div
        className="age-modal fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity duration-500 opacity-100 animate-fade-in"
        onClick={handleCancel}
      >
        <div
          className="bg-white rounded-2xl p-6 w-11/12 max-w-md shadow-2xl transform transition-transform duration-500 scale-105 bg-gradient-to-b from-white to-gray-50"
          onClick={(e) => e.stopPropagation()} // 防止点击内容关闭弹窗
        >
          <div className="flex items-center gap-2 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-red-500 animate-pulse"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800">年龄限制提示</h2>
          </div>
          <p className="text-gray-700 mb-6 leading-relaxed text-base md:text-lg">
            您正在访问的商品 <strong className="text-indigo-600">{productTitle}</strong> 包含 NSFW 内容，仅限 18 岁以上用户查看。您确认符合年龄要求吗？
          </p>
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={handleCancel}
              className="cancel-btn px-4 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-transform duration-200 min-w-[80px] min-h-[44px] shadow-md"
            >
              离开
            </button>
            <button
              onClick={handleConfirm}
              className="confirm-btn px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-transform duration-200 min-w-[80px] min-h-[44px] shadow-md"
            >
              确认（18岁以上）
            </button>
          </div>
        </div>
      </div>
    )
  );
}