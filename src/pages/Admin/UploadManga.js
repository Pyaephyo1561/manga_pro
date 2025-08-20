import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  X, 
  Image, 
  BookOpen, 
  User, 
  Calendar,
  Tag,
  FileText,
  Save,
  Loader,
  Plus,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import { addManga, uploadToCloudinary } from '../../services/cloudinaryService';

const UploadManga = () => {
  const navigate = useNavigate();
  const [coverImage, setCoverImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedManga, setUploadedManga] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
    setValue
  } = useForm({
    mode: 'onChange'
  });

  const status = watch('status');
  const genres = watch('genres');

  const handleBack = () => {
    navigate('/admin/manga');
  };

  // Cover image dropzone
  const onCoverDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      setCoverImage(file);
      setFormErrors(prev => ({ ...prev, coverImage: null }));
    }
  }, []);

  const { getRootProps: getCoverRootProps, getInputProps: getCoverInputProps, isCoverDragActive } = useDropzone({
    onDrop: onCoverDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    maxSize: 5242880 // 5MB
  });

  const removeCoverImage = () => {
    setCoverImage(null);
    setFormErrors(prev => ({ ...prev, coverImage: null }));
  };

  const addGenre = (genre) => {
    const currentGenres = genres || '';
    const genreList = currentGenres.split(',').map(g => g.trim()).filter(g => g);
    
    if (!genreList.includes(genre)) {
      const newGenres = currentGenres ? `${currentGenres}, ${genre}` : genre;
      setValue('genres', newGenres);
    }
  };

  const removeGenre = (genreToRemove) => {
    const currentGenres = genres || '';
    const genreList = currentGenres.split(',').map(g => g.trim()).filter(g => g !== genreToRemove);
    setValue('genres', genreList.join(', '));
  };

  const onSubmit = async (data) => {
    // Validate cover image
    if (!coverImage) {
      setFormErrors(prev => ({ ...prev, coverImage: 'Cover image is required' }));
      toast.error('Please upload a cover image');
      return;
    }

    // Validate required fields
    const missingFields = requiredFields.filter(field => !data[field] || data[field].trim() === '');
    if (missingFields.length > 0) {
      const fieldNames = missingFields.map(field => field.charAt(0).toUpperCase() + field.slice(1)).join(', ');
      toast.error(`Please fill in the following fields: ${fieldNames}`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload cover image to Cloudinary
      const coverUrl = await uploadToCloudinary([coverImage]);
      
      // Prepare manga data
      const mangaData = {
        title: data.title.trim(),
        author: data.author.trim(),
        description: data.description.trim(),
        genres: data.genres.split(',').map(g => g.trim()).filter(g => g),
        status: data.status,
        year: data.year ? parseInt(data.year) : new Date().getFullYear(),
        publisher: data.publisher || 'Unknown',
        cover: coverUrl[0],
        rating: 0,
        totalViews: 0,
        totalLikes: 0,
        chapters: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add manga to Firebase
      await addManga(mangaData);
      
      setUploadedManga(mangaData);
      reset();
      setCoverImage(null);
      toast.success('Manga uploaded successfully!');
      
    } catch (error) {
      console.error('Error uploading manga:', error);
      toast.error(error.message || 'Failed to upload manga');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const requiredFields = ['title', 'author', 'description', 'genres', 'status'];

  const predefinedGenres = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life',
    'Sports', 'Supernatural', 'Thriller', 'Psychological', 'Historical', 'Military', 'Martial Arts', 'School Life',
    'Shoujo', 'Shounen', 'Seinen', 'Josei', 'Ecchi', 'Harem', 'Music', 'Parody', 'Mecha', 'Cyberpunk', 'Post-Apocalyptic',
    'Mecha', 'Music', 'School Life', 'Shoujo', 'Shounen', 'Seinen',
    'Josei', 'Ecchi', 'Harem', 'Martial Arts', 'Military', 'Parody'
  ];

  const currentGenreList = genres ? genres.split(',').map(g => g.trim()).filter(g => g) : [];

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-900">Upload New Manga</h1>
          <p className="text-dark-600 mt-2">Add a new manga series to your website</p>
        </div>
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Manga Management</span>
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Cover Image Upload */}
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-2">
              Cover Image *
            </label>
            {!coverImage ? (
              <div
                {...getCoverRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ${
                  isCoverDragActive
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-dark-300 hover:border-primary-400'
                }`}
              >
                <input {...getCoverInputProps()} />
                <Image className="mx-auto h-12 w-12 text-dark-400 mb-4" />
                <p className="text-lg font-medium text-dark-900 mb-2">
                  {isCoverDragActive ? 'Drop the image here' : 'Upload cover image'}
                </p>
                <p className="text-sm text-dark-500">
                  Drag and drop an image, or click to select
                </p>
                <p className="text-xs text-dark-400 mt-2">
                  PNG, JPG, WEBP up to 5MB
                </p>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={URL.createObjectURL(coverImage)}
                  alt="Cover preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeCoverImage}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                  <CheckCircle className="h-3 w-3 inline mr-1" />
                  Cover selected
                </div>
              </div>
            )}
            {formErrors.coverImage && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {formErrors.coverImage}
              </p>
            )}
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                {...register('title', { 
                  required: 'Title is required',
                  minLength: { value: 2, message: 'Title must be at least 2 characters' }
                })}
                className="w-full px-4 py-3 border border-dark-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter manga title"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Author *
              </label>
              <input
                type="text"
                {...register('author', { 
                  required: 'Author is required',
                  minLength: { value: 2, message: 'Author name must be at least 2 characters' }
                })}
                className="w-full px-4 py-3 border border-dark-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter author name"
              />
              {errors.author && (
                <p className="text-red-500 text-sm mt-1">{errors.author.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Artist
              </label>
              <input
                type="text"
                {...register('artist')}
                className="w-full px-4 py-3 border border-dark-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter artist name (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Year
              </label>
              <input
                type="number"
                {...register('year', { 
                  min: { value: 1900, message: 'Year must be after 1900' },
                  max: { value: new Date().getFullYear(), message: `Year cannot be after ${new Date().getFullYear()}` }
                })}
                className="w-full px-4 py-3 border border-dark-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="2024"
              />
              {errors.year && (
                <p className="text-red-500 text-sm mt-1">{errors.year.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Status *
              </label>
              <select
                {...register('status', { required: 'Status is required' })}
                className="w-full px-4 py-3 border border-dark-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select status</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Hiatus">Hiatus</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              {errors.status && (
                <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Publisher
              </label>
              <input
                type="text"
                {...register('publisher')}
                className="w-full px-4 py-3 border border-dark-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter publisher name (optional)"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-2">
              Description *
            </label>
            <textarea
              {...register('description', { 
                required: 'Description is required',
                minLength: { value: 20, message: 'Description must be at least 20 characters' }
              })}
              rows={4}
              className="w-full px-4 py-3 border border-dark-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter manga description..."
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Genres */}
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-2">
              Genres *
            </label>
            <input
              type="text"
              {...register('genres', { 
                required: 'Genres are required',
                minLength: { value: 2, message: 'Please add at least one genre' }
              })}
              className="w-full px-4 py-3 border border-dark-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Action, Adventure, Comedy (comma separated)"
            />
            {errors.genres && (
              <p className="text-red-500 text-sm mt-1">{errors.genres.message}</p>
            )}
            
            {/* Selected Genres Display */}
            {currentGenreList.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {currentGenreList.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm flex items-center"
                  >
                    {genre}
                    <button
                      type="button"
                      onClick={() => removeGenre(genre)}
                      className="ml-2 text-primary-500 hover:text-primary-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            {/* Available Genres */}
            <div className="mt-3">
              <p className="text-sm text-dark-600 mb-2">Quick add genres:</p>
              <div className="flex flex-wrap gap-2">
                {predefinedGenres.map((genre) => (
                  <span
                    key={genre}
                    className={`px-2 py-1 rounded-full text-xs cursor-pointer transition-colors duration-200 ${
                      currentGenreList.includes(genre)
                        ? 'bg-primary-200 text-primary-800'
                        : 'bg-dark-100 text-dark-700 hover:bg-primary-100 hover:text-primary-700'
                    }`}
                    onClick={() => addGenre(genre)}
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="bg-dark-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-dark-700">Uploading...</span>
                <span className="text-sm text-dark-500">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-dark-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                reset();
                setCoverImage(null);
                setUploadedManga(null);
                setFormErrors({});
              }}
              className="px-6 py-3 border border-dark-200 text-dark-700 rounded-lg hover:bg-dark-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !isValid || !coverImage}
              className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Upload Manga</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Success Message */}
      {uploadedManga && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-green-50 border border-green-200 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-900">
                Manga Uploaded Successfully!
              </h3>
              <p className="text-green-700">
                "{uploadedManga.title}" has been added to your collection.
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-green-600">
              Now you can add chapters to make your manga available for readers.
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  reset();
                  setCoverImage(null);
                  setUploadedManga(null);
                  setFormErrors({});
                }}
                className="px-4 py-2 text-green-700 border border-green-300 rounded-lg hover:bg-green-100 transition-colors duration-200"
              >
                Upload Another Manga
              </button>
              <button
                onClick={() => {
                  // Navigate to manga management
                  window.location.href = '/admin/manga';
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                <BookOpen className="h-4 w-4" />
                <span>Manage Manga</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default UploadManga;
