// src/components/react/ProductGrid.jsx
import { useState, useContext, useEffect } from 'react';
import NSFWModal from './NSFWModal.jsx';
import { FilterContext } from './FilterContext.js';

export default function ProductGrid({ initialProducts, pageSize = 12 }) {
  const [displayedProducts, setDisplayedProducts] = useState(initialProducts.slice(0, pageSize));
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredProducts, setFilteredProducts] = useState(initialProducts);
  const [showNSFWModal, setShowNSFWModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { searchTerm, activeTag } = useContext(FilterContext);

  useEffect(() => {
    // 根据搜索和标签过滤商品
    const filtered = initialProducts.filter(product => {
      const title = typeof product.title === 'string' ? product.title : product.title.zh;
      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTag = activeTag ? product.tags.includes(activeTag) : true;
      return matchesSearch && matchesTag;
    });
    setFilteredProducts(filtered);
    setDisplayedProducts(filtered.slice(0, pageSize));
    setCurrentPage(1);
  }, [searchTerm, activeTag, initialProducts, pageSize]);

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    const moreProducts = filteredProducts.slice(startIndex, endIndex);
    setDisplayedProducts([...displayedProducts, ...moreProducts]);
    setCurrentPage(nextPage);
  };

  const handleProductClick = (product, e) => {
    if (product.isNSFW) {
      const isAdult = localStorage.getItem('isAdult') === 'true';
      if (!isAdult) {
        e.preventDefault();
        setSelectedProduct(product);
        setShowNSFWModal(true);
      }
    }
  };

  return (
    <div>
      <div id="product-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
        {displayedProducts.map((product, index) => (
          <a 
            href={`/product/${product.slug}`} 
            key={index} 
            className="block" 
            onClick={(e) => handleProductClick(product, e)}
          >
            <div className="bg-white rounded-lg shadow-md hover:scale-105 transition-transform duration-300 max-w-xs mx-auto">
              <img
                src={product.coverImage}
                alt={typeof product.title === 'string' ? product.title : product.title.zh}
                loading="lazy"
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="p-4">
                <h3 className="text-lg font-bold truncate">
                  {typeof product.title === 'string' ? product.title : product.title.zh}
                </h3>
                <div className="flex items-center mb-2">
                  {product.sellerAvatar && (
                    <img
                      src={product.sellerAvatar}
                      alt={product.sellerName}
                      className="w-6 h-6 rounded-full mr-2"
                    />
                  )}
                  <span className="text-gray-600 truncate">{product.sellerName}</span>
                </div>
                <span className="text-sm text-red-500 block mb-2">
                  {product.isNSFW ? 'NSFW' : 'All Ages'}
                </span>
                <p className="text-lg font-semibold text-pink-500">￥{product.price}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
      {showNSFWModal && selectedProduct && (
        <NSFWModal
          isNSFW={selectedProduct.isNSFW}
          onClose={() => {
            setShowNSFWModal(false);
            setSelectedProduct(null);
            alert('NSFW 弹窗已关闭');
          }}
          onAgeConfirmed={(confirmed) => {
            alert(`年龄确认: ${confirmed ? '已满18岁' : '未满18岁'}`);
            if (confirmed) {
              window.location.href = `/product/${selectedProduct.slug}`;
            } else {
              setShowNSFWModal(false);
              setSelectedProduct(null);
            }
          }}
        />
      )}
      <div className="text-center mt-8">
        <button
          onClick={handleLoadMore}
          disabled={displayedProducts.length >= filteredProducts.length}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          加载更多
        </button>
      </div>
    </div>
  );
}