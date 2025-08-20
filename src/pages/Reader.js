import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  Settings, 
  Maximize,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ArrowLeft
} from 'lucide-react';
import { getAllManga } from '../services/cloudinaryService';

const Reader = () => {
  const { mangaId, chapterId } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(20);
  const [zoom, setZoom] = useState(100);
  const [readingMode, setReadingMode] = useState('vertical'); // vertical, horizontal
  const [showControls, setShowControls] = useState(true);
  const [mangaInfo, setMangaInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch manga info from Firebase
    const fetchMangaInfo = async () => {
      try {
        const allManga = await getAllManga();
        const manga = allManga.find(m => m.id === mangaId);
        
        if (manga) {
          setMangaInfo({
            title: manga.title,
            chapter: `Chapter ${chapterId || 1}`
          });
        }
      } catch (error) {
        console.error('Error fetching manga info:', error);
      }
    };

    fetchMangaInfo();
  }, [mangaId, chapterId]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'ArrowLeft') {
      handlePreviousPage();
    } else if (e.key === 'ArrowRight') {
      handleNextPage();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentPage]);

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 25, 50));
  };

  const resetZoom = () => {
    setZoom(100);
  };

  if (!mangaInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-black relative overflow-hidden"
      onClick={toggleControls}
    >
      {/* Floating Back Button - Always Visible */}
      <div className="back-button-floating">
        <button
          onClick={() => navigate(`/manga/${mangaId}`, { state: { fromChapter: true } })}
          className="flex items-center justify-center w-12 h-12 bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full shadow-lg border border-gray-200 transition-all duration-200 hover:scale-110"
          title="Back to Manga"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
      </div>

      {/* Header Controls */}
      {showControls && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="absolute top-0 left-0 right-0 z-40 bg-black bg-opacity-80 text-white p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-lg font-semibold">{mangaInfo.title}</span>
              <span className="text-primary-400">{mangaInfo.chapter}</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleZoomOut}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200"
                >
                  <ZoomOut className="h-5 w-5" />
                </button>
                <span className="text-sm min-w-[60px] text-center">{zoom}%</span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200"
                >
                  <ZoomIn className="h-5 w-5" />
                </button>
                <button
                  onClick={resetZoom}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
              
              <select
                value={readingMode}
                onChange={(e) => setReadingMode(e.target.value)}
                className="bg-transparent border border-white border-opacity-30 rounded-lg px-3 py-2 text-sm"
              >
                <option value="vertical">Vertical</option>
                <option value="horizontal">Horizontal</option>
              </select>
              
              <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200">
                <Maximize className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Page Navigation */}
      {showControls && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-0 left-0 right-0 z-40 bg-black bg-opacity-80 text-white p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  currentPage === 1 
                    ? 'text-gray-500 cursor-not-allowed' 
                    : 'text-white hover:bg-white hover:bg-opacity-20'
                }`}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  currentPage === totalPages 
                    ? 'text-gray-500 cursor-not-allowed' 
                    : 'text-white hover:bg-white hover:bg-opacity-20'
                }`}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={(e) => setCurrentPage(parseInt(e.target.value))}
                className="w-32"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Manga Pages */}
      <div className="pt-20 pb-20">
        <div 
          className="max-w-4xl mx-auto"
          style={{ transform: `scale(${zoom / 100})` }}
        >
                     {/* Manga pages will be loaded from Cloudinary */}
           <div className="text-center py-16">
             <div className="text-6xl mb-4">📚</div>
             <h3 className="text-2xl font-semibold text-white mb-2">Chapter Pages</h3>
             <p className="text-gray-300">
               Chapter pages will be loaded from Cloudinary when available
             </p>
           </div>
        </div>
      </div>

      {/* Navigation Hints */}
      {!showControls && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black bg-opacity-50 text-white px-6 py-3 rounded-lg">
            <p className="text-center">
              Click anywhere to show controls<br />
              Use arrow keys to navigate
            </p>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Info */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-black bg-opacity-80 text-white p-3 rounded-lg text-xs">
          <p>← → Arrow keys to navigate</p>
          <p>Space to toggle controls</p>
        </div>
      </div>
    </div>
  );
};

export default Reader;
