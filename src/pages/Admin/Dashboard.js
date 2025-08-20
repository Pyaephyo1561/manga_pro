import React from 'react';
import CloudinaryTest from '../../components/CloudinaryTest';
import FirebaseIndexHelper from '../../components/FirebaseIndexHelper';

const Dashboard = () => {
  console.log('🎯 Simple Dashboard rendering...');
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-blue-600">Admin Dashboard</h1>
      <p className="text-gray-600 mt-2">This is a simple test dashboard</p>
      
      <div className="mt-6 p-4 bg-green-100 border border-green-300 rounded-lg">
        <h2 className="text-lg font-semibold text-green-800">Status</h2>
        <p className="text-green-700">Dashboard is working!</p>
      </div>
      
      <div className="mt-4 p-4 bg-blue-100 border border-blue-300 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-800">Quick Actions</h2>
        <div className="mt-2 space-y-2">
          <button 
            onClick={() => window.location.href = '/admin/upload'}
            className="block w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Upload Manga
          </button>
          <button 
            onClick={() => window.location.href = '/admin/manga'}
            className="block w-full p-3 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Manage Manga
          </button>
          <button 
            onClick={() => window.location.href = '/admin/popular'}
            className="block w-full p-3 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Manage Popular Manga
          </button>
        </div>
      </div>

      {/* Firebase Index Helper Section */}
      <div className="mt-8">
        <FirebaseIndexHelper />
      </div>

      {/* Cloudinary Test Section */}
      <div className="mt-8">
        <CloudinaryTest />
      </div>
    </div>
  );
};

export default Dashboard;
