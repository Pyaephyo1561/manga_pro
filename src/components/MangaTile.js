import React from 'react';
import { Link } from 'react-router-dom';

const MangaTile = ({ manga }) => {
  const { id, title, cover } = manga;

  return (
    <Link to={`/manga/${id}`} className="block group">
      <div className="overflow-hidden rounded-lg bg-dark-100 w-full h-56 sm:h-64">
        <img
          src={cover}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onLoad={(e) => {
            e.target.style.opacity = '1';
          }}
          style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
        />
      </div>
      <h3 className="mt-2 text-sm sm:text-base font-semibold text-dark-900 line-clamp-2 group-hover:text-primary-600 transition-colors duration-200">
        {title}
      </h3>
    </Link>
  );
};

export default MangaTile;


