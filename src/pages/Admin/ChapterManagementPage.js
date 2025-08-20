import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Plus,
  BookOpen,
  FileText,
  Calendar,
  BarChart3,
  SortAsc,
  SortDesc
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllManga, getMangaChapters, deleteChapter } from '../../services/cloudinaryService';
import ChapterManagement from './ChapterManagement';

const ChapterManagementPage = () => {
  const [manga, setManga] = useState([]);
  const [selectedManga, setSelectedManga] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [showChapterForm, setShowChapterForm] = useState(false);

  useEffect(() => {
    loadManga();
  }, []);

  const loadManga = async () => {
    try {
      setIsLoading(true);
      const allManga = await getAllManga();
      setManga(allManga);
    } catch (error) {
      console.error('Error loading manga:', error);
      toast.error('Failed to load manga');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChapterAdded = (chapterData) => {
    toast.success(`Chapter ${chapterData.chapterNumber} added successfully!`);
    loadManga(); // Reload to get updated data
  };

  const handleChapterDeleted = async (mangaId, chapterId) => {
    try {
      await deleteChapter(mangaId, chapterId);
      toast.success('Chapter deleted successfully');
      loadManga(); // Reload to get updated data
    } catch (error) {
      toast.error('Failed to delete chapter');
    }
  };

  const filteredManga = manga.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         m.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedManga = [...filteredManga].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'chapters':
        comparison = (a.totalChapters || 0) - (b.totalChapters || 0);
        break;
      case 'recent':
        comparison = new Date(b.lastUpdated) - new Date(a.lastUpdated);
        break;
      case 'views':
        comparison = (b.views || 0) - (a.views || 0);
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getTotalChapters = () => {
    return manga.reduce((total, m) => total + (m.totalChapters || 0), 0);
  };

  const getTotalViews = () => {
    return manga.reduce((total, m) => total + (m.views || 0), 0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (selectedManga) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedManga(null)}
            className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors duration-200"
          >
            <BookOpen className="h-5 w-5" />
            <span>← Back to Manga List</span>
          </button>
        </div>
        
        <ChapterManagement 
          mangaId={selectedManga.id}
          mangaTitle={selectedManga.title}
          onChapterAdded={handleChapterAdded}
          onChapterDeleted={handleChapterDeleted}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-900">Chapter Management</h1>
          <p className="text-dark-600 mt-2">Manage chapters across all manga series</p>
        </div>
        <button
          onClick={() => setShowChapterForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
        >
          <Plus className="h-5 w-5" />
          <span>Add Chapter</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-dark-600">Total Manga</p>
              <p className="text-2xl font-bold text-dark-900">{manga.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-dark-600">Total Chapters</p>
              <p className="text-2xl font-bold text-dark-900">{getTotalChapters()}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-dark-600">Total Views</p>
              <p className="text-2xl font-bold text-dark-900">
                {(getTotalViews() / 1000000).toFixed(1)}M
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-dark-600">Updated Today</p>
              <p className="text-2xl font-bold text-dark-900">
                {manga.filter(m => {
                  const today = new Date();
                  const lastUpdate = new Date(m.lastUpdated);
                  return today.toDateString() === lastUpdate.toDateString();
                }).length}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-400" />
              <input
                type="text"
                placeholder="Search manga..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-dark-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-dark-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="Hiatus">Hiatus</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-dark-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            >
              <option value="recent">Recent</option>
              <option value="title">Title</option>
              <option value="chapters">Chapters</option>
              <option value="views">Views</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-dark-200 rounded-lg hover:bg-dark-50 transition-colors duration-200"
            >
              {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Manga List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                  Manga
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                  Chapters
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-dark-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-dark-200">
              {sortedManga.map((manga) => (
                <tr key={manga.id} className="hover:bg-dark-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={manga.cover}
                        alt={manga.title}
                        className="w-12 h-16 object-cover rounded-lg"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-dark-900">{manga.title}</div>
                        <div className="text-sm text-dark-500">ID: {manga.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-900">
                    {manga.author}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      manga.status === 'Ongoing' ? 'bg-green-100 text-green-800' :
                      manga.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                      manga.status === 'Hiatus' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {manga.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-900">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-primary-600" />
                      <span>{manga.totalChapters || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-500">
                    {new Date(manga.lastUpdated).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setSelectedManga(manga)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title="Manage Chapters"
                      >
                        <BookOpen className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          // Navigate to manga detail
                          toast.success('Manga detail view coming soon!');
                        }}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedManga.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-dark-400 mb-4" />
            <h3 className="text-lg font-medium text-dark-900 mb-2">No manga found</h3>
            <p className="text-dark-500">Try adjusting your search or filters</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ChapterManagementPage;
