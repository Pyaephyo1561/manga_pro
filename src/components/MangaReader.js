import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  X,
  BookOpen,
  Settings,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

const MangaReader = ({ manga, chapter, onClose, onChapterChange }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [readingMode, setReadingMode] = useState('vertical'); // vertical, horizontal
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1);
  
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const autoScrollInterval = useRef(null);

  useEffect(() => {
    if (autoScroll && readingMode === 'vertical') {
      autoScrollInterval.current = setInterval(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop += scrollSpeed;
        }
      }, 50);
    }

    return () => {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
      }
    };
  }, [autoScroll, readingMode, scrollSpeed]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          if (readingMode === 'horizontal') {
            handlePreviousPage();
          }
          break;
        case 'ArrowRight':
          if (readingMode === 'horizontal') {
            handleNextPage();
          }
          break;
        case 'ArrowUp':
          if (readingMode === 'vertical') {
            handlePreviousPage();
          }
          break;
        case 'ArrowDown':
          if (readingMode === 'vertical') {
            handleNextPage();
          }
          break;
        case 'Escape':
          onClose();
          break;
        case 'f':
          toggleFullscreen();
          break;
        case ' ':
          e.preventDefault();
          if (readingMode === 'horizontal') {
            handleNextPage();
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, readingMode, chapter]);

  const handleNextPage = () => {
    if (currentPage < chapter.images.length - 1) {
      setCurrentPage(currentPage + 1);
    } else if (onChapterChange) {
      // Move to next chapter if available
      onChapterChange('next');
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    } else if (onChapterChange) {
      // Move to previous chapter if available
      onChapterChange('prev');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const resetView = () => {
    setZoom(1);
    setRotation(0);
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
      containerRef.current.scrollLeft = 0;
    }
  };

  const toggleAutoScroll = () => {
    setAutoScroll(!autoScroll);
  };

  if (!manga || !chapter) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-dark-400 mb-4" />
          <h3 className="text-lg font-medium text-dark-900 mb-2">No Chapter Selected</h3>
          <p className="text-dark-500">Please select a chapter to read</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Header Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="absolute top-0 left-0 right-0 bg-black bg-opacity-75 text-white p-4 z-10"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold">
                  {manga.title} - Chapter {chapter.chapterNumber}
                  {chapter.title && `: ${chapter.title}`}
                </h2>
                <span className="text-sm text-gray-300">
                  Page {currentPage + 1} of {chapter.images.length}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleAutoScroll}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    autoScroll ? 'bg-primary-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  title="Auto Scroll"
                >
                  <RotateCw className="h-4 w-4" />
                </button>
                
                <select
                  value={readingMode}
                  onChange={(e) => setReadingMode(e.target.value)}
                  className="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm"
                >
                  <option value="vertical">Vertical</option>
                  <option value="horizontal">Horizontal</option>
                </select>
                
                <button
                  onClick={resetView}
                  className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                  title="Reset View"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                
                <button
                  onClick={toggleFullscreen}
                  className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                  title="Toggle Fullscreen"
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
                
                <button
                  onClick={onClose}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                  title="Close Reader"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reading Area */}
      <div 
        ref={containerRef}
        className="w-full h-full overflow-auto bg-gray-900"
        onMouseMove={() => {
          setShowControls(true);
          setTimeout(() => setShowControls(false), 3000);
        }}
        onMouseLeave={() => setShowControls(false)}
      >
        {readingMode === 'vertical' ? (
          // Vertical Reading Mode
          <div className="flex flex-col items-center min-h-full py-4">
            {chapter.images.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-4"
              >
                <img
                  ref={imageRef}
                  src={image}
                  alt={`Page ${index + 1}`}
                  className="max-w-full h-auto"
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transformOrigin: 'center top'
                  }}
                  draggable={false}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          // Horizontal Reading Mode
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 0}
                className="p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              
              <div className="relative">
                <img
                  ref={imageRef}
                  src={chapter.images[currentPage]}
                  alt={`Page ${currentPage + 1}`}
                  className="max-h-[90vh] max-w-[80vw] object-contain"
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transformOrigin: 'center center'
                  }}
                  draggable={false}
                />
              </div>
              
              <button
                onClick={handleNextPage}
                disabled={currentPage === chapter.images.length - 1}
                className="p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Zoom Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded-lg z-10"
          >
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              
              <span className="text-sm min-w-[3rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              
              <button
                onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Navigation for Vertical Mode */}
      {readingMode === 'vertical' && (
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white p-3 rounded-lg z-10"
            >
              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 0}
                  className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Previous Page"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                
                <span className="text-sm px-3">
                  {currentPage + 1} / {chapter.images.length}
                </span>
                
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === chapter.images.length - 1}
                  className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Next Page"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default MangaReader;
