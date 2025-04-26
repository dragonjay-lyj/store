// src/components/react/App.jsx
import React, { useState, useEffect, useContext } from 'react';
import FilterProvider, { useFilter } from './FilterContext.jsx';
import FilterAndSearch from './FilterAndSearch.jsx';
import ProductGrid from './ProductGrid.jsx';

// 定义 props 类型，增强类型安全
interface AppProps {
  initialProducts: Array<{
    title: string | { zh: string; en: string; ja?: string };
    coverImage: string;
    price: number;
    tags: string[];
    isNSFW: boolean;
    sellerName: string;
    sellerAvatar?: string;
    slug: string;
    description?: string | { zh: string; en: string; ja?: string };
  }>;
  pageSize?: number;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
  };
}

/**
 * App 组件作为搜索和商品网格的入口容器
 * 负责组合上下文提供者和子组件，支持未来的美化（如 Tailwind CSS 布局样式）和动效（如加载动画）
 * 提供初始数据预处理、加载状态和错误处理支持，动态调整 pageSize 以适配移动端
 * 未来可扩展全局主题、布局调整或更多子组件
 * @param {AppProps} props - 组件属性
 */
export default function App({ initialProducts, pageSize = 12, theme = {} }: AppProps) {
  const [processedProducts, setProcessedProducts] = useState(initialProducts);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adjustedPageSize, setAdjustedPageSize] = useState(pageSize);

  // 使用 FilterContext 获取 isMobile 状态
  const { isMobile } = useFilter();

  useEffect(() => {
    // 动态调整 pageSize，移动端减少加载数量以提升性能
    setAdjustedPageSize(isMobile ? Math.max(6, pageSize / 2) : pageSize);
  }, [isMobile, pageSize]);

  useEffect(() => {
    // 模拟数据加载或预处理逻辑
    setIsLoading(true);
    try {
      // 简单的预处理，确保数据完整性
      const validProducts = initialProducts.filter(product => {
        const title = typeof product.title === 'string' ? product.title : product.title.zh;
        return title && product.coverImage && typeof product.price === 'number';
      });
      // 模拟异步加载延迟
      setTimeout(() => {
        setProcessedProducts(validProducts);
        setIsLoading(false);
      }, 500);
    } catch (err) {
      setError('加载商品数据时出错，请稍后重试。');
      setIsLoading(false);
    }
  }, [initialProducts]);

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    // 模拟重试逻辑
    setTimeout(() => {
      setProcessedProducts(initialProducts);
      setIsLoading(false);
    }, 500);
  };

  if (error) {
    return (
      <div className="text-center py-10 px-2 sm:px-0 bg-red-50 rounded-lg shadow-inner mx-2 sm:mx-0 animate-fadeIn">
        <p className="text-red-500 text-sm sm:text-base mb-4">{error}</p>
        <button 
          onClick={handleRetry}
          className="text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
        >
          重试
        </button>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 sm:mt-0 sm:ml-4 text-red-500 hover:text-red-700 text-sm transition-colors duration-200"
        >
          重新加载页面
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-10 px-2 sm:px-0 text-gray-500 text-sm sm:text-base animate-pulse">
        加载商品数据中...
      </div>
    );
  }

  return (
    <FilterProvider>
      {/* 应用主题样式，未来可扩展 */}
      <div 
        className="app-container mx-auto"
        style={{
          '--primary-color': theme.primaryColor || '#9333ea',
          '--secondary-color': theme.secondaryColor || '#ec4899',
        } as React.CSSProperties}
      >
        <FilterAndSearch products={processedProducts} />
        <ProductGrid initialProducts={processedProducts} pageSize={adjustedPageSize} />
        {/* 预留插槽，支持未来扩展 */}
        <slot name="extra-content" />
      </div>
    </FilterProvider>
  );
}