import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const MangaCard = ({ manga }) => {
  const { id, title, cover, chapters, status } = manga;

  const chapterCount = Number(chapters) || 0;

  return (
    <div className="card group">
      <div className="flex gap-4 p-3 sm:p-4">
        <Link to={`/manga/${id}`} className="shrink-0">
          <div className="overflow-hidden rounded-lg w-28 h-36 sm:w-32 sm:h-44 bg-dark-100">
            <img
              src={cover}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              onLoad={(e) => {
                e.target.style.opacity = '1';
              }}
              style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
            />
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <Link to={`/manga/${id}`} className="min-w-0">
            <h3 className="font-semibold text-base sm:text-lg text-dark-900 line-clamp-2 group-hover:text-primary-600 transition-colors duration-200">
              {title}
            </h3>
          </Link>

          {/* Chapters hidden per request */}

          <div className="mt-3 flex items-center gap-3">
            <span className={`text-xs px-2 py-1 rounded-full ${
              status === 'Ongoing' ? 'bg-green-100 text-green-800' :
              status === 'Completed' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {status}
            </span>
            {chapterCount > 0 && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-dark-500">
                <BookOpen className="h-4 w-4" />
                <span>{chapterCount} chapters</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MangaCard;
