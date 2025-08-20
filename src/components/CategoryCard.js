import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Star, Clock, Eye, Calendar } from 'lucide-react';
import { formatTimeAgo } from '../utils/dateUtils';

const CategoryCard = ({ manga }) => {
  const {
    id,
    title,
    cover,
    rating,
    chapters,
    status,
    lastUpdated,
    description,
    genres,
    views,
    author,
    year
  } = manga;

  return (
    <Link to={`/manga/${id}`} className="block">
      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Cover Image */}
          <div className="flex-shrink-0">
            <img
              src={cover}
              alt={title}
              className="w-32 h-48 object-cover rounded-lg shadow-md"
              loading="lazy"
              onLoad={(e) => {
                e.target.style.opacity = '1';
              }}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/300x400/6B7280/FFFFFF?text=Cover+Image';
                e.target.style.opacity = '1';
              }}
              style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-dark-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors duration-200">
                  {title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-dark-600 mb-2">
                  {author && (
                    <span className="flex items-center gap-1">
                      <span>By {author}</span>
                    </span>
                  )}
                  {year && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{year}</span>
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  status === 'Ongoing' ? 'bg-green-100 text-green-800' :
                  status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {status}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-dark-600 mb-4 line-clamp-3">
              {description}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm text-dark-600">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>{rating || 0}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-dark-600">
                <BookOpen className="h-4 w-4" />
                <span>{chapters || 0} chapters</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-dark-600">
                <Eye className="h-4 w-4" />
                <span>{views || 0} views</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-dark-600">
                <Clock className="h-4 w-4" />
                <span>{formatTimeAgo(lastUpdated)}</span>
              </div>
            </div>

            {/* Genres */}
            {genres && genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {genres.slice(0, 5).map((genre, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-dark-100 text-dark-700 rounded-full text-xs font-medium"
                  >
                    {genre}
                  </span>
                ))}
                {genres.length > 5 && (
                  <span className="px-2 py-1 bg-dark-100 text-dark-700 rounded-full text-xs font-medium">
                    +{genres.length - 5} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
