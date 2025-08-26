import React from 'react';
import Navbar from './components/Navbar';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Library from './pages/Library';
import MangaDetail from './pages/MangaDetail';
import Reader from './pages/Reader';
import Search from './pages/Search';
import Categories from './pages/Categories';
import ChapterDetail from './pages/ChapterDetail';
import AdminLayout from './components/Admin/AdminLayout';
import AdminLogin from './pages/Admin/AdminLogin';
import Dashboard from './pages/Admin/Dashboard';
import UploadManga from './pages/Admin/UploadManga';
import MangaManagement from './pages/Admin/MangaManagement';
import ChapterManagement from './pages/Admin/ChapterManagement';
import AllChaptersManagement from './pages/Admin/AllChaptersManagement';
import PopularMangaManagement from './pages/Admin/PopularMangaManagement';
import CoinManagement from './pages/Admin/CoinManagement';
import TestPage from './pages/Admin/TestPage';
import CloudinaryTest from './components/CloudinaryTest';
import FirebaseIndexHelper from './components/FirebaseIndexHelper';
import Auth from './pages/Auth';
import FirebaseConfigChecker from './components/FirebaseConfigChecker';

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

function AppShell() {
  const location = useLocation();
  const isReaderRoute = /^\/manga\/[^/]+\/read\/[^/]+$/.test(location.pathname);

  return (
      <div className="App">
        <ScrollToTop />
        {!isReaderRoute && <Navbar />}
        <div className={isReaderRoute ? 'pt-0' : 'pt-16'}>
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/library" element={<Library />} />
          <Route path="/manga/:id" element={<MangaDetail />} />
          <Route path="/manga/:mangaId/read/:chapterId" element={<ChapterDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<TestPage />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="upload" element={<UploadManga />} />
            <Route path="manga" element={<MangaManagement />} />
            <Route path="chapters" element={<AllChaptersManagement />} />
            <Route path="manga/:mangaId/chapters" element={<ChapterManagement />} />
            <Route path="popular" element={<PopularMangaManagement />} />
            <Route path="coins" element={<CoinManagement />} />
            <Route path="test" element={<TestPage />} />
            <Route path="cloudinary-test" element={<CloudinaryTest />} />
            <Route path="firebase-indexes" element={<FirebaseIndexHelper />} />
          </Route>
          <Route path="/config" element={<FirebaseConfigChecker />} />
          <Route path="/auth" element={<Auth />} />
          </Routes>
        </div>
      </div>
  );
}

// Scroll to top on route change (smooth)
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

export default App;
