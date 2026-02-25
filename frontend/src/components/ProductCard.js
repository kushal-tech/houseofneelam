import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  return (
    <Link
      to={`/product/${product.product_id}`}
      className="group block"
      data-testid={`product-card-${product.product_id}`}
    >
      <div className="relative overflow-hidden aspect-[3/4] bg-neutral-alabaster">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.stock < 10 && product.stock > 0 && (
          <div className="absolute top-4 right-4 bg-gold-metallic text-white px-3 py-1 text-xs font-medium">
            Only {product.stock} left
          </div>
        )}
      </div>
      <div className="mt-4 space-y-2">
        <p className="text-xs uppercase tracking-widest text-neutral-stone font-medium">
          {product.category}
        </p>
        <h3 className="font-display text-xl text-sapphire-deep group-hover:text-gold-metallic transition-colors">
          {product.name}
        </h3>
        <p className="text-lg font-body text-gold-metallic font-semibold">
          ${product.price.toFixed(2)}
        </p>
      </div>
    </Link>
  );
};

export default ProductCard;