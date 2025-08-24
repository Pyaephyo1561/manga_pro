import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  Upload, 
  X, 
  Image, 
  FileText, 
  Save, 
  Loader,
  Plus,
  Trash2,
  Edit,
  Eye,
  ArrowLeft,
  Calendar,
  Search,
  SortAsc,
  SortDesc,
  GripVertical
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  addChapter, 
  getChaptersByMangaId, 
  updateChapter, 
  deleteChapter,
  uploadToCloudinary 
} from '../../services/cloudinaryService';

import { useParams, useNavigate } from 'react-router-dom';

const ChapterManagement = () => {
  const { mangaId } = useParams();
  const navigate = useNavigate();
  const [mangaTitle, setMangaTitle] = useState('');
  
  const onBack = () => {
    navigate('/admin/manga');
  };
  
  const [chapters, setChapters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('chapterNumber');
  const [sortOrder, setSortOrder] = useState('asc');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    watch
  } = useForm({
    mode: 'onChange'
  });

  const chapterNumber = watch('chapterNumber');
  const selectedImages = watch('images', []);

  useEffect(() => {
    if (mangaId) {
      fetchChapters();
      fetchMangaTitle();
    }
  }, [mangaId]);

  const fetchMangaTitle = async () => {
    try {
      const { getMangaById } = await import('../../services/cloudinaryService');
      const manga = await getMangaById(mangaId);
      if (manga) {
        setMangaTitle(manga.title);
      }
    } catch (error) {
      console.error('Error fetching manga title:', error);
      setMangaTitle('Unknown Manga');
    }
  };

  const fetchChapters = async () => {
    try {
      setIsLoading(true);
      const chaptersData = await getChaptersByMangaId(mangaId);
      setChapters(chaptersData.sort((a, b) => parseFloat(a.chapterNumber) - parseFloat(b.chapterNumber)));
    } catch (error) {
      console.error('Error fetching chapters:', error);
      toast.error('Failed to fetch chapters');
      setChapters([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    
    // Ensure page order by sorting filenames naturally (e.g., 1, 2, 10)
    const sortedFiles = [...acceptedFiles].sort((a, b) => 
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );
    
    setValue('images', sortedFiles, { shouldValidate: true, shouldDirty: true });
    toast.success(`${sortedFiles.length} image(s) selected in order`);
  }, [setValue]);

  const removeImageAt = useCallback((indexToRemove) => {
    const current = Array.isArray(selectedImages) ? selectedImages : [];
    const next = current.filter((_, idx) => idx !== indexToRemove);
    setValue('images', next, { shouldValidate: true, shouldDirty: true });
  }, [selectedImages, setValue]);

  const clearAllImages = useCallback(() => {
    setValue('images', [], { shouldValidate: true, shouldDirty: true });
    toast.success('Cleared selected images');
  }, [setValue]);

  // Handle drag and drop reordering of images
  const handleDragEnd = useCallback((result) => {
    if (!result.destination) return;
    
    const currentImages = Array.isArray(selectedImages) ? selectedImages : [];
    const reorderedImages = Array.from(currentImages);
    const [reorderedItem] = reorderedImages.splice(result.source.index, 1);
    reorderedImages.splice(result.destination.index, 0, reorderedItem);
    
    setValue('images', reorderedImages, { shouldValidate: true, shouldDirty: true });
    toast.success('Images reordered successfully');
  }, [selectedImages, setValue]);

  // Fallback: handle native input change as well (click selection)
  const handleFileInputChange = useCallback((event) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (!files.length) return;
    const sortedFiles = files.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );
    setValue('images', sortedFiles, { shouldValidate: true, shouldDirty: true });
    toast.success(`${sortedFiles.length} image(s) selected in order`);
  }, [setValue]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true
  });

  const onSubmit = async (data) => {
    if (!data.images || data.images.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload images to Cloudinary
      const imageUrls = await uploadToCloudinary(data.images);
      
      // Create chapter data
      const chapterData = {
        mangaId,
        title: data.title.trim(),
        chapterNumber: parseFloat(data.chapterNumber),
        pages: imageUrls.length,
        images: imageUrls,
        uploadDate: new Date().toISOString(),
        views: 0,
        status: 'published'
      };

      if (editingChapter) {
        // Update existing chapter
        await updateChapter(editingChapter.id, chapterData);
        toast.success('Chapter updated successfully!');
        setEditingChapter(null);
      } else {
        // Add new chapter
        await addChapter(chapterData);
        toast.success('Chapter added successfully!');
      }

      // Reset form and refresh chapters
      reset();
      setShowUploadForm(false);
      fetchChapters();
      
    } catch (error) {
      console.error('Error saving chapter:', error);
      toast.error(error.message || 'Failed to save chapter');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleEditChapter = (chapter) => {
    setEditingChapter(chapter);
    setValue('title', chapter.title);
    setValue('chapterNumber', chapter.chapterNumber);
    setShowUploadForm(true);
  };

  const handleDeleteChapter = async (chapterId) => {
    if (!window.confirm('Are you sure you want to delete this chapter? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteChapter(chapterId);
      toast.success('Chapter deleted successfully');
      fetchChapters();
    } catch (error) {
      console.error('Error deleting chapter:', error);
      toast.error('Failed to delete chapter');
    }
  };

  const handleCancelEdit = () => {
    setEditingChapter(null);
    reset();
    setShowUploadForm(false);
  };

  // Filter and sort chapters
  const filteredAndSortedChapters = chapters
    .filter(chapter => 
      chapter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chapter.chapterNumber.toString().includes(searchTerm)
    )
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
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Manga Management
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Chapter Management</h1>
                <p className="text-gray-600">{mangaTitle}</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowUploadForm(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Chapter
            </button>
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
                <p className="text-2xl font-bold text-gray-900">{chapters.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <Image className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pages</p>
                <p className="text-2xl font-bold text-gray-900">
                  {chapters.reduce((sum, ch) => sum + (ch.pages || 0), 0)}
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
                  {chapters.reduce((sum, ch) => sum + (ch.views || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Latest Chapter</p>
                <p className="text-2xl font-bold text-gray-900">
                  {chapters.length > 0 ? chapters[chapters.length - 1].chapterNumber : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search chapters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="chapterNumber">Chapter Number</option>
                <option value="title">Title</option>
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

        {/* Upload Form */}
        <AnimatePresence>
          {showUploadForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-lg shadow-sm p-6 mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingChapter ? 'Edit Chapter' : 'Add New Chapter'}
                </h2>
                <button
                  onClick={handleCancelEdit}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chapter Number *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      {...register('chapterNumber', { 
                        required: 'Chapter number is required',
                        min: { value: 0, message: 'Chapter number must be positive' }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1.0"
                    />
                    {errors.chapterNumber && (
                      <p className="text-red-500 text-sm mt-1">{errors.chapterNumber.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chapter Title *
                    </label>
                    <input
                      type="text"
                      {...register('title', { 
                        required: 'Chapter title is required',
                        minLength: { value: 3, message: 'Title must be at least 3 characters' }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Chapter Title"
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chapter Images *
                  </label>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <input {...getInputProps({ onChange: handleFileInputChange })} />
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {isDragActive
                        ? 'Drop the images here...'
                        : 'Drag & drop images here, or click to select'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Supports: JPEG, PNG, GIF, WebP
                    </p>
                  </div>
                  {errors.images && (
                    <p className="text-red-500 text-sm mt-1">{errors.images.message}</p>
                  )}
                  {/* Hidden input to register images with react-hook-form */}
                  <input type="hidden" {...register('images', { required: 'Please select images' })} />

                  {/* Selected images preview with drag and drop */}
                  {Array.isArray(selectedImages) && selectedImages.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">
                          {selectedImages.length} image{selectedImages.length > 1 ? 's' : ''} selected
                          <span className="ml-2 text-xs text-gray-500">(Drag to reorder)</span>
                        </p>
                        <button
                          type="button"
                          onClick={clearAllImages}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Clear all
                        </button>
                      </div>
                      
                      <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="images" direction="horizontal">
                          {(provided) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
                            >
                              {selectedImages.map((file, idx) => (
                                <Draggable key={`${file.name}-${idx}`} draggableId={`${file.name}-${idx}`} index={idx}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className={`relative group border rounded-lg overflow-hidden bg-white transition-all ${
                                        snapshot.isDragging ? 'shadow-lg scale-105 z-10' : ''
                                      }`}
                                    >
                                      <div
                                        {...provided.dragHandleProps}
                                        className="absolute top-1 left-1 bg-black bg-opacity-50 text-white p-1 rounded cursor-grab active:cursor-grabbing z-10"
                                      >
                                        <GripVertical className="h-3 w-3" />
                                      </div>
                                      <img
                                        src={URL.createObjectURL(file)}
                                        alt={file.name}
                                        className="w-full h-32 object-cover"
                                        onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)}
                                      />
                                      <div className="absolute inset-x-0 bottom-0 bg-black bg-opacity-50 text-white text-xs px-2 py-1 truncate">
                                        {file.name}
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => removeImageAt(idx)}
                                        className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Remove"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!isValid || isUploading}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        {editingChapter ? 'Updating...' : 'Uploading...'}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {editingChapter ? 'Update Chapter' : 'Add Chapter'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

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
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first chapter.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowUploadForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Chapter
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAndSortedChapters.map((chapter, index) => (
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
                        <h4 className="text-lg font-medium text-gray-900">
                          Chapter {chapter.chapterNumber}: {chapter.title}
                        </h4>
                        <div className="flex items-center space-x-6 text-sm text-gray-500 mt-1">
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
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditChapter(chapter)}
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                        title="Edit Chapter"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteChapter(chapter.id)}
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

export default ChapterManagement;
