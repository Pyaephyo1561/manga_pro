import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Star, BookOpen, ArrowUp, ArrowDown, Trash2, Plus, Save, RefreshCw, Eye } from 'lucide-react';
import { getAllManga } from '../../services/cloudinaryService';
import { 
  getPopularManga, 
  savePopularManga, 
  getDefaultPopularManga, 
  addToPopular, 
  removeFromPopular, 
  movePopularManga 
} from '../../services/popularMangaService';

const PopularMangaManagement = () => {
  const [allManga, setAllManga] = useState([]);
  const [popularManga, setPopularManga] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMangaData();
  }, []);

  // Clean up any duplicate data on component mount
  useEffect(() => {
    if (popularManga.length > 0) {
      const uniqueManga = popularManga.filter((manga, index, self) => 
        index === self.findIndex(m => m.id === manga.id)
      );
      
      if (uniqueManga.length !== popularManga.length) {
        // Update order numbers and set clean data
        const cleanManga = uniqueManga.map((manga, index) => ({
          ...manga,
          popularOrder: index + 1
        }));
        setPopularManga(cleanManga);
      }
    }
  }, [popularManga.length]);

  const fetchMangaData = async () => {
    try {
      setLoading(true);
      const mangaData = await getAllManga();
      setAllManga(mangaData);
      
      // Load existing popular manga from localStorage
      const savedPopular = getPopularManga();
      if (savedPopular.length > 0) {
        // Ensure no duplicates and update state
        setPopularManga(savedPopular);
      } else {
        // Set first 10 manga as default popular
        setPopularManga(getDefaultPopularManga(mangaData));
      }
    } catch (error) {
      console.error('Error fetching manga data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPopular = (manga) => {
    const updatedPopular = addToPopular(manga, popularManga);
    setPopularManga(updatedPopular);
    setSearchTerm('');
  };

  const handleRemoveFromPopular = (mangaId) => {
    const updatedPopular = removeFromPopular(mangaId, popularManga);
    setPopularManga(updatedPopular);
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const updatedPopular = movePopularManga(index, index - 1, popularManga);
    setPopularManga(updatedPopular);
  };

  const moveDown = (index) => {
    if (index === popularManga.length - 1) return;
    const updatedPopular = movePopularManga(index, index + 1, popularManga);
    setPopularManga(updatedPopular);
  };

  const handleSavePopularManga = async () => {
    try {
      setSaving(true);
      
      // Clean up any duplicate entries before saving
      const cleanPopularManga = popularManga.filter((manga, index, self) => 
        index === self.findIndex(m => m.id === manga.id)
      );
      
      // Update order numbers for clean data
      const finalPopularManga = cleanPopularManga.map((manga, index) => ({
        ...manga,
        popularOrder: index + 1
      }));
      
      const success = savePopularManga(finalPopularManga);
      if (success) {
        setPopularManga(finalPopularManga);
        alert('Popular manga section updated successfully!');
      } else {
        alert('Error saving popular manga. Please try again.');
      }
    } catch (error) {
      console.error('Error saving popular manga:', error);
      alert('Error saving popular manga. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = () => {
    if (window.confirm('Are you sure you want to reset to default popular manga?')) {
      const defaultPopular = getDefaultPopularManga(allManga);
      setPopularManga(defaultPopular);
    }
  };

  const filteredManga = allManga.filter(manga => 
    !popularManga.some(pm => pm.id === manga.id) &&
    manga.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading manga data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-primary-600" />
              <h1 className="text-3xl font-bold text-gray-900">Popular Manga Management</h1>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={resetToDefault}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reset to Default</span>
              </button>
                             <button
                 onClick={handleSavePopularManga}
                 disabled={saving}
                 className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
               >
                 <Save className="h-4 w-4" />
                 <span>{saving ? 'Saving...' : 'Save Changes'}</span>
               </button>
            </div>
          </div>
          <p className="text-gray-600 mt-2">
            Manage which manga appear in the popular section on the home page. Control the display order manually.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Popular Manga */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Star className="h-5 w-5 text-yellow-500 mr-2" />
              Current Popular Manga ({popularManga.length})
            </h2>
            
            {popularManga.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No manga in popular section</p>
              </div>
            ) : (
              <div className="space-y-3">
                                 {popularManga.map((manga, index) => (
                   <motion.div
                     key={`popular-${manga.id}-${index}`}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.3, delay: index * 0.1 }}
                     className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                   >
                    <div className="flex items-center space-x-2">
                      <span className="bg-primary-600 text-white text-sm font-bold px-2 py-1 rounded-full min-w-[2rem] text-center">
                        {manga.popularOrder}
                      </span>
                      <img
                        src={manga.cover}
                        alt={manga.title}
                        className="w-12 h-16 object-cover rounded-md"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/48x64/6B7280/FFFFFF?text=Cover';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">
                          {manga.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-xs text-gray-600">
                          <span className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-500 fill-current mr-1" />
                            {manga.rating || 'N/A'}
                          </span>
                          <span className="flex items-center">
                            <BookOpen className="h-3 w-3 text-gray-400 mr-1" />
                            {manga.chapters || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className="p-1 text-gray-600 hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
                        title="Move Up"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === popularManga.length - 1}
                        className="p-1 text-gray-600 hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
                        title="Move Down"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveFromPopular(manga.id)}
                        className="p-1 text-red-600 hover:text-red-700 transition-colors duration-200"
                        title="Remove from Popular"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Manga to Popular */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Plus className="h-5 w-5 text-green-600 mr-2" />
              Add Manga to Popular
            </h2>
            
            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search manga by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Available Manga */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredManga.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No manga found matching your search' : 'All manga are already in popular section'}
                </div>
              ) : (
                                 filteredManga.map((manga, index) => (
                   <motion.div
                     key={`available-${manga.id}-${index}`}
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200"
                   >
                    <img
                      src={manga.cover}
                      alt={manga.title}
                      className="w-12 h-16 object-cover rounded-md"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/48x64/6B7280/FFFFFF?text=Cover';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {manga.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-xs text-gray-600">
                        <span className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-500 fill-current mr-1" />
                          {manga.rating || 'N/A'}
                        </span>
                        <span className="flex items-center">
                          <BookOpen className="h-3 w-3 text-gray-400 mr-1" />
                          {manga.chapters || 0}
                        </span>
                      </div>
                    </div>
                    <button
                                              onClick={() => handleAddToPopular(manga)}
                      className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-1"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add</span>
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Eye className="h-5 w-5 text-blue-600 mr-2" />
            Preview: How Popular Section Will Look
          </h2>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex space-x-3 overflow-x-auto pb-2">
                             {popularManga.slice(0, 5).map((manga, index) => (
                 <div key={`preview-${manga.id}-${index}`} className="flex-shrink-0 w-32">
                  <div className="bg-white rounded-lg shadow-md">
                    <div className="relative">
                      <img
                        src={manga.cover}
                        alt={manga.title}
                        className="w-full h-40 object-cover rounded-t-lg"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/128x160/6B7280/FFFFFF?text=Cover';
                        }}
                      />
                      <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        #{index + 1}
                      </div>
                    </div>
                    <div className="p-2">
                      <h3 className="font-semibold text-gray-900 text-xs mb-1 line-clamp-2">
                        {manga.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-500 fill-current mr-1" />
                          {manga.rating || 'N/A'}
                        </span>
                        <span className="flex items-center">
                          <BookOpen className="h-3 w-3 text-gray-400 mr-1" />
                          {manga.chapters || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {popularManga.length > 5 && (
              <p className="text-center text-sm text-gray-500 mt-2">
                +{popularManga.length - 5} more manga will be visible by scrolling
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopularMangaManagement;
