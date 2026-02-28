import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.length >= 2) {
      const timer = setTimeout(() => {
        searchProducts();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  const searchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/products/search?q=${query}`);
      setResults(response.data.results);
      setIsOpen(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId) => {
    setQuery('');
    setIsOpen(false);
    navigate(`/product/${productId}`);
  };

  return (
    <div className="relative w-full max-w-xl">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full px-4 py-3 pl-12 pr-10 border-b-2 border-neutral-stone/30 focus:border-gold-metallic outline-none bg-transparent text-sapphire-deep"
          data-testid="search-input"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-stone" />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-stone hover:text-sapphire-deep"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-neutral-alabaster shadow-xl max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-neutral-stone">Searching...</div>
          ) : results.length > 0 ? (
            <div>
              {results.map((product) => (
                <button
                  key={product.product_id}
                  onClick={() => handleProductClick(product.product_id)}
                  className="w-full p-4 flex items-center space-x-4 hover:bg-neutral-alabaster transition-colors text-left"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-16 h-16 object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sapphire-deep">{product.name}</p>
                    <p className="text-sm text-neutral-stone">{product.category}</p>
                    <p className="text-gold-metallic font-semibold">${product.price.toFixed(2)}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-neutral-stone">No products found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;