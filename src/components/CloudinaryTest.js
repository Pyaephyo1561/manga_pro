import React, { useState } from 'react';
import { testCloudinaryConnection, getCloudinaryConfig } from '../services/cloudinaryService';

const CloudinaryTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  const runTest = async () => {
    setIsTesting(true);
    try {
      const result = await testCloudinaryConnection();
      setTestResult({ success: result, timestamp: new Date().toISOString() });
    } catch (error) {
      setTestResult({ success: false, error: error.message, timestamp: new Date().toISOString() });
    } finally {
      setIsTesting(false);
    }
  };

  const config = getCloudinaryConfig();

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Cloudinary Connection Test</h2>
      
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Current Configuration</h3>
        <div className="space-y-2 text-sm">
          <div><strong>Cloud Name:</strong> {config.cloudName}</div>
          <div><strong>Upload Preset:</strong> {config.uploadPreset}</div>
          <div><strong>API Key:</strong> {config.apiKey ? 'Configured' : 'Not configured'}</div>
          <div><strong>API Secret:</strong> {config.hasApiSecret ? 'Configured' : 'Not configured'}</div>
        </div>
      </div>

      <button
        onClick={runTest}
        disabled={isTesting}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isTesting ? 'Testing...' : 'Test Connection'}
      </button>

      {testResult && (
        <div className={`mt-4 p-4 rounded-lg ${
          testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <h3 className={`text-lg font-semibold ${
            testResult.success ? 'text-green-800' : 'text-red-800'
          }`}>
            {testResult.success ? '✅ Connection Successful' : '❌ Connection Failed'}
          </h3>
          <p className={`text-sm ${
            testResult.success ? 'text-green-700' : 'text-red-700'
          }`}>
            {testResult.success 
              ? 'Cloudinary is working correctly!' 
              : testResult.error || 'Unknown error occurred'
            }
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Tested at: {testResult.timestamp}
          </p>
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Troubleshooting</h3>
        <div className="text-sm text-yellow-700 space-y-2">
          <p><strong>If the test fails:</strong></p>
          <ol className="list-decimal list-inside space-y-1 ml-4">
            <li>Check if the upload preset "manga_reader" exists in your Cloudinary dashboard</li>
            <li>Verify the cloud name is correct</li>
            <li>Make sure the upload preset is set to "unsigned" for client-side uploads</li>
            <li>Check if your Cloudinary account is active</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default CloudinaryTest;
