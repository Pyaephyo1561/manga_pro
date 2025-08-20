import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  BookOpen, 
  Eye, 
  Calendar, 
  Search, 
  SortAsc, 
  SortDesc,
  Filter,
  ArrowRight,
  Plus,
  Edit,
  Trash2,
  Image
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllManga, getChaptersByMangaId } from '../../services/cloudinaryService';
import { useNavigate } from 'react-router-dom';

const AllChaptersManagement = () => {
  const navigate = useNavigate();
  const [allChapters, setAllChapters] = useState([]);
  const [mangaData, setMangaData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('chapterNumber');
  const [sortOrder, setSortOrder] = useState('asc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [mangaFilter, setMangaFilter] = useState('all');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all manga first
      const mangaList = await getAllManga();
      const mangaMap = {};
      const chaptersWithManga = [];
      
      // Fetch chapters for each manga
      for (const manga of mangaList) {
        mangaMap[manga.id] = manga;
        try {
          const chapters = await getChaptersByMangaId(manga.id);
          chapters.forEach(chapter => {
            chaptersWithManga.push({
              ...chapter,
              mangaTitle: manga.title,
              mangaId: manga.id,
              mangaCover: manga.coverImage
            });
          });
        } catch (error) {
          console.error(`Error fetching chapters for manga ${manga.id}:`, error);
        }
      }
      
      setMangaData(mangaMap);
      setAllChapters(chaptersWithManga);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch chapters data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageMangaChapters = (mangaId) => {
    navigate(`/admin/manga/${mangaId}/chapters`);
  };

  const handleEditChapter = (chapter) => {
    navigate(`/admin/manga/${chapter.mangaId}/chapters`);
  };

  const handleDeleteChapter = async (chapter) => {
    if (!window.confirm('Are you sure you want to delete this chapter? This action cannot be undone.')) {
      return;
    }

    try {
      // Import the delete function dynamically
      const { deleteChapter } = await import('../../services/cloudinaryService');
      await deleteChapter(chapter.id);
      toast.success('Chapter deleted successfully');
      fetchAllData(); // Refresh data
    } catch (error) {
      console.error('Error deleting chapter:', error);
      toast.error('Failed to delete chapter');
    }
  };

  // Filter and sort chapters
  const filteredAndSortedChapters = allChapters
    .filter(chapter => {
      const matchesSearch = 
        chapter.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chapter.mangaTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chapter.chapterNumber?.toString().includes(searchTerm);
      
      const matchesStatus = statusFilter === 'all' || chapter.status === statusFilter;
      const matchesManga = mangaFilter === 'all' || chapter.mangaId === mangaFilter;
      
      return matchesSearch && matchesStatus && matchesManga;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'chapterNumber') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const uniqueManga = Object.values(mangaData);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chapters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">All Chapters Management</h1>
              <p className="text-gray-600">Manage chapters across all manga</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/manga')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Manage Manga
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Chapters</p>
                <p className="text-2xl font-bold text-gray-900">{allChapters.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Manga</p>
                <p className="text-2xl font-bold text-gray-900">{uniqueManga.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <Image className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pages</p>
                <p className="text-2xl font-bold text-gray-900">
                  {allChapters.reduce((sum, ch) => sum + (ch.pages || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Eye className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">
                  {allChapters.reduce((sum, ch) => sum + (ch.views || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search chapters or manga..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={mangaFilter}
                onChange={(e) => setMangaFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Manga</option>
                {uniqueManga.map(manga => (
                  <option key={manga.id} value={manga.id}>
                    {manga.title}
                  </option>
                ))}
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="chapterNumber">Chapter Number</option>
                <option value="title">Title</option>
                <option value="mangaTitle">Manga</option>
                <option value="uploadDate">Upload Date</option>
                <option value="views">Views</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Chapters List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Chapters ({filteredAndSortedChapters.length})
            </h3>
          </div>

          {filteredAndSortedChapters.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No chapters found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' || mangaFilter !== 'all' 
                  ? 'Try adjusting your search terms or filters.' 
                  : 'Get started by adding chapters to your manga.'}
              </p>
              {!searchTerm && statusFilter === 'all' && mangaFilter === 'all' && (
                <button
                  onClick={() => navigate('/admin/manga')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Manage Manga
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAndSortedChapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold text-blue-600">
                            {chapter.chapterNumber}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-lg font-medium text-gray-900">
                            Chapter {chapter.chapterNumber}: {chapter.title}
                          </h4>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm font-medium text-blue-600">
                            {chapter.mangaTitle}
                          </span>
                        </div>
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Image className="h-4 w-4 mr-1" />
                            {chapter.pages || 0} pages
                          </span>
                          <span className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {chapter.views || 0} views
                          </span>
                          {chapter.uploadDate && (
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(chapter.uploadDate).toLocaleDateString()}
                            </span>
                          )}
                          <span className="flex items-center">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              chapter.status === 'published' ? 'bg-green-100 text-green-800' :
                              chapter.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {chapter.status || 'unknown'}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleManageMangaChapters(chapter.mangaId)}
                        className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                        title="Manage Manga Chapters"
                      >
                        <BookOpen className="h-4 w-4 mr-1" />
                        Manage
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </button>
                      
                      <button
                        onClick={() => handleEditChapter(chapter)}
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                        title="Edit Chapter"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteChapter(chapter)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                        title="Delete Chapter"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllChaptersManagement;
