import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, Filter, Grid, List, Heart, Eye, Star } from 'lucide-react';
import MangaCard from '../components/MangaCard';
import { 
  getUserFavoritesFromFirestore, 
  getUserReadingHistoryFromFirestore,
  deleteUserHistoryEntryFromFirestore,
  clearUserReadingHistoryFromFirestore
} from '../services/cloudinaryService';
import { onAuthStateChange } from '../services/authService';

const Library = () => {
  const [activeTab, setActiveTab] = useState('favorites');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    genre: 'all',
    sortBy: 'recent'
  });

  const [favorites, setFavorites] = useState([]);
  const [readingHistory, setReadingHistory] = useState([]);
  const [authUser, setAuthUser] = useState(null);
  const [filteredManga, setFilteredManga] = useState([]);

  // Fetch real user data
  useEffect(() => {
    const unsub = onAuthStateChange(async (u) => {
      setAuthUser(u);
      if (u) {
        const [favs, history] = await Promise.all([
          getUserFavoritesFromFirestore(u.uid),
          getUserReadingHistoryFromFirestore(u.uid)
        ]);
        setFavorites(favs);
        setReadingHistory(history);
      } else {
        setFavorites([]);
        setReadingHistory([]);
      }
    });
    return () => unsub && unsub();
  }, []);

  useEffect(() => {
    let currentManga = activeTab === 'favorites' ? favorites : readingHistory;
    
    // Apply search filter
    if (searchQuery) {
      currentManga = currentManga.filter(manga =>
        manga.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        manga.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply other filters
    if (filters.status !== 'all') {
      currentManga = currentManga.filter(manga => manga.status === filters.status);
    }

    if (filters.genre !== 'all') {
      currentManga = currentManga.filter(manga => 
        manga.genres.some(genre => genre === filters.genre)
      );
    }

    // Apply sorting
    if (filters.sortBy === 'recent') {
      currentManga.sort((a, b) => {
        const dateA = activeTab === 'favorites' ? a.addedDate : a.lastRead;
        const dateB = activeTab === 'favorites' ? b.addedDate : b.lastRead;
        return new Date(dateB) - new Date(dateA);
      });
    } else if (filters.sortBy === 'rating') {
      currentManga.sort((a, b) => b.rating - a.rating);
    } else if (filters.sortBy === 'title') {
      currentManga.sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredManga(currentManga);
  }, [activeTab, favorites, readingHistory, searchQuery, filters]);

  const removeFromFavorites = (mangaId) => {
    setFavorites(prev => prev.filter(manga => manga.id !== mangaId));
  };

  const removeFromHistory = async (mangaId) => {
    if (!authUser) return;
    await deleteUserHistoryEntryFromFirestore(authUser.uid, mangaId);
    setReadingHistory(prev => prev.filter(manga => manga.id !== mangaId));
  };

  const clearHistory = async () => {
    if (!authUser) return;
    await clearUserReadingHistoryFromFirestore(authUser.uid);
    setReadingHistory([]);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      genre: 'all',
      sortBy: 'recent'
    });
  };

  return (
    <div className="min-h-screen bg-dark-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-dark-900 mb-4">My Library</h1>
          <p className="text-lg text-dark-600">Manage your favorite manga and reading history</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-white rounded-lg p-1 shadow-lg">
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'favorites'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-dark-600 hover:text-primary-600'
              }`}
            >
              <Heart className="inline-block h-5 w-5 mr-2" />
              Favorites ({favorites.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'history'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-dark-600 hover:text-primary-600'
              }`}
            >
              <Eye className="inline-block h-5 w-5 mr-2" />
              Reading History ({readingHistory.length})
            </button>
          </div>
        </motion.div>

        {/* Search and Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-400" />
                <input
                  type="text"
                  placeholder="Search in library..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input pl-10"
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4">
              {/* View Mode */}
              <div className="flex bg-dark-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-dark-600'
                  }`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'text-dark-600'
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>

              {/* Filters */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                  showFilters 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-dark-100 text-dark-700 hover:bg-dark-200'
                }`}
              >
                <Filter className="h-5 w-5" />
                <span>Filters</span>
              </button>

              {/* Clear Actions */}
              {activeTab === 'history' && readingHistory.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200"
                >
                  <Eye className="h-5 w-5" />
                  <span>Clear History</span>
                </button>
              )}
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 pt-6 border-t border-dark-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="search-input"
                  >
                    <option value="all">All Status</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Hiatus">Hiatus</option>
                  </select>
                </div>

                {/* Genre Filter */}
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Genre
                  </label>
                  <select
                    value={filters.genre}
                    onChange={(e) => handleFilterChange('genre', e.target.value)}
                    className="search-input"
                  >
                    <option value="all">All Genres</option>
                    <option value="Action">Action</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Comedy">Comedy</option>
                    <option value="Drama">Drama</option>
                    <option value="Fantasy">Fantasy</option>
                    <option value="Horror">Horror</option>
                    <option value="Romance">Romance</option>
                    <option value="Sci-Fi">Sci-Fi</option>
                    <option value="Slice of Life">Slice of Life</option>
                    <option value="Supernatural">Supernatural</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="search-input"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="rating">Highest Rating</option>
                    <option value="title">Title A-Z</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={clearFilters}
                  className="btn-secondary"
                >
                  Clear Filters
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Content */}
        {filteredManga.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">
              {activeTab === 'favorites' ? '💔' : '📚'}
            </div>
            <h3 className="text-2xl font-semibold text-dark-900 mb-2">
              {activeTab === 'favorites' ? 'No favorites yet' : 'No reading history'}
            </h3>
             <p className="text-dark-600 mb-4">
              {activeTab === 'favorites' 
                ? 'Start adding manga to your favorites to see them here'
                : 'Start reading manga to build your reading history'
              }
            </p>
             <div className="text-sm text-dark-500">
               <p>💡 No manga available yet? Upload manga through the admin panel first</p>
               <p>☁️ All manga data is stored securely in Cloudinary</p>
             </div>
          </motion.div>
        ) : (
                     <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className={viewMode === 'grid' 
               ? 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6'
               : 'space-y-4'
             }
           >
            {filteredManga.map((manga, index) => (
              <motion.div
                key={manga.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {viewMode === 'grid' ? (
                  <div className="relative group">
                    <MangaCard manga={manga} />
                    <button
                      onClick={() => activeTab === 'favorites' 
                        ? removeFromFavorites(manga.id) 
                        : removeFromHistory(manga.id)
                      }
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-lg p-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={manga.cover}
                        alt={manga.title}
                        className="w-16 h-24 object-cover rounded-lg"
                         loading="lazy"
                         onLoad={(e) => {
                           e.target.style.opacity = '1';
                         }}
                         onError={(e) => {
                           e.target.src = 'https://via.placeholder.com/64x96/6B7280/FFFFFF?text=Cover';
                           e.target.style.opacity = '1';
                         }}
                         style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-dark-900">{manga.title}</h3>
                        <p className="text-sm text-dark-600 line-clamp-2">{manga.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-dark-500">
                          <span className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span>{manga.rating}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{manga.chapters} chapters</span>
                          </span>
                          {activeTab === 'history' && (
                            <span>Chapter {manga.currentChapter}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => activeTab === 'favorites' 
                          ? removeFromFavorites(manga.id) 
                          : removeFromHistory(manga.id)
                        }
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Library;
