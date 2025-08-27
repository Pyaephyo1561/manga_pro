import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  uploadToCloudinary,
  setChapterPaidMeta 
} from '../../services/cloudinaryService';

import { useParams, useNavigate } from 'react-router-dom';

// Sortable Image Item Component
const SortableImageItem = ({ file, index, onRemove, onMoveUp, onMoveDown }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${file.name}-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group border border-gray-200 dark:border-dark-600 rounded-lg overflow-hidden bg-white dark:bg-dark-700 transition-all ${
        isDragging ? 'shadow-lg scale-105 z-10' : ''
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 bg-black bg-opacity-50 text-white px-2 py-1 rounded cursor-grab active:cursor-grabbing z-10 touch-manipulation"
      >
        <GripVertical className="h-4 w-4 md:h-3 md:w-3" />
      </div>
      <img
        src={file.isExisting ? file.url : URL.createObjectURL(file)}
        alt={file.name}
        className="w-full h-36 sm:h-32 object-cover select-none touch-pan-y"
        onLoad={(e) => {
          if (!file.isExisting) {
            URL.revokeObjectURL(e.currentTarget.src);
          }
        }}
      />
      <div className="absolute inset-x-0 bottom-0 bg-black bg-opacity-50 text-white text-xs px-2 py-1 truncate">
        {file.isExisting ? `Existing Image ${index + 1}` : file.name}
      </div>
      {file.isExisting && (
        <div className="absolute top-1 right-8 bg-blue-600 text-white text-xs px-2 py-1 rounded">
          Existing
        </div>
      )}
      <div className="absolute top-1 right-1 flex items-center gap-1">
        <button
          type="button"
          onClick={() => onMoveUp(index)}
          className="bg-gray-800/80 text-white text-xs px-2 py-1 rounded hover:bg-gray-900/90"
          title="Move up"
        >
          ↑
        </button>
        <button
          type="button"
          onClick={() => onMoveDown(index)}
          className="bg-gray-800/80 text-white text-xs px-2 py-1 rounded hover:bg-gray-900/90"
          title="Move down"
        >
          ↓
        </button>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="bg-red-600 text-white text-xs px-2.5 py-1.5 rounded"
          title="Remove"
        >
          Remove
        </button>
      </div>
    </div>
  );
};

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

  // DnD sensors (touch-friendly)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        // Require a slight move to start dragging to avoid accidental scroll taps
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
  const paidToggle = watch('isPaid');
  const paidPrice = watch('price');

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
    
    // Get current images and add new ones
    const currentImages = Array.isArray(selectedImages) ? selectedImages : [];
    const updatedImages = [...currentImages, ...sortedFiles];
    
    setValue('images', updatedImages, { shouldValidate: true, shouldDirty: true });
    toast.success(`${sortedFiles.length} new image(s) added`);
  }, [setValue, selectedImages]);

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
  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const currentImages = Array.isArray(selectedImages) ? selectedImages : [];
      const oldIndex = currentImages.findIndex((_, index) => `${currentImages[index].name}-${index}` === active.id);
      const newIndex = currentImages.findIndex((_, index) => `${currentImages[index].name}-${index}` === over.id);
      
      const reorderedImages = arrayMove(currentImages, oldIndex, newIndex);
      setValue('images', reorderedImages, { shouldValidate: true, shouldDirty: true });
      toast.success('Images reordered successfully');
    }
  }, [selectedImages, setValue]);

  // Fallback: handle native input change as well (click selection)
  const handleFileInputChange = useCallback((event) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (!files.length) return;
    const sortedFiles = files.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );
    
    // Get current images and add new ones
    const currentImages = Array.isArray(selectedImages) ? selectedImages : [];
    const updatedImages = [...currentImages, ...sortedFiles];
    
    setValue('images', updatedImages, { shouldValidate: true, shouldDirty: true });
    toast.success(`${sortedFiles.length} new image(s) added`);
  }, [setValue, selectedImages]);

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
      let imageUrls = [];
      
      if (editingChapter) {
        // Handle existing and new images for editing
        const existingImages = data.images.filter(img => img.isExisting);
        const newImages = data.images.filter(img => !img.isExisting);
        
        // Keep existing image URLs
        const existingUrls = existingImages.map(img => img.url);
        
        // Upload only new images
        let newUrls = [];
        if (newImages.length > 0) {
          newUrls = await uploadToCloudinary(newImages);
        }
        
        // Combine existing and new URLs in the correct order
        imageUrls = data.images.map(img => {
          if (img.isExisting) {
            return img.url;
          } else {
            // Find the corresponding new URL
            const newImageIndex = newImages.findIndex(newImg => newImg.name === img.name);
            return newUrls[newImageIndex];
          }
        });
      } else {
        // Upload all images for new chapter
        imageUrls = await uploadToCloudinary(data.images);
      }
      
      // Create chapter data
      const chapterData = {
        mangaId,
        title: data.title.trim(),
        chapterNumber: parseFloat(data.chapterNumber),
        pages: imageUrls.length,
        images: imageUrls,
        uploadDate: editingChapter ? editingChapter.uploadDate : new Date().toISOString(),
        views: editingChapter ? editingChapter.views : 0,
        status: 'published',
        isPaid: !!data.isPaid,
        price: data.isPaid ? Number(data.price || 0) : 0
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
    setValue('isPaid', !!chapter.isPaid);
    setValue('price', Number(chapter.price || 0));
    
    // Convert existing image URLs to File objects for editing
    if (chapter.images && chapter.images.length > 0) {
      const imageFiles = chapter.images.map((url, index) => {
        // Create a File-like object from the URL
        const fileName = `existing-image-${index + 1}.jpg`;
        return {
          name: fileName,
          url: url,
          isExisting: true,
          size: 0,
          type: 'image/jpeg'
        };
      });
      setValue('images', imageFiles, { shouldValidate: true, shouldDirty: true });
    }
    
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
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 shadow-sm border-b dark:border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center text-gray-600 dark:text-dark-300 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Manga Management
              </button>
              <div className="h-6 w-px bg-gray-300 dark:bg-dark-600"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chapter Management</h1>
                <p className="text-gray-600 dark:text-dark-300">{mangaTitle}</p>
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
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Total Chapters</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{chapters.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Image className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Total Pages</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {chapters.reduce((sum, ch) => sum + (ch.pages || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Eye className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Total Views</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {chapters.reduce((sum, ch) => sum + (ch.views || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                <Calendar className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Latest Chapter</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {chapters.length > 0 ? chapters[chapters.length - 1].chapterNumber : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-dark-400" />
                <input
                  type="text"
                  placeholder="Search chapters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-dark-400"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              >
                <option value="chapterNumber">Chapter Number</option>
                <option value="title">Title</option>
                <option value="uploadDate">Upload Date</option>
                <option value="views">Views</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 dark:text-dark-200"
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
              className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6 mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingChapter ? 'Edit Chapter' : 'Add New Chapter'}
                </h2>
                <button
                  onClick={handleCancelEdit}
                  className="p-2 text-gray-400 dark:text-dark-400 hover:text-gray-600 dark:hover:text-white rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                      Chapter Number *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      {...register('chapterNumber', { 
                        required: 'Chapter number is required',
                        min: { value: 0, message: 'Chapter number must be positive' }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                      placeholder="1.0"
                    />
                    {errors.chapterNumber && (
                      <p className="text-red-500 text-sm mt-1">{errors.chapterNumber.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                      Chapter Title *
                    </label>
                    <input
                      type="text"
                      {...register('title', { 
                        required: 'Chapter title is required',
                        minLength: { value: 3, message: 'Title must be at least 3 characters' }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                      placeholder="Chapter Title"
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                    Chapter Images *
                  </label>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-300 dark:border-dark-600 hover:border-gray-400 dark:hover:border-dark-500 hover:bg-gray-50 dark:hover:bg-dark-700'
                    }`}
                  >
                    <input {...getInputProps({ onChange: handleFileInputChange })} />
                    <Upload className="h-8 w-8 text-gray-400 dark:text-dark-400 mx-auto mb-2" />
                                         <p className="text-sm text-gray-600 dark:text-dark-300">
                       {isDragActive
                         ? 'Drop the images here...'
                         : editingChapter 
                           ? 'Drag & drop new images here, or click to add more'
                           : 'Drag & drop images here, or click to select'}
                     </p>
                    <p className="text-xs text-gray-500 dark:text-dark-400 mt-1">
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
                        <p className="text-sm text-gray-600 dark:text-dark-300">
                          {selectedImages.length} image{selectedImages.length > 1 ? 's' : ''} selected
                          <span className="ml-2 text-xs text-gray-500 dark:text-dark-400">(Drag to reorder)</span>
                        </p>
                        <button
                          type="button"
                          onClick={clearAllImages}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Clear all
                        </button>
                      </div>
                      
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={selectedImages.map((file, idx) => `${file.name}-${idx}`)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-3 gap-y-4">
                            {selectedImages.map((file, idx) => (
                              <SortableImageItem
                                key={`${file.name}-${idx}`}
                                file={file}
                                index={idx}
                                onRemove={removeImageAt}
                                onMoveUp={(i) => {
                                  const current = Array.isArray(selectedImages) ? selectedImages : [];
                                  if (i <= 0) return;
                                  const next = arrayMove(current, i, i - 1);
                                  setValue('images', next, { shouldValidate: true, shouldDirty: true });
                                }}
                                onMoveDown={(i) => {
                                  const current = Array.isArray(selectedImages) ? selectedImages : [];
                                  if (i >= current.length - 1) return;
                                  const next = arrayMove(current, i, i + 1);
                                  setValue('images', next, { shouldValidate: true, shouldDirty: true });
                                }}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </div>
                  )}
                </div>

                {/* Paywall controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-dark-200">
                      <input type="checkbox" {...register('isPaid')} />
                      Paid chapter
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                      Price (coins)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      disabled={!paidToggle}
                      {...register('price')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white disabled:opacity-50"
                      placeholder="e.g. 5"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-gray-700 dark:text-dark-200 bg-gray-100 dark:bg-dark-700 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600"
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
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Chapters ({filteredAndSortedChapters.length})
            </h3>
          </div>

          {filteredAndSortedChapters.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 dark:text-dark-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No chapters found</h3>
              <p className="text-gray-600 dark:text-dark-300 mb-4">
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
            <div className="divide-y divide-gray-200 dark:divide-dark-700">
              {filteredAndSortedChapters.map((chapter, index) => (
                <div
                  key={chapter.id}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {chapter.chapterNumber}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                          Chapter {chapter.chapterNumber}: {chapter.title}
                        </h4>
                        <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-dark-300 mt-1">
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
                        className="p-2 text-gray-400 dark:text-dark-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30"
                        title="Edit Chapter"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteChapter(chapter.id)}
                        className="p-2 text-gray-400 dark:text-dark-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
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
