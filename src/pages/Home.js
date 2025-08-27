import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TrendingUp, Clock, Star, ArrowRight, Loader, RefreshCw, Search, Filter, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import MangaTile from '../components/MangaTile';
import CategoryFilter from '../components/CategoryFilter';
import { getAllManga, searchManga, getMangaByCategory } from '../services/cloudinaryService';
import { getPopularManga } from '../services/popularMangaService';

const Home = () => {
  const [allManga, setAllManga] = useState([]);
  const resultsRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6); // Default for mobile

  // Responsive pagination - adjust items per page based on screen size
  useEffect(() => {
    const handleResize = () => {
      const newItemsPerPage = window.innerWidth < 768 ? 6 : 10;
      if (newItemsPerPage !== itemsPerPage) {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); // Reset to first page when changing items per page
      }
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [itemsPerPage]);

  // Categories and their associated genres
  const categories = [
    {
      name: 'All',
      genres: []
    },
    {
      name: 'Action',
      genres: ['Action', 'Martial Arts', 'Superhero']
    },
    {
      name: 'Adventure',
      genres: ['Adventure', 'Fantasy', 'Supernatural']
    },
    {
      name: 'Romance',
      genres: ['Romance', 'Shoujo', 'Shounen Ai']
    },
    {
      name: 'Comedy',
      genres: ['Comedy', 'Slice of Life', 'Gag']
    },
    {
      name: 'Drama',
      genres: ['Drama', 'Psychological', 'Thriller']
    },
    {
      name: 'Fantasy',
      genres: ['Fantasy', 'Magic', 'Supernatural']
    },
    {
      name: 'Horror',
      genres: ['Horror', 'Thriller', 'Supernatural']
    },
    {
      name: 'Sci-Fi',
      genres: ['Sci-Fi', 'Mecha', 'Cyberpunk']
    },
    {
      name: 'Sports',
      genres: ['Sports', 'Martial Arts']
    },
    {
      name: 'Mystery',
      genres: ['Mystery', 'Thriller', 'Psychological']
    },
    {
      name: 'Historical',
      genres: ['Historical', 'War', 'Samurai']
    }
  ];

  // Fetch manga data with simple retry to avoid first-load empty state on slow/cold Firestore
  const fetchMangaData = useCallback(async () => {
    setLoading(true);
    const maxAttempts = 3;
    let lastError = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const mangaData = await getAllManga();
        setAllManga(Array.isArray(mangaData) ? mangaData : []);
        lastError = null;
        break;
      } catch (error) {
        lastError = error;
        // Exponential backoff: 300ms, 600ms
        const delayMs = attempt * 300;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
    if (lastError) {
      console.error('Error fetching manga data after retries:', lastError);
      setAllManga([]);
    }
    setLoading(false);
  }, []);

  // Get popular manga from service or use first 10 as fallback
  const getPopularMangaData = useCallback(() => {
    const popularManga = getPopularManga();
    if (popularManga.length > 0) {
      return popularManga;
    }
    // Fallback to first 10 manga if no popular manga set
    return allManga.slice(0, 10);
  }, [allManga]);

  // Filter manga based on category and search - memoized to prevent unnecessary recalculations
  const filteredManga = useMemo(() => {
    let filtered = [...allManga];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(manga =>
        manga.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manga.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manga.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manga.genres?.some(genre => genre.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      const category = categories.find(cat => cat.name === selectedCategory);
      if (category && category.genres) {
        filtered = filtered.filter(manga =>
          manga.genres?.some(genre => category.genres.includes(genre))
        );
      }
    }

    return filtered;
  }, [allManga, searchTerm, selectedCategory, categories]);

  // Pagination logic
  const totalPages = Math.ceil(filteredManga.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentManga = filteredManga.slice(startIndex, endIndex);

  const handleCategoryClick = useCallback((categoryName) => {
    setSelectedCategory(categoryName);
    setCurrentPage(1); // Reset to first page when category changes
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('All');
    setCurrentPage(1); // Reset to first page when filters are cleared
  }, []);

  // Smoothly scroll results section into view
  const scrollResultsTop = useCallback(() => {
    if (resultsRef.current && typeof resultsRef.current.scrollIntoView === 'function') {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Pagination handlers
  const goToPage = useCallback((page) => {
    setCurrentPage(page);
    scrollResultsTop();
  }, [scrollResultsTop]);

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      scrollResultsTop();
    }
  }, [currentPage, totalPages, scrollResultsTop]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      scrollResultsTop();
    }
  }, [currentPage, scrollResultsTop]);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Refresh manga data
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMangaData();
    setRefreshing(false);
  }, [fetchMangaData]);

  useEffect(() => {
    fetchMangaData();
  }, [fetchMangaData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-dark-600">Loading manga...</p>
        </div>
      </div>
    );
  }

  // Show message if no manga exists
  if (allManga.length === 0) {
    return (
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-6">
                Welcome to Manga Reader
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 text-primary-100">
                No manga uploaded yet. Start by adding manga through the admin panel.
              </p>
              <div className="space-y-2 md:space-y-4">
                <p className="text-base md:text-lg text-primary-100">
                  📚 Upload manga covers and chapters via Cloudinary
                </p>
                <p className="text-base md:text-lg text-primary-100">
                  🎯 Manage your manga library from the admin dashboard
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Empty State */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="text-6xl md:text-8xl mb-4 md:mb-6">📚</div>
            <h2 className="text-2xl md:text-3xl font-bold text-dark-900 mb-3 md:mb-4">No Manga Available</h2>
            <p className="text-base md:text-lg text-dark-600 mb-6 md:mb-8">
              Your manga library is empty. To get started:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-2xl mx-auto">
              <div className="bg-dark-50 p-4 md:p-6 rounded-lg">
                <h3 className="font-semibold text-dark-900 mb-2">1. Access Admin Panel</h3>
                <p className="text-dark-600 text-sm md:text-base">Go to /admin to access the manga management system</p>
              </div>
              <div className="bg-dark-50 p-4 md:p-6 rounded-lg">
                <h3 className="font-semibold text-dark-900 mb-2">2. Upload Manga</h3>
                <p className="text-dark-600 text-sm md:text-base">Upload manga covers and chapter images via Cloudinary</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-900">
      {/* Popular Section with Horizontal Scrollable Manga */}
      <section className="py-8 md:py-12 bg-gray-50 dark:bg-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
                <TrendingUp className="h-6 w-6 md:h-7 md:w-7 text-primary-600 mr-3" />
                Popular Manga
              </h2>
              <div className="flex items-center space-x-3">
                {getPopularManga().length === 0 && (
                  <span className="text-sm text-gray-500 italic">
                    Using default selection
                  </span>
                )}
                <button className="text-primary-600 hover:text-primary-700 font-medium text-sm md:text-base">
                  See All
                </button>
              </div>
            </div>
          
          {/* Horizontal Scrollable Manga Container */}
          <div className="relative">
            <div className="flex space-x-3 md:space-x-4 overflow-x-auto scrollbar-hide pb-2">
              {getPopularMangaData().map((manga, index) => (
                <motion.div
                  key={manga.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex-shrink-0 w-36 md:w-40 lg:w-44"
                >
                  <Link to={`/manga/${manga.id}`} className="block group">
                    <div className="overflow-hidden rounded-lg bg-white shadow hover:shadow-lg transition-all">
                      <img
                        src={manga.cover}
                        alt={manga.title}
                        className="w-full h-44 md:h-48 lg:h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x400/6B7280/FFFFFF?text=Manga+Cover';
                        }}
                      />
                    </div>
                    <h4 className="mt-2 text-xs md:text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600">
                      {manga.title}
                    </h4>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Search and Categories */}
      <section className="py-12 md:py-16 bg-white dark:bg-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="mb-6 md:mb-8">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search manga by title, author, or genre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 md:py-3 border border-dark-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm md:text-base"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-dark-900 dark:text-white mb-4 md:mb-6 text-center">Browse by Category</h2>
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryClick}
            />
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedCategory !== 'All') && (
            <div className="text-center mb-6 md:mb-8">
              <button
                onClick={clearFilters}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm md:text-base"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Manga Results */}
      <section ref={resultsRef} className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-primary-600" />
              <h2 className="text-2xl md:text-3xl font-bold text-dark-900 dark:text-white">
                {selectedCategory === 'All' ? 'All Manga' : `${selectedCategory} Manga`}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50 text-sm md:text-base"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              <span className="text-sm text-dark-500">
                {filteredManga.length} manga found
              </span>
            </div>
          </div>
          
          {filteredManga.length > 0 ? (
            <>
              {/* Manga Grid - Fewer columns for larger cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
                {currentManga.map((manga, index) => (
                <motion.div
                  key={manga.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                >
                  <MangaTile manga={manga} />
                </motion.div>
              ))}
            </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 md:mt-12 flex items-center justify-center">
                  <nav className="flex items-center space-x-1 md:space-x-2" aria-label="Pagination">
                    {/* Previous Page Button */}
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className="flex items-center px-2 md:px-3 py-2 text-sm md:text-base font-medium text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
                      <span className="hidden sm:inline ml-1">Previous</span>
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                      {/* First page */}
                      {currentPage > 3 && (
                        <>
                          <button
                            onClick={() => goToPage(1)}
                            className="px-2 md:px-3 py-2 text-sm md:text-base font-medium text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                          >
                            1
                          </button>
                          {currentPage > 4 && (
                            <span className="px-2 py-2 text-gray-500">...</span>
                          )}
                        </>
                      )}

                      {/* Current page range */}
                      {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                        const page = Math.max(1, Math.min(totalPages - 2, currentPage - 1)) + i;
                        if (page > totalPages) return null;
                        
                        return (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`px-2 md:px-3 py-2 text-sm md:text-base font-medium border ${
                              page === currentPage
                                ? 'bg-primary-600 text-white border-primary-600'
                                : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}

                      {/* Last page */}
                      {currentPage < totalPages - 2 && (
                        <>
                          {currentPage < totalPages - 3 && (
                            <span className="px-2 py-2 text-gray-500">...</span>
                          )}
                          <button
                            onClick={() => goToPage(totalPages)}
                            className="px-2 md:px-3 py-2 text-sm md:text-base font-medium text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>

                    {/* Next Page Button */}
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="flex items-center px-2 md:px-3 py-2 text-sm md:text-base font-medium text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="hidden sm:inline mr-1">Next</span>
                      <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                    </button>
                  </nav>
                </div>
              )}

              {/* Page Info */}
              {totalPages > 1 && (
                <div className="mt-4 text-center text-sm text-gray-500">
                  Page {currentPage} of {totalPages} • Showing {startIndex + 1}-{Math.min(endIndex, filteredManga.length)} of {filteredManga.length} manga
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 md:py-16 bg-white rounded-xl shadow-lg">
              <div className="text-4xl md:text-6xl mb-4">📚</div>
              <h3 className="text-lg md:text-xl font-semibold text-dark-900 mb-2">No manga found</h3>
              <p className="text-dark-600 mb-6 text-sm md:text-base">
                Try adjusting your search terms or filters
              </p>
              <button
                onClick={clearFilters}
                className="px-4 md:px-6 py-2 md:py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 text-sm md:text-base"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
