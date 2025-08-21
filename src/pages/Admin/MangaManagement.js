import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  MoreHorizontal,
  Plus,
  BookOpen,
  Star,
  Calendar,
  RefreshCw,
  Download,
  TrendingUp,
  Users,
  FileText,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllManga, deleteManga } from '../../services/cloudinaryService';
import { useNavigate } from 'react-router-dom';

const MangaManagement = () => {
  const navigate = useNavigate();
  const [manga, setManga] = useState([]);
  const [filteredManga, setFilteredManga] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [genreFilter, setGenreFilter] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedManga, setSelectedManga] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  // Get all unique genres from manga data
  const allGenres = useMemo(() => {
    const genres = new Set();
    manga.forEach(m => {
      if (m.genres && Array.isArray(m.genres)) {
        m.genres.forEach(genre => genres.add(genre));
      }
    });
    return Array.from(genres).sort();
  }, [manga]);

  useEffect(() => {
    fetchMangaData();
  }, []);

  const fetchMangaData = async () => {
    try {
      setIsLoading(true);
      const mangaData = await getAllManga();
      setManga(mangaData);
      setFilteredManga(mangaData);
    } catch (error) {
      console.error('Error fetching manga data:', error);
      toast.error('Failed to fetch manga data');
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...manga];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(m => 
        m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(m => m.status === statusFilter);
    }

    // Apply genre filter
    if (genreFilter !== 'all') {
      filtered = filtered.filter(m => 
        m.genres && Array.isArray(m.genres) && m.genres.includes(genreFilter)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle different data types
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      } else if (typeof aValue === 'number') {
        aValue = aValue || 0;
        bValue = bValue || 0;
      } else if (aValue instanceof Date) {
        aValue = aValue.getTime();
        bValue = bValue.getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredManga(filtered);
  }, [manga, searchQuery, statusFilter, genreFilter, sortBy, sortOrder]);

  const toggleMangaSelection = (mangaId) => {
    setSelectedManga(prev => 
      prev.includes(mangaId) 
        ? prev.filter(id => id !== mangaId)
        : [...prev, mangaId]
    );
  };

  const handleDelete = async (mangaId) => {
    if (!window.confirm('Are you sure you want to delete this manga? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteManga(mangaId);
      toast.success('Manga deleted successfully');
      fetchMangaData();
      setSelectedManga(prev => prev.filter(id => id !== mangaId));
    } catch (error) {
      console.error('Error deleting manga:', error);
      toast.error('Failed to delete manga');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedManga.length === 0) {
      toast.error('Please select manga to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedManga.length} manga? This action cannot be undone.`)) {
      return;
    }

    try {
      const deletePromises = selectedManga.map(id => deleteManga(id));
      await Promise.all(deletePromises);
      toast.success(`${selectedManga.length} manga deleted successfully`);
      fetchMangaData();
      setSelectedManga([]);
    } catch (error) {
      console.error('Error bulk deleting manga:', error);
      toast.error('Failed to delete some manga');
    }
  };

  const formatViews = (views) => {
    if (!views) return '0';
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'hiatus':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading manga...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manga Management</h1>
              <p className="text-gray-600">Manage your manga library</p>
            </div>
            
            <div className="flex items-center sm:justify-end">
              <button
                onClick={() => navigate('/admin/upload')}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Upload Manga
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Manga</p>
                <p className="text-2xl font-bold text-gray-900">{manga.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Chapters</p>
                <p className="text-2xl font-bold text-gray-900">
                  {manga.reduce((sum, m) => sum + (m.totalChapters || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">
                  {manga.reduce((sum, m) => sum + (m.views || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {manga.length > 0 
                    ? (manga.reduce((sum, m) => sum + (m.rating || 0), 0) / manga.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search manga..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto"
              >
                <option value="all">All Status</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="hiatus">Hiatus</option>
                <option value="cancelled">Cancelled</option>
              </select>
              
              <select
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto"
              >
                <option value="all">All Genres</option>
                {allGenres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto"
              >
                <option value="title">Title</option>
                <option value="author">Author</option>
                <option value="rating">Rating</option>
                <option value="views">Views</option>
                <option value="totalChapters">Chapters</option>
                <option value="updatedAt">Last Updated</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedManga.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedManga.length} manga selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Mode Toggle */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 rounded-lg ${
                viewMode === 'table' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-lg ${
                viewMode === 'grid' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Grid View
            </button>
          </div>
          
          <button
            onClick={fetchMangaData}
            className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>

        {/* Manga Display */}
        {viewMode === 'table' ? (
          <MangaTable 
            manga={filteredManga}
            selectedManga={selectedManga}
            onToggleSelection={toggleMangaSelection}
            onDelete={handleDelete}
            formatViews={formatViews}
            formatDate={formatDate}
            getStatusColor={getStatusColor}
            navigate={navigate}
          />
        ) : (
          <MangaGrid 
            manga={filteredManga}
            selectedManga={selectedManga}
            onToggleSelection={toggleMangaSelection}
            onDelete={handleDelete}
            formatViews={formatViews}
            formatDate={formatDate}
            getStatusColor={getStatusColor}
            navigate={navigate}
          />
        )}

        {/* Empty State */}
        {filteredManga.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 bg-white rounded-xl shadow-lg"
          >
            <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {manga.length === 0 ? 'No manga uploaded yet' : 'No manga found'}
            </h3>
            <p className="text-gray-500 mb-4">
              {manga.length === 0 
                ? 'Start building your manga library by uploading manga through the upload section'
                : 'Try adjusting your search or filters'
              }
            </p>
            {manga.length === 0 && (
              <div className="text-sm text-gray-400 mb-6">
                <p>📚 Upload manga covers and details</p>
                <p>📖 Add chapters with page images</p>
                <p>☁️ All data is stored securely in Firebase & Cloudinary</p>
              </div>
            )}
            {manga.length === 0 && (
              <button
                onClick={() => navigate('/admin/upload')}
                className="flex items-center space-x-2 mx-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="h-5 w-5" />
                <span>Upload Your First Manga</span>
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Manga Table Component
const MangaTable = ({ manga, selectedManga, onToggleSelection, onDelete, formatViews, formatDate, getStatusColor, navigate }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 }}
    className="bg-white rounded-xl shadow-lg overflow-hidden"
  >
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <input
                type="checkbox"
                checked={selectedManga.length === manga.length && manga.length > 0}
                onChange={() => {
                  if (selectedManga.length === manga.length) {
                    selectedManga.forEach(id => onToggleSelection(id));
                  } else {
                    manga.forEach(m => onToggleSelection(m.id));
                  }
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Manga
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Author
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rating
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Views
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Chapters
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Updated
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {manga.map((mangaItem) => (
            <tr key={mangaItem.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedManga.includes(mangaItem.id)}
                  onChange={() => onToggleSelection(mangaItem.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <img
                    src={mangaItem.cover}
                    alt={mangaItem.title}
                    className="w-12 h-16 object-cover rounded-lg"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div className="w-12 h-16 bg-gray-200 rounded-lg items-center justify-center text-gray-400 text-xs hidden">
                    No Image
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{mangaItem.title}</div>
                    <div className="text-xs text-gray-500">
                      {mangaItem.genres && mangaItem.genres.slice(0, 2).join(', ')}
                      {mangaItem.genres && mangaItem.genres.length > 2 && '...'}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {mangaItem.author}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(mangaItem.status)}`}>
                  {mangaItem.status || 'Unknown'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="ml-1 text-sm text-gray-900">
                    {mangaItem.rating ? mangaItem.rating.toFixed(1) : '0.0'}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatViews(mangaItem.views)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {mangaItem.totalChapters || 0}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(mangaItem.updatedAt || mangaItem.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <button 
                    onClick={() => window.open(`/manga/${mangaItem.id}`, '_blank')}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    title="View Manga"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => {
                      // Navigate to chapter management
                      navigate(`/admin/manga/${mangaItem.id}/chapters`);
                    }}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                    title="Manage Chapters"
                  >
                    <BookOpen className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => {
                      // Edit manga
                      toast.success('Edit manga feature coming soon!');
                    }}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                    title="Edit Manga"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => onDelete(mangaItem.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    title="Delete Manga"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </motion.div>
);

// Manga Grid Component
const MangaGrid = ({ manga, selectedManga, onToggleSelection, onDelete, formatViews, formatDate, getStatusColor, navigate }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 }}
    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
  >
    {manga.map((mangaItem) => (
      <motion.div
        key={mangaItem.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200"
      >
        <div className="relative">
          <img
            src={mangaItem.cover}
            alt={mangaItem.title}
            className="w-full h-48 object-cover"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="absolute inset-0 bg-gray-200 items-center justify-center text-gray-400 hidden">
            <BookOpen className="h-12 w-12" />
          </div>
          
          {/* Selection Checkbox */}
          <div className="absolute top-2 left-2">
            <input
              type="checkbox"
              checked={selectedManga.includes(mangaItem.id)}
              onChange={() => onToggleSelection(mangaItem.id)}
              className="rounded border-white text-blue-600 focus:ring-blue-500 bg-white/80"
            />
          </div>

          {/* Status Badge */}
          <div className="absolute top-2 right-2">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(mangaItem.status)}`}>
              {mangaItem.status || 'Unknown'}
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{mangaItem.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{mangaItem.author}</p>
          
          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
              {mangaItem.rating ? mangaItem.rating.toFixed(1) : '0.0'}
            </div>
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              {formatViews(mangaItem.views)}
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <span>{mangaItem.totalChapters || 0} chapters</span>
            <span>{formatDate(mangaItem.updatedAt || mangaItem.createdAt)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(`/admin/manga/${mangaItem.id}/chapters`)}
              className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <BookOpen className="h-4 w-4 mr-1" />
              Manage Chapters
            </button>
            
            <div className="flex space-x-1">
              <button
                onClick={() => window.open(`/manga/${mangaItem.id}`, '_blank')}
                className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                title="View Manga"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(mangaItem.id)}
                className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                title="Delete Manga"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    ))}
  </motion.div>
);

export default MangaManagement;
