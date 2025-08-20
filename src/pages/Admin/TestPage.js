import React from 'react';

const TestPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-green-600">Test Page Working!</h1>
      <p className="text-gray-600 mt-2">If you can see this, the admin routing is working correctly.</p>
      
      <div className="mt-6 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
        <h2 className="text-lg font-semibold text-yellow-800">Current Status</h2>
        <ul className="mt-2 text-yellow-700 space-y-1">
          <li>✅ AdminLayout component is rendering</li>
          <li>✅ Outlet is working</li>
          <li>✅ Routing is functional</li>
          <li>✅ Component is displaying</li>
        </ul>
      </div>
      
      <div className="mt-4 p-4 bg-blue-100 border border-blue-300 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-800">Next Steps</h2>
        <p className="text-blue-700">Now we can rebuild the full Dashboard with all features!</p>
      </div>
    </div>
  );
};

export default TestPage;
