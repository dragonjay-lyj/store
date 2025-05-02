import React, { useState, useEffect } from 'react';

export default function BuyButton({ checkoutUrl }) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 加载 Lemon Squeezy 脚本
    const script = document.createElement('script');
    script.src = 'https://app.lemonsqueezy.com/js/lemon.js';
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleBuyClick = () => {
    setIsLoading(true);
    if (window.LemonSqueezy) {
      window.LemonSqueezy.Url.Open(checkoutUrl);
      // 延迟一段时间后重置加载状态，以防支付弹窗未打开
      setTimeout(() => setIsLoading(false), 3000);
    } else {
      // 如果 Lemon Squeezy 脚本未加载完成，直接跳转到 URL
      window.location.href = checkoutUrl;
      setTimeout(() => setIsLoading(false), 1000);
    }
  };

  return (
    <button
      onClick={handleBuyClick}
      disabled={isLoading}
      className={`w-full bg-green-600 text-white py-3 px-6 rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center min-h-[48px] shadow-md hover:shadow-lg transform hover:scale-105 bg-gradient-to-r from-green-500 to-green-600 ${
        isLoading ? 'opacity-70 cursor-not-allowed' : ''
      }`}
      aria-label="购买商品"
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin w-5 h-5 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          加载中...
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          立即购买
        </>
      )}
    </button>
  );
}