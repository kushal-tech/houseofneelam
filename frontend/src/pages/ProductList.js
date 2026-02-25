import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { Filter } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const url = selectedCategory === 'all' ? `${API}/products` : `${API}/products?category=${selectedCategory}`;
      const response = await axios.get(url);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', 'Rings', 'Necklaces', 'Earrings', 'Bracelets'];

  return (
    <div className="min-h-screen bg-white py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-widest text-gold-metallic font-medium mb-4">
            Our Collection
          </p>
          <h1 className="font-display text-4xl lg:text-5xl text-sapphire-deep mb-6">
            Exquisite Jewellery
          </h1>
        </div>

        {/* Category Filter */}
        <div className="flex items-center justify-center space-x-4 mb-12 flex-wrap gap-y-4" data-testid="category-filter">
          <Filter className="h-5 w-5 text-neutral-stone" />
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-gold-metallic text-white'
                  : 'bg-white border border-neutral-alabaster text-sapphire-deep hover:border-gold-metallic'
              }`}
              data-testid={`category-${category}`}
            >
              {category === 'all' ? 'All' : category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-metallic"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16" data-testid="products-grid">
            {products.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-24">
            <p className="text-neutral-stone text-lg">No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;