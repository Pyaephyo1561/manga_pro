import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon, Filter, X, BookOpen, Star, Eye, Calendar } from 'lucide-react';
import MangaTile from '../components/MangaTile';
import { getAllManga, searchManga } from '../services/cloudinaryService';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    genre: 'all',
    year: 'all',
    rating: 'all'
  });

  const [allManga, setAllManga] = useState([]);

  // Fetch all manga data from Firebase
  useEffect(() => {
    const fetchMangaData = async () => {
      try {
        const mangaData = await getAllManga();
        setAllManga(mangaData);
      } catch (error) {
        console.error('Error fetching manga data:', error);
      }
    };

    fetchMangaData();
  }, []);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    
    try {
      // Search through Firebase manga data
      const searchResults = await searchManga(query);
      setSearchResults(searchResults);
    } catch (error) {
      console.error('Error searching manga:', error);
      // Fallback to local search
      const filteredResults = allManga.filter(manga =>
        manga.title.toLowerCase().includes(query.toLowerCase()) ||
        manga.description.toLowerCase().includes(query.toLowerCase()) ||
        manga.genres.some(genre => genre.toLowerCase().includes(query.toLowerCase()))
      );
      setSearchResults(filteredResults);
    }
    
    setIsLoading(false);
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
      year: 'all',
      rating: 'all'
    });
  };

  const applyFilters = () => {
    // Apply filters to search results
    let filtered = allManga;
    
    if (filters.status !== 'all') {
      filtered = filtered.filter(manga => manga.status === filters.status);
    }
    
    if (filters.genre !== 'all') {
      filtered = filtered.filter(manga => 
        manga.genres.some(genre => genre === filters.genre)
      );
    }
    
    if (filters.rating !== 'all') {
      const minRating = parseFloat(filters.rating);
      filtered = filtered.filter(manga => manga.rating >= minRating);
    }
    
    setSearchResults(filtered);
    setShowFilters(false);
  };

  useEffect(() => {
    if (searchQuery) {
      handleSearch(searchQuery);
    }
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-dark-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-dark-900 mb-4">Search Manga</h1>
          <p className="text-lg text-dark-600">Find your favorite manga series</p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-400" />
            <input
              type="text"
              placeholder="Search by title, description, or genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input pl-12 pr-4 py-3 text-lg"
            />
          </div>
        </motion.div>

        {/* Filters and Results Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                showFilters 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white text-dark-700 hover:bg-primary-50'
              }`}
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </button>
            
            {Object.values(filters).some(filter => filter !== 'all') && (
              <button
                onClick={clearFilters}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-dark-600 hover:text-primary-600"
              >
                <X className="h-4 w-4" />
                <span>Clear Filters</span>
              </button>
            )}
          </div>
          
          <div className="text-sm text-dark-600">
            {searchResults.length > 0 && `${searchResults.length} results found`}
          </div>
        </motion.div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

              {/* Year Filter */}
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Year
                </label>
                <select
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  className="search-input"
                >
                  <option value="all">All Years</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                  <option value="2020">2020</option>
                  <option value="2019">2019</option>
                  <option value="2018">2018</option>
                  <option value="2017">2017</option>
                  <option value="2016">2016</option>
                  <option value="2015">2015</option>
                </select>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
                  className="search-input"
                >
                  <option value="all">All Ratings</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.0">4.0+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                  <option value="3.0">3.0+ Stars</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={applyFilters}
                className="btn-primary"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}

        {/* Search Results */}
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-16"
          >
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
          </motion.div>
        ) : searchQuery && searchResults.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-dark-900 mb-2">No results found</h3>
            <p className="text-dark-600">Try adjusting your search terms or filters</p>
          </motion.div>
        ) : searchResults.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {searchResults.map((manga, index) => (
              <motion.div
                key={manga.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <MangaTile manga={manga} />
              </motion.div>
            ))}
          </motion.div>
        ) : allManga.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-semibold text-dark-900 mb-2">No manga available</h3>
            <p className="text-dark-600 mb-4">No manga has been uploaded yet</p>
            <div className="text-sm text-dark-500">
              <p>💡 Upload manga through the admin panel first</p>
              <p>☁️ All manga data is stored securely in Cloudinary</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-semibold text-dark-900 mb-2">Start searching</h3>
            <p className="text-dark-600">Enter a title, description, or genre to find manga</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Search;
