import React, { useState, useEffect } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';

const ProductFilters = ({ onFilterChange, categories = [] }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    subcategory: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest',
    inStock: false
  });

  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters]);

  const handleCategoryChange = (categoryName) => {
    const category = categories.find(c => c.name === categoryName);
    setSelectedCategory(category);
    setFilters({
      ...filters,
      category: categoryName,
      subcategory: ''
    });
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      subcategory: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'newest',
      inStock: false
    });
    setSelectedCategory(null);
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  return (
    <div className="bg-white border border-neutral-alabaster p-6 sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-sapphire-deep" />
          <h3 className="font-display text-xl text-sapphire-deep">Filters</h3>
        </div>
        <button
          onClick={clearFilters}
          className="text-sm text-gold-metallic hover:text-gold-matte transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-6">
        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-sapphire-deep mb-2">Sort By</label>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            className="w-full px-4 py-2 border border-neutral-stone/30 focus:border-gold-metallic outline-none bg-white"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-sapphire-deep mb-2">Category</label>
          <select
            value={filters.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-4 py-2 border border-neutral-stone/30 focus:border-gold-metallic outline-none bg-white"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.category_id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Subcategory */}
        {selectedCategory && selectedCategory.subcategories && selectedCategory.subcategories.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-sapphire-deep mb-2">Subcategory</label>
            <select
              value={filters.subcategory}
              onChange={(e) => setFilters({ ...filters, subcategory: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-stone/30 focus:border-gold-metallic outline-none bg-white"
            >
              <option value="">All {selectedCategory.name}</option>
              {selectedCategory.subcategories.map((sub, index) => (
                <option key={index} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        )}

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-sapphire-deep mb-2">Price Range</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-stone/30 focus:border-gold-metallic outline-none"
            />
            <span className="text-neutral-stone">-</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-stone/30 focus:border-gold-metallic outline-none"
            />
          </div>
        </div>

        {/* In Stock Only */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="inStock"
            checked={filters.inStock}
            onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })}
            className="h-4 w-4 text-gold-metallic focus:ring-gold-metallic border-neutral-stone"
          />
          <label htmlFor="inStock" className="text-sm text-sapphire-deep cursor-pointer">
            In Stock Only
          </label>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;