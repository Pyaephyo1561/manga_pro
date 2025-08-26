import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Upload,
  BarChart3,
  FileText,
  TrendingUp,
  Coins
} from 'lucide-react';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔍 AdminLayout useEffect running...');
    const user = localStorage.getItem('adminUser');
    console.log('👤 User from localStorage:', user);
    if (user) {
      setAdminUser(JSON.parse(user));
      console.log('✅ Admin user set:', JSON.parse(user));
    } else {
      console.log('❌ No admin user found, redirecting to login');
      navigate('/admin/login');
    }
  }, [navigate]);

  console.log('🔄 AdminLayout render - adminUser:', adminUser, 'location:', location.pathname);

  if (!adminUser) {
    console.log('❌ No admin user, returning null');
    return <div>Loading...</div>;
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manga Management', href: '/admin/manga', icon: BookOpen },
    { name: 'Upload Manga', href: '/admin/upload', icon: Upload },
    { name: 'Chapters', href: '/admin/chapters', icon: FileText },
    { name: 'Popular Manga', href: '/admin/popular', icon: TrendingUp },
    { name: 'Coin Management', href: '/admin/coins', icon: Coins },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Simple header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-3">
              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle menu"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <h1 className="text-lg md:text-xl font-bold text-gray-900">Manga Admin</h1>
            </div>
            <div className="flex items-center space-x-3 md:space-x-4">
              <span className="text-sm text-gray-600">Welcome, {adminUser.email}</span>
              <button
                onClick={() => {
                  localStorage.removeItem('adminUser');
                  navigate('/admin/login');
                }}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop nav */}
          <nav className="hidden md:flex space-x-6">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`py-3 px-1 border-b-2 font-medium text-sm ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Mobile nav */}
          {sidebarOpen && (
            <div className="md:hidden py-2">
              <div className="grid grid-cols-2 gap-2 py-2">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center space-x-2 p-2 rounded-lg text-sm border ${
                        isActive
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
