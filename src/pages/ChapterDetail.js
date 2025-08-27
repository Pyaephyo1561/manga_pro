import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  BookOpen, 
  Calendar, 
  Eye, 
  Star, 
  Download,
  Share2,
  Bookmark,
  Settings,
  Edit,
  Trash2,
  Plus,
  List,
  Menu,
  Grid,
  Coins
} from 'lucide-react';
import { getMangaById, getChaptersByMangaId, recordReadingHistoryForUser, getUserCoinBalance, isChapterPurchasedByUser, deductCoinsFromUser, recordChapterPurchase } from '../services/cloudinaryService';
import { onAuthStateChange } from '../services/authService';

const ChapterDetail = () => {
  const { mangaId, chapterId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('reader'); // 'reader', 'list', 'grid'
  const [isAdmin, setIsAdmin] = useState(false);
  const [coins, setCoins] = useState(0);
  const [paywall, setPaywall] = useState({ locked: false, price: 0 });
  const [unlocking, setUnlocking] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [paywallChecking, setPaywallChecking] = useState(true);
  const [showBottomMenu, setShowBottomMenu] = useState(false);

  useEffect(() => {
    checkAdminStatus();
    fetchMangaAndChapters();
  }, [mangaId, chapterId]);

  // Listen for auth to record reading history and track user
  useEffect(() => {
    const unsub = onAuthStateChange(async (u) => {
      setAuthUser(u);
      if (u) {
        try {
          await recordReadingHistoryForUser(u.uid, mangaId, chapterId, currentChapter?.chapterNumber);
          // Re-evaluate paywall once logged in
          if (currentChapter) {
            await evaluatePaywall(currentChapter, u);
          }
        } catch (e) {}
      }
    });
    return () => unsub && unsub();
  }, [mangaId, chapterId, currentChapter]);

  const checkAdminStatus = () => {
    const adminUser = localStorage.getItem('adminUser');
    setIsAdmin(!!adminUser);
  };

  const fetchMangaAndChapters = async () => {
    try {
      setIsLoading(true);
      
      // Fetch manga and chapters in parallel
      const [mangaData, chaptersData] = await Promise.all([
        getMangaById(mangaId),
        getChaptersByMangaId(mangaId)
      ]);

      // Check if manga was found
      if (!mangaData) {
        console.error(`Manga with ID ${mangaId} not found`);
        setManga(null);
        setChapters([]);
        return;
      }

      setManga(mangaData);
      
      // Sort chapters by chapter number
      const sortedChapters = chaptersData.sort((a, b) => 
        parseFloat(a.chapterNumber) - parseFloat(b.chapterNumber)
      );
      setChapters(sortedChapters);

      // Find current chapter
      const chapterIndex = sortedChapters.findIndex(ch => ch.id === chapterId);
      if (chapterIndex !== -1) {
        setCurrentChapter(sortedChapters[chapterIndex]);
        setCurrentChapterIndex(chapterIndex);
        setPaywallChecking(true);
        await evaluatePaywall(sortedChapters[chapterIndex], authUser);
      } else if (sortedChapters.length > 0) {
        // If chapter not found, redirect to first chapter
        navigate(`/manga/${mangaId}/read/${sortedChapters[0].id}`);
      }
    } catch (error) {
      console.error('Error fetching manga and chapters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const evaluatePaywall = async (chapter, userOverride) => {
    try {
      const user = userOverride || authUser;
      const isPaid = !!chapter.isPaid;
      const price = Number(chapter.price || 0);
      if (!isPaid || price <= 0) {
        setPaywall({ locked: false, price: 0 });
        setPaywallChecking(false);
        return;
      }
      if (!user) {
        setPaywall({ locked: true, price });
        setPaywallChecking(false);
        return;
      }
      const owned = await isChapterPurchasedByUser(user.uid, chapter.id);
      if (owned) {
        setPaywall({ locked: false, price: 0 });
        setPaywallChecking(false);
        return;
      }
      const balance = await getUserCoinBalance(user.uid);
      setCoins(balance);
      setPaywall({ locked: true, price });
    } catch (e) {
      setPaywall({ locked: false, price: 0 });
    }
    setPaywallChecking(false);
  };

  const handleUnlock = async () => {
    try {
      if (!authUser || !currentChapter) {
        navigate('/auth', { state: { redirectTo: location.pathname } });
        return;
      }
      setUnlocking(true);
      // If already purchased (lifetime), don't charge again
      const alreadyOwned = await isChapterPurchasedByUser(authUser.uid, currentChapter.id);
      if (alreadyOwned) {
        setPaywall({ locked: false, price: 0 });
        setUnlocking(false);
        return;
      }
      const ok = await deductCoinsFromUser(authUser.uid, paywall.price);
      if (!ok) {
        alert('Not enough coins.');
        setUnlocking(false);
        return;
      }
      await recordChapterPurchase(authUser.uid, currentChapter.id, paywall.price);
      setPaywall({ locked: false, price: 0 });
      setCoins((c) => Math.max(0, c - paywall.price));
    } catch (e) {
      // noop
    } finally {
      setUnlocking(false);
    }
  };

  const navigateToChapter = (direction) => {
    if (direction === 'prev' && currentChapterIndex > 0) {
      const prevChapter = chapters[currentChapterIndex - 1];
      navigate(`/manga/${mangaId}/read/${prevChapter.id}`);
    } else if (direction === 'next' && currentChapterIndex < chapters.length - 1) {
      const nextChapter = chapters[currentChapterIndex + 1];
      navigate(`/manga/${mangaId}/read/${nextChapter.id}`);
    }
  };

  const handleChapterSelect = (chapter) => {
    navigate(`/manga/${mangaId}/read/${chapter.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chapter...</p>
        </div>
      </div>
    );
  }

  if (!isLoading && paywall.locked && currentChapter && !paywallChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6 w-full max-w-md text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Unlock Chapter</h2>
          <p className="text-gray-600 dark:text-dark-200 mb-4">
            Chapter {currentChapter.chapterNumber} requires {paywall.price} coins to read.
          </p>
          <div className="text-sm text-gray-600 dark:text-dark-300 mb-4">Your balance: {coins} coins</div>
          <div className="flex items-center justify-center space-x-3">
            <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white dark:bg-dark-700 dark:text-dark-100">Back</button>
            <button onClick={handleUnlock} disabled={unlocking} className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50">
              {unlocking ? 'Unlocking...' : `Unlock for ${paywall.price}`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!manga || !currentChapter) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chapter Not Found</h2>
          <p className="text-gray-600 mb-4">The chapter you're looking for doesn't exist.</p>
          <Link 
            to={`/manga/${mangaId}`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Manga
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
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

      {/* Navigation Bar */}
      <div className="bg-white dark:bg-dark-800 border-b dark:border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateToChapter('prev')}
                disabled={currentChapterIndex === 0}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                  currentChapterIndex === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Previous
              </button>
              
              <span className="text-sm text-gray-500 dark:text-dark-300">
                {currentChapterIndex + 1} of {chapters.length}
              </span>
              
              <button
                onClick={() => navigateToChapter('next')}
                disabled={currentChapterIndex === chapters.length - 1}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                  currentChapterIndex === chapters.length - 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('reader')}
                className={`p-2 rounded-lg ${
                  viewMode === 'reader'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <BookOpen className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${
                  viewMode === 'list'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
                                            <button
                 onClick={() => setViewMode('grid')}
                 className={`p-2 rounded-lg ${
                   viewMode === 'grid'
                     ? 'bg-blue-100 text-blue-600'
                     : 'text-gray-400 hover:text-gray-600'
                 }`}
               >
                 <Grid className="h-4 w-4" />
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {viewMode === 'reader' && (
          <>
            <ChapterReader 
              chapter={currentChapter} 
              manga={manga}
              onNavigate={navigateToChapter}
              currentIndex={currentChapterIndex}
              totalChapters={chapters.length}
            />

            {/* Compact Bottom Controls: Prev | Chapters | Next (fixed with safe-area support) */}
            <div
              className="fixed bottom-0 left-0 right-0 z-30 px-4 sm:px-6 lg:px-8 pb-2"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)', transform: 'translateZ(0)' }}
            >
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-3 bg-white dark:bg-dark-800/95 backdrop-blur rounded-lg shadow-sm border border-gray-200/60 dark:border-dark-700/60">
                  <button
                    onClick={() => navigateToChapter('prev')}
                    className="px-3 py-2 text-sm text-center rounded-l-lg text-gray-700 dark:text-dark-100 disabled:opacity-50"
                    disabled={currentChapterIndex === 0}
                  >
                    Prev
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setShowBottomMenu((v) => !v)}
                      className="w-full px-3 py-2 text-sm inline-flex items-center justify-center gap-2 text-gray-700 dark:text-dark-100"
                      aria-label="Open chapter list"
                    >
                      <Menu className="h-4 w-4" />
                      Chapters
                    </button>
                    {showBottomMenu && (
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white dark:bg-dark-800 rounded-md shadow-lg border border-gray-200 dark:border-dark-700 max-h-56 w-64 overflow-auto z-40">
                        {chapters.map((ch) => (
                          <button
                            key={ch.id}
                            onClick={() => {
                              setShowBottomMenu(false);
                              handleChapterSelect(ch);
                            }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-dark-700 ${
                              ch.id === currentChapter.id ? 'bg-gray-100 dark:bg-dark-700 font-medium' : ''
                            }`}
                          >
                            Ch. {ch.chapterNumber}: {ch.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => navigateToChapter('next')}
                    className="px-3 py-2 text-sm text-center rounded-r-lg text-gray-700 dark:text-dark-100 disabled:opacity-50"
                    disabled={currentChapterIndex === chapters.length - 1}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
            {/* Spacer to prevent content being covered by fixed bottom bar (safe-area aware) */}
            <div style={{ height: 'calc(env(safe-area-inset-bottom, 0px) + 64px)' }} />
          </>
        )}

        {viewMode === 'list' && (
          <ChapterList 
            chapters={chapters}
            currentChapterId={currentChapter.id}
            onChapterSelect={handleChapterSelect}
            mangaId={mangaId}
            isAdmin={isAdmin}
          />
        )}

        {viewMode === 'grid' && (
          <ChapterGrid 
            chapters={chapters}
            currentChapterId={currentChapter.id}
            onChapterSelect={handleChapterSelect}
            mangaId={mangaId}
            isAdmin={isAdmin}
          />
        )}
        {/* Recommended under reader */}
        {viewMode === 'reader' && (
          <RecommendedForChapter mangaId={mangaId} excludeId={manga.id} />
        )}
      </div>
    </div>
  );
};

// Chapter Reader Component - Vertical scroll mode displaying all images
const ChapterReader = ({ chapter, manga, onNavigate, currentIndex, totalChapters }) => {
  const [pages, setPages] = useState([]);

  useEffect(() => {
    if (chapter.images && chapter.images.length > 0) {
      // Use the images array as-is to preserve the order set in admin panel
      const actualPages = chapter.images.map((imageUrl, i) => ({
        id: i + 1,
        url: imageUrl,
        alt: `Page ${i + 1}`
      }));
      setPages(actualPages);
    } else {
      const placeholderPages = Array.from({ length: chapter.pages || 20 }, (_, i) => ({
        id: i + 1,
        url: `https://via.placeholder.com/800x1200/f3f4f6/6b7280?text=Page+${i + 1}`,
        alt: `Page ${i + 1}`
      }));
      setPages(placeholderPages);
    }
  }, [chapter]);

  if (pages.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading pages...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chapter Info */}
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Chapter {chapter.chapterNumber}: {chapter.title}
            </h2>
            <p className="text-gray-600">{manga.title}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">{pages.length} pages</p>
            <p className="text-sm text-gray-500">
              {chapter.uploadDate && new Date(chapter.uploadDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-dark-300">
          <div className="flex items-center">
            <Eye className="h-4 w-4 mr-1" />
            {chapter.views || 0} views
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {pages.length} pages
          </div>
        </div>
      </div>

      {/* Vertical reader */}
      <div className="flex justify-center">
        <div className="max-w-4xl w-full space-y-4">
          {pages.map((p) => (
            <img
              key={p.id}
              src={p.url}
              alt={p.alt}
              className="w-full h-auto rounded-lg shadow-sm"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = `https://via.placeholder.com/800x1200/f3f4f6/6b7280?text=Page+${p.id}`;
              }}
            />
          ))}
        </div>
      </div>

      {/* Chapter navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('prev')}
          disabled={currentIndex === 0}
          className={`px-4 py-2 rounded-lg font-medium ${
            currentIndex === 0
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <ArrowLeft className="h-4 w-4 mr-2 inline" />
          Previous Chapter
        </button>

        <button
          onClick={() => onNavigate('next')}
          disabled={currentIndex === totalChapters - 1}
          className={`px-4 py-2 rounded-lg font-medium ${
            currentIndex === totalChapters - 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          Next Chapter
          <ArrowRight className="h-4 w-4 ml-2 inline" />
        </button>
      </div>
    </div>
  );
};

// Chapter List Component
const ChapterList = ({ chapters, currentChapterId, onChapterSelect, mangaId, isAdmin }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">All Chapters</h3>
        {isAdmin && (
          <Link
            to={`/admin/manga/${mangaId}/chapters`}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Manage Chapters
          </Link>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-200">
          {chapters.map((chapter, index) => (
            <div
              key={chapter.id}
              className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                chapter.id === currentChapterId ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
              onClick={() => onChapterSelect(chapter)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                      chapter.id === currentChapterId
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {chapter.chapterNumber}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Chapter {chapter.chapterNumber}: {chapter.title}
                    </h4>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                      <span>{chapter.pages || 0} pages</span>
                      <span>{chapter.views || 0} views</span>
                      {chapter.uploadDate && (
                        <span>{new Date(chapter.uploadDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {isAdmin && (
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/admin/manga/${mangaId}/chapters`}
                      className="p-2 text-gray-400 hover:text-blue-600 rounded-lg"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Chapter Grid Component
const ChapterGrid = ({ chapters, currentChapterId, onChapterSelect, mangaId, isAdmin }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">All Chapters</h3>
        {isAdmin && (
          <Link
            to={`/admin/manga/${mangaId}/chapters`}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Manage Chapters
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {chapters.map((chapter) => (
          <div
            key={chapter.id}
            className={`bg-white rounded-lg shadow-sm p-4 cursor-pointer transition-all hover:shadow-md ${
              chapter.id === currentChapterId ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => onChapterSelect(chapter)}
          >
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3 ${
                chapter.id === currentChapterId
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {chapter.chapterNumber}
              </div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Chapter {chapter.chapterNumber}
              </h4>
              <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                {chapter.title}
              </p>
              <div className="text-xs text-gray-500 space-y-1">
                <div>{chapter.pages || 0} pages</div>
                <div>{chapter.views || 0} views</div>
                {chapter.uploadDate && (
                  <div>{new Date(chapter.uploadDate).toLocaleDateString()}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChapterDetail;

// Lightweight recommended section for Chapter page
const RecommendedForChapter = ({ mangaId }) => {
  const [items, setItems] = React.useState([]);
  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { getRelatedManga } = await import('../services/cloudinaryService');
        const data = await getRelatedManga(mangaId, 6);
        if (active) setItems(data);
      } catch {}
    })();
    return () => { active = false; };
  }, [mangaId]);

  if (!items || items.length === 0) return null;
  return (
    <div className="mt-8 bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">You might also like</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {items.map((m) => (
          <Link key={m.id} to={`/manga/${m.id}`} className="group">
            <div className="overflow-hidden rounded-lg bg-white shadow hover:shadow-md transition-all">
              <img
                src={m.cover}
                alt={m.title}
                className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/300x400/6B7280/FFFFFF?text=Cover'; }}
              />
            </div>
            <div className="mt-1 text-xs font-medium text-gray-900 line-clamp-2 group-hover:text-primary-600">{m.title}</div>
          </Link>
        ))}
      </div>
    </div>
  );
};
