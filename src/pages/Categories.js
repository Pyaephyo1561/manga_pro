import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Star, Eye, Calendar, Filter } from 'lucide-react';
import MangaTile from '../components/MangaTile';
import CategoryCard from '../components/CategoryCard';
import CategoryFilter from '../components/CategoryFilter';
import { getAllManga, getMangaByCategory } from '../services/cloudinaryService';

const Categories = () => {
  const [manga, setManga] = useState([]);
  const [filteredManga, setFilteredManga] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('latest');
  const [viewMode, setViewMode] = useState('grid');

  // Categories and their associated genres
  const categories = [
    {
      name: 'All',
      icon: '📚',
      description: 'All manga series'
    },
    {
      name: 'Action',
      icon: '⚔️',
      description: 'High-energy action and battles',
      genres: ['Action', 'Martial Arts', 'Superhero']
    },
    {
      name: 'Adventure',
      icon: '🗺️',
      description: 'Epic journeys and exploration',
      genres: ['Adventure', 'Fantasy', 'Supernatural']
    },
    {
      name: 'Romance',
      icon: '💕',
      description: 'Love stories and relationships',
      genres: ['Romance', 'Shoujo', 'Shounen Ai']
    },
    {
      name: 'Comedy',
      icon: '😂',
      description: 'Humor and lighthearted stories',
      genres: ['Comedy', 'Slice of Life', 'Gag']
    },
    {
      name: 'Drama',
      icon: '🎭',
      description: 'Emotional and serious stories',
      genres: ['Drama', 'Psychological', 'Thriller']
    },
    {
      name: 'Fantasy',
      icon: '🐉',
      description: 'Magical worlds and creatures',
      genres: ['Fantasy', 'Magic', 'Supernatural']
    },
    {
      name: 'Horror',
      icon: '👻',
      description: 'Scary and suspenseful stories',
      genres: ['Horror', 'Thriller', 'Supernatural']
    },
    {
      name: 'Sci-Fi',
      icon: '🚀',
      description: 'Science fiction and technology',
      genres: ['Sci-Fi', 'Mecha', 'Cyberpunk']
    },
    {
      name: 'Sports',
      icon: '⚽',
      description: 'Athletic competitions and training',
      genres: ['Sports', 'Martial Arts']
    },
    {
      name: 'Mystery',
      icon: '🔍',
      description: 'Detective and puzzle stories',
      genres: ['Mystery', 'Thriller', 'Psychological']
    },
    {
      name: 'Historical',
      icon: '🏛️',
      description: 'Period pieces and historical events',
      genres: ['Historical', 'War', 'Samurai']
    }
  ];

  const statusOptions = [
    { value: 'All', label: 'All Status' },
    { value: 'Ongoing', label: 'Ongoing' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Hiatus', label: 'Hiatus' },
    { value: 'Cancelled', label: 'Cancelled' }
  ];

  const sortOptions = [
    { value: 'latest', label: 'Latest', icon: Calendar },
    { value: 'rating', label: 'Top Rated', icon: Star },
    { value: 'popular', label: 'Most Popular', icon: Eye },
    { value: 'title', label: 'Title A-Z', icon: BookOpen }
  ];

  // Fetch manga data
  useEffect(() => {
    const fetchManga = async () => {
      try {
        setLoading(true);
        const mangaData = await getAllManga();
        setManga(mangaData);
        setFilteredManga(mangaData);
      } catch (error) {
        console.error('Error fetching manga:', error);
        setManga([]);
        setFilteredManga([]);
      } finally {
        setLoading(false);
      }
    };

    fetchManga();
  }, []);

  // Filter and sort manga
  useEffect(() => {
    let filtered = [...manga];

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

    // Filter by status
    if (selectedStatus !== 'All') {
      filtered = filtered.filter(manga => manga.status === selectedStatus);
    }

    // Sort manga
    switch (sortBy) {
      case 'latest':
        filtered.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    setFilteredManga(filtered);
  }, [manga, searchTerm, selectedCategory, selectedStatus, sortBy]);

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedStatus('All');
    setSortBy('latest');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-dark-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Header */}
      <section className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-dark-900 mb-2">Categories</h1>
            <p className="text-dark-600 text-lg">
              Discover manga by genre, status, and more
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search manga by title, author, or genre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-dark-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-4 py-3 border border-dark-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full px-4 py-3 border border-dark-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedCategory !== 'All' || selectedStatus !== 'All') && (
            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={clearFilters}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear all filters
              </button>
              <span className="text-sm text-dark-500">
                {filteredManga.length} manga found
              </span>
            </div>
          )}
        </div>

        {/* Categories Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-dark-900 mb-6">Browse by Category</h2>
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryClick}
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-dark-900">
              {selectedCategory === 'All' ? 'All Manga' : `${selectedCategory} Manga`}
            </h2>
            <p className="text-dark-600">
              {filteredManga.length} manga found
            </p>
          </div>
          
          <div className="flex items-center space-x-2 bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors duration-200 ${
                viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-dark-600 hover:bg-dark-100'
              }`}
            >
              <Filter className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors duration-200 ${
                viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-dark-600 hover:bg-dark-100'
              }`}
            >
              <BookOpen className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Manga Grid/List */}
        {filteredManga.length > 0 ? (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6'
              : 'space-y-4'
          }>
            {filteredManga.map((manga, index) => (
              <motion.div
                key={manga.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
              >
                {viewMode === 'grid' ? (
                  <MangaTile manga={manga} />
                ) : (
                  <CategoryCard manga={manga} />
                )}
              </motion.div>
            ))}
          </div>
        ) : manga.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-dark-900 mb-2">No manga uploaded yet</h3>
            <p className="text-dark-600 mb-6">
              No manga has been uploaded to your library yet
            </p>
            <div className="text-sm text-dark-500 mb-6">
              <p>💡 Upload manga through the admin panel first</p>
              <p>☁️ All manga data is stored securely in Cloudinary</p>
            </div>
            <div className="text-sm text-dark-400">
              <p>📚 Upload manga covers and details</p>
              <p>📖 Add chapters with page images</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-dark-900 mb-2">No manga found</h3>
            <p className="text-dark-600 mb-6">
              Try adjusting your search terms or filters
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
