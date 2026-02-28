import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import ProductFilters from '../components/ProductFilters';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.category) params.append('category', filters.category);
      if (filters.subcategory) params.append('subcategory', filters.subcategory);
      if (filters.minPrice) params.append('min_price', filters.minPrice);
      if (filters.maxPrice) params.append('max_price', filters.maxPrice);
      if (filters.sortBy) params.append('sort_by', filters.sortBy);
      if (filters.inStock) params.append('in_stock', 'true');

      const url = `${API}/products/enhanced?${params}`;
      const response = await axios.get(url);
      setProducts(response.data.products);
      setTotalCount(response.data.total || response.data.products.length);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-gold-metallic font-medium mb-4">
            Our Collection
          </p>
          <h1 className="font-display text-4xl lg:text-5xl text-sapphire-deep mb-2">
            Exquisite Jewellery
          </h1>
          <p className="text-neutral-stone">
            {totalCount} {totalCount === 1 ? 'Product' : 'Products'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <ProductFilters 
              onFilterChange={setFilters} 
              categories={categories}
            />
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center py-24">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-metallic"></div>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12" data-testid="products-grid">
                {products.map((product) => (
                  <ProductCard key={product.product_id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-neutral-alabaster">
                <p className="text-neutral-stone text-lg">No products found matching your filters.</p>
                <button
                  onClick={() => setFilters({})}
                  className="mt-4 text-gold-metallic hover:text-gold-matte font-medium"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
