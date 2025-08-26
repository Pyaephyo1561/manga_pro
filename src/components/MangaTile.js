import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getChaptersByMangaId } from '../services/cloudinaryService';
import { Lock, Coins } from 'lucide-react';

// Simple in-memory cache to avoid refetching chapters when tiles remount
const chaptersCache = new Map();

const MangaTile = ({ manga }) => {
  const { id, title, cover } = manga;
  const [latestChapters, setLatestChapters] = useState([]);
  const [chaptersLoading, setChaptersLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadLatestChapters = async () => {
      // Serve from cache first to prevent white flash
      if (chaptersCache.has(id)) {
        const cached = chaptersCache.get(id);
        if (isMounted) {
          setLatestChapters(cached);
          setChaptersLoading(false);
        }
        return;
      }

      try {
        setChaptersLoading(true);
        const chapters = await getChaptersByMangaId(id);
        const sorted = (Array.isArray(chapters) ? chapters : []).slice().sort((a, b) => {
          const numA = parseFloat(b.chapterNumber || 0);
          const numB = parseFloat(a.chapterNumber || 0);
          return numA - numB; // desc by chapter number
        });
        const topTwo = sorted.slice(0, 2);
        chaptersCache.set(id, topTwo);
        if (isMounted) setLatestChapters(topTwo);
      } catch (e) {
        if (isMounted) setLatestChapters([]);
      } finally {
        if (isMounted) setChaptersLoading(false);
      }
    };
    loadLatestChapters();
    return () => { isMounted = false; };
  }, [id]);

  return (
    <div className="block group">
      <Link to={`/manga/${id}`} className="block">
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
      </Link>
      <Link to={`/manga/${id}`} className="block">
        <h3 className="mt-2 text-sm sm:text-base font-semibold text-dark-900 line-clamp-2 group-hover:text-primary-600 transition-colors duration-200">
          {title}
        </h3>
      </Link>

      {/* Latest chapters under the cover - fixed min height for equal spacing */}
      <div className="mt-2 space-y-1.5 min-h-[3.75rem] sm:min-h-[4rem]">
        {chaptersLoading && (
          <>
            <div className="h-8 bg-gray-700/40 rounded-md w-full"></div>
            <div className="h-8 bg-gray-700/40 rounded-md w-11/12"></div>
          </>
        )}
        {!chaptersLoading && latestChapters.length === 0 && (
          <div className="text-xs sm:text-sm text-gray-300">No chapters yet</div>
        )}
        {!chaptersLoading && latestChapters.map((ch) => (
          <Link
            key={ch.id}
            to={`/manga/${id}/read/${ch.id}`}
            className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors shadow-sm"
          >
            <span className="text-[11px] sm:text-sm text-white font-medium truncate flex items-center gap-1">
              {ch.isPaid ? <Lock className="w-3.5 h-3.5" /> : null}
              Ch. {ch.chapterNumber}{ch.title ? `: ${ch.title}` : ''}
              {ch.isPaid && typeof ch.price !== 'undefined' ? (
                <span className="ml-1 flex items-center gap-0.5 text-[10px] text-yellow-300">
                  <Coins className="w-3 h-3" /> {ch.price}
                </span>
              ) : null}
            </span>
            <span className="text-[10px] sm:text-xs text-gray-300 ml-2 whitespace-nowrap">
              {ch.uploadDate ? new Date(ch.uploadDate).toLocaleDateString() : ''}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MangaTile;


