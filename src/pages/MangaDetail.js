import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Star, 
  BookOpen, 
  Calendar, 
  Tag, 
  Play, 
  ChevronLeft,
  Heart,
  Share2,
  ArrowLeft,
  Lock,
  Coins
} from 'lucide-react';
import { getAllManga, getChaptersByMangaId, isMangaFavoritedByUser, addMangaToUserFavorites, removeMangaFromUserFavorites, getRelatedManga } from '../services/cloudinaryService';
import { onAuthStateChange } from '../services/authService';

const MangaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [related, setRelated] = useState([]);
  const [cameFromChapter, setCameFromChapter] = useState(false);

  useEffect(() => {
    // Check if we came from a chapter page
    const fromChapter = location.state?.fromChapter || false;
    setCameFromChapter(fromChapter);
    
    // Fetch manga data from Firebase
    const fetchMangaData = async () => {
      try {
        console.log('🔍 Fetching manga data for ID:', id);
        const allManga = await getAllManga();
        console.log('📚 All manga fetched:', allManga.length);
        const manga = allManga.find(m => m.id === id);
        
        if (manga) {
          console.log('✅ Manga found:', manga.title);
          setManga(manga);
          // Check favorite state for logged-in user
          try {
            if (authUser) {
              const fav = await isMangaFavoritedByUser(authUser.uid, manga.id);
              setIsFavorite(fav);
            } else {
              setIsFavorite(false);
            }
          } catch {}

          // Load related manga
          try {
            const rel = await getRelatedManga(manga.id, 8);
            setRelated(rel);
          } catch {}
          // Fetch chapters from Firebase
          try {
            console.log('🔍 Fetching chapters for manga:', manga.id);
            const fetchedChapters = await getChaptersByMangaId(id);
            console.log('📖 Chapters fetched:', fetchedChapters.length, fetchedChapters);
            setChapters(fetchedChapters);
          } catch (chapterError) {
            console.error('❌ Error fetching chapters:', chapterError);
            setChapters([]);
          }
        } else {
          console.log('❌ Manga not found with ID:', id);
        }
      } catch (error) {
        console.error('❌ Error fetching manga data:', error);
      }
    };

    const unsub = onAuthStateChange(async (u) => {
      setAuthUser(u);
      fetchMangaData();
    });
    return () => unsub && unsub();
  }, [id, location.state]);

  const handleBack = () => {
    if (cameFromChapter) {
      // If we came from a chapter page, go to home
      navigate('/');
    } else {
      // Otherwise go back to previous page
      navigate(-1);
    }
  };

  const handleToggleFavorite = async () => {
    if (!authUser) {
      // Redirect to auth if not logged in
      navigate('/auth');
      return;
    }
    try {
      if (!manga) return;
      if (isFavorite) {
        await removeMangaFromUserFavorites(authUser.uid, manga.id);
        setIsFavorite(false);
      } else {
        await addMangaToUserFavorites(authUser.uid, manga.id);
        setIsFavorite(true);
      }
    } catch (e) {
      // noop
    }
  };

  if (!manga) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Floating Back Button - Always Visible */}
      <div className="back-button-floating">
        <button
          onClick={handleBack}
          className="flex items-center justify-center w-12 h-12 bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full shadow-lg border border-gray-200 transition-all duration-200 hover:scale-110"
          title="Go Back"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Manga Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Cover Image */}
            <div className="lg:col-span-1 flex justify-center lg:justify-start">
              <div className="manga-cover w-full max-w-xs lg:max-w-sm">
                <img
                  src={manga.cover}
                  alt={manga.title}
                  className="w-full h-auto rounded-lg shadow-md"
                  loading="lazy"
                  onLoad={(e) => {
                    e.target.style.opacity = '1';
                  }}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x600/6B7280/FFFFFF?text=Cover+Image';
                    e.target.style.opacity = '1';
                  }}
                  style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
                />
              </div>
            </div>

            {/* Manga Info */}
            <div className="lg:col-span-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 space-y-3 sm:space-y-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">{manga.title}</h1>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleToggleFavorite}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      isFavorite 
                        ? 'text-red-500 bg-red-50' 
                        : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                    }`}
                    title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart className={`h-5 w-5 sm:h-6 sm:w-6 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  <button className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors duration-200">
                    <Share2 className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </div>
              </div>

              {/* Rating and Status */}
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-6 mb-4 sm:mb-6">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 fill-current" />
                  <span className="text-base sm:text-lg font-semibold text-dark-900 dark:text-dark-100">{manga.rating || 'N/A'}</span>
                  <span className="text-sm sm:text-base text-gray-600 dark:text-dark-300">({manga.totalLikes || 0} likes)</span>
                </div>
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium w-fit ${
                  manga.status === 'Ongoing' ? 'bg-green-100 text-green-800' :
                  manga.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {manga.status || 'Unknown'}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg sm:text-2xl font-bold text-primary-600">{manga.chapters || 0}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Chapters</div>
                </div>
                <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg sm:text-2xl font-bold text-primary-600">{manga.totalViews || 0}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Views</div>
                </div>
                <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg sm:text-2xl font-bold text-primary-600">{manga.year || 'N/A'}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Year</div>
                </div>
                <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg sm:text-2xl font-bold text-primary-600">{manga.publisher || 'N/A'}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Publisher</div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-gray-700 dark:text-dark-200 leading-relaxed mb-4 sm:mb-6">{manga.description || 'No description available.'}</p>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                {manga.genres && manga.genres.length > 0 ? (
                  manga.genres.map((genre, index) => (
                    <span
                      key={index}
                      className="px-2 sm:px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs sm:text-sm font-medium"
                    >
                      {genre}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">No genres available</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {chapters.length > 0 ? (
                  <Link
                    to={`/manga/${manga.id}/read/${chapters[0].id}`}
                    className="btn-primary inline-flex items-center justify-center space-x-2 px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base"
                  >
                    <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Start Reading</span>
                  </Link>
                ) : (
                  <button disabled className="btn-primary inline-flex items-center justify-center space-x-2 px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base opacity-50 cursor-not-allowed">
                    <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>No Chapters Available</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Chapters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-4 sm:p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Chapters</h2>
            </div>
            <div className="flex items-center space-x-4">
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option>Sort by: Latest</option>
                <option>Sort by: Oldest</option>
                <option>Sort by: Views</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {chapters.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No chapters available</h3>
                <p className="text-gray-600 text-sm sm:text-base">Chapters will appear here once they are uploaded.</p>
              </div>
            ) : (
              chapters.map((chapter, index) => (
                <motion.div
                  key={chapter.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 space-y-3 sm:space-y-0"
                >
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-600 font-bold text-sm sm:text-base">{chapter.chapterNumber}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 flex items-center gap-2">
                        Chapter {chapter.chapterNumber}: {chapter.title}
                        {chapter.isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs font-medium">
                            <Lock className="w-3.5 h-3.5" />
                            <Coins className="w-3 h-3" /> {typeof chapter.price !== 'undefined' ? chapter.price : ''}
                          </span>
                        ) : null}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>{chapter.uploadDate ? new Date(chapter.uploadDate).toLocaleDateString() : 'Unknown'}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>{chapter.pages || 0} pages</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>{chapter.views || 0} views</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/manga/${manga.id}/read/${chapter.id}`}
                      className="btn-primary px-4 py-2 text-sm sm:text-base w-full sm:w-auto text-center"
                    >
                      Read
                    </Link>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Recommended Section */}
        {related && related.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-4 sm:p-6 mt-6"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Recommended for you</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
              {related.map((rm) => (
                <Link key={rm.id} to={`/manga/${rm.id}`} className="group">
                  <div className="overflow-hidden rounded-lg bg-white shadow hover:shadow-md transition-all">
                    <img
                      src={rm.cover}
                      alt={rm.title}
                      className="w-full h-44 md:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/300x400/6B7280/FFFFFF?text=Manga+Cover'; }}
                    />
                  </div>
                  <h4 className="mt-2 text-xs md:text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600">
                    {rm.title}
                  </h4>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MangaDetail;
