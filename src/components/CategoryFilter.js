import React from 'react';
import { motion } from 'framer-motion';

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange, className = '' }) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <div className="flex space-x-3 min-w-max pb-2">
        {categories.map((category, index) => (
          <motion.button
            key={category.name}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: index * 0.05 }}
            onClick={() => onCategoryChange(category.name)}
            className={`px-6 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              selectedCategory === category.name
                ? 'bg-primary-600 text-white shadow-lg'
                : 'bg-white text-dark-700 hover:bg-primary-50 hover:shadow-md border border-dark-200'
            }`}
          >
            {category.name}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
