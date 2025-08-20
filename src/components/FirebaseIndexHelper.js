import React, { useState } from 'react';

const FirebaseIndexHelper = () => {
  const [showDetails, setShowDetails] = useState(false);

  const requiredIndexes = [
    {
      collection: 'chapters',
      fields: ['mangaId', 'chapterNumber'],
      description: 'For querying chapters by manga and ordering by chapter number',
      example: 'where("mangaId", "==", "manga123") + orderBy("chapterNumber", "asc")'
    },
    {
      collection: 'manga',
      fields: ['createdAt'],
      description: 'For ordering manga by creation date',
      example: 'orderBy("createdAt", "desc")'
    }
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Firebase Index Requirements</h2>
      
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">ℹ️ Why Indexes Are Needed</h3>
        <p className="text-blue-700 text-sm">
          Firebase Firestore requires composite indexes when you combine <code>where</code> clauses with <code>orderBy</code> 
          on different fields. This ensures efficient querying of your data.
        </p>
      </div>

      <div className="space-y-4">
        {requiredIndexes.map((index, idx) => (
          <div key={idx} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">
              Collection: <code className="bg-gray-200 px-2 py-1 rounded">{index.collection}</code>
            </h4>
            <p className="text-gray-600 text-sm mb-2">{index.description}</p>
            <div className="mb-2">
              <span className="text-sm font-medium text-gray-700">Fields: </span>
              <code className="bg-gray-200 px-2 py-1 rounded text-sm">
                {index.fields.join(' + ')}
              </code>
            </div>
            <div className="mb-2">
              <span className="text-sm font-medium text-gray-700">Example Query: </span>
              <code className="bg-gray-200 px-2 py-1 rounded text-sm">
                {index.example}
              </code>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">🔧 How to Create Indexes</h3>
        <div className="text-sm text-yellow-700 space-y-2">
          <ol className="list-decimal list-inside space-y-1 ml-4">
            <li>Go to <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Firebase Console</a></li>
            <li>Select your project: <strong>manga-data-12b1b</strong></li>
            <li>Navigate to Firestore Database → Indexes</li>
            <li>Click "Create Index"</li>
            <li>Select the collection and add the required fields</li>
            <li>Set the order (ascending/descending) for each field</li>
            <li>Click "Create" and wait for the index to build</li>
          </ol>
        </div>
      </div>

      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Current Status</h3>
        <p className="text-green-700 text-sm">
          Your app will work without these indexes, but queries will be slower and may fail. 
          The app includes fallback logic to handle missing indexes gracefully.
        </p>
      </div>

      <button
        onClick={() => setShowDetails(!showDetails)}
        className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        {showDetails ? 'Hide' : 'Show'} Technical Details
      </button>

      {showDetails && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Technical Details</h4>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              <strong>Index Type:</strong> Composite Index (multiple fields)
            </p>
            <p>
              <strong>Query Pattern:</strong> where + orderBy on different fields
            </p>
            <p>
              <strong>Performance Impact:</strong> Without indexes, Firestore will return an error or use inefficient query plans
            </p>
            <p>
              <strong>Fallback Strategy:</strong> The app catches index errors and falls back to manual sorting
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FirebaseIndexHelper;
