import React, { useState, useEffect } from 'react';
import { testFirestoreConnection } from '../utils/firebase';
import { testCloudinaryConnection, getCloudinaryConfig } from '../services/cloudinaryService';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Settings, Database, Cloud, Info } from 'lucide-react';

const FirebaseConfigChecker = () => {
  const [firebaseStatus, setFirebaseStatus] = useState('checking');
  const [cloudinaryStatus, setCloudinaryStatus] = useState('checking');
  const [showConfig, setShowConfig] = useState(false);
  const [cloudinaryConfig, setCloudinaryConfig] = useState(null);

  useEffect(() => {
    checkFirebaseConnection();
    checkCloudinaryConnection();
    setCloudinaryConfig(getCloudinaryConfig());
  }, []);

  const checkFirebaseConnection = async () => {
    try {
      const isConnected = await testFirestoreConnection();
      setFirebaseStatus(isConnected ? 'connected' : 'failed');
    } catch (error) {
      setFirebaseStatus('failed');
    }
  };

  const checkCloudinaryConnection = async () => {
    try {
      const isConnected = await testCloudinaryConnection();
      setCloudinaryStatus(isConnected ? 'connected' : 'failed');
    } catch (error) {
      setCloudinaryStatus('failed');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'failed':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'checking':
        return <AlertCircle className="h-6 w-6 text-yellow-500 animate-pulse" />;
      default:
        return <AlertCircle className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'failed':
        return 'Connection Failed';
      case 'checking':
        return 'Checking...';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'checking':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-dark-900">Service Status</h2>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
        >
          <Settings className="h-4 w-4" />
          <span>Configuration</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Firebase Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200"
        >
          <div className="flex items-center space-x-3 mb-3">
            <Database className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="font-semibold text-dark-900">Firebase Firestore</h3>
              <p className="text-sm text-dark-600">Database for manga metadata</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(firebaseStatus)}
            <span className={`font-medium ${getStatusColor(firebaseStatus)}`}>
              {getStatusText(firebaseStatus)}
            </span>
          </div>
        </motion.div>

        {/* Cloudinary Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200"
        >
          <div className="flex items-center space-x-3 mb-3">
            <Cloud className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="font-semibold text-dark-900">Cloudinary</h3>
              <p className="text-sm text-dark-600">Image storage service</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(cloudinaryStatus)}
            <span className={`font-medium ${getStatusColor(cloudinaryStatus)}`}>
              {getStatusText(cloudinaryStatus)}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Configuration Instructions */}
      {showConfig && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="border-t pt-6"
        >
          <h3 className="text-lg font-semibold text-dark-900 mb-4">Configuration Instructions</h3>
          
          <div className="space-y-6">
            {/* Firebase Configuration */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Firebase Setup</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                <li>Go to <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="underline">Firebase Console</a></li>
                <li>Create a new project or select existing project</li>
                <li>Enable Firestore Database in Build → Firestore Database</li>
                <li>Go to Project Settings → General → Your apps</li>
                <li>Add a web app and copy the config</li>
                <li>Update the config in <code className="bg-blue-100 px-1 rounded">src/utils/firebase.js</code></li>
                <li>Set Firestore security rules to allow read/write</li>
              </ol>
            </div>

            {/* Cloudinary Configuration */}
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">Cloudinary Setup</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-green-800">
                <li>Go to <a href="https://cloudinary.com" target="_blank" rel="noopener noreferrer" className="underline">Cloudinary</a> and create an account</li>
                <li>Get your Cloud Name from the dashboard</li>
                <li>Create an upload preset in Settings → Upload → Upload presets</li>
                <li>Set <strong>Signing Mode</strong> to <strong>Unsigned</strong></li>
                <li>Update the config in <code className="bg-green-100 px-1 rounded">src/services/cloudinaryService.js</code></li>
                <li>Set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET</li>
              </ol>
            </div>

            {/* Current Configuration */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Current Configuration</h4>
              <div className="text-sm text-gray-700 space-y-2">
                <div>
                  <strong>Firebase Project ID:</strong> manga-data-12b1b
                </div>
                {cloudinaryConfig && (
                  <>
                    <div>
                      <strong>Cloudinary Cloud Name:</strong> {cloudinaryConfig.cloudName}
                    </div>
                    <div>
                      <strong>Upload Preset:</strong> {cloudinaryConfig.uploadPreset}
                    </div>
                    <div>
                      <strong>API Key:</strong> {cloudinaryConfig.hasApiKey ? 'Configured' : 'Not configured'}
                    </div>
                    <div>
                      <strong>Upload URL:</strong> 
                      <code className="bg-gray-100 px-1 rounded ml-1 text-xs">
                        {cloudinaryConfig.uploadUrl}
                      </code>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Cloudinary API Details */}
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2">Cloudinary API Details</h4>
              <div className="text-sm text-purple-800 space-y-2">
                <p><strong>Current Setup:</strong> Using unsigned uploads (no API key required)</p>
                <p><strong>Security:</strong> Upload preset controls access</p>
                <p><strong>Benefits:</strong> Simple setup, no server-side code needed</p>
                <p><strong>Limitations:</strong> Less secure than signed uploads</p>
              </div>
              <div className="mt-3 p-3 bg-purple-100 rounded">
                <p className="text-xs text-purple-700">
                  <strong>Note:</strong> For production, consider using signed uploads with API key and secret for better security.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Important Notes</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
              <li>Make sure Firestore is enabled in your Firebase project</li>
              <li>Set Firestore security rules to allow read/write operations</li>
              <li>Verify your Cloudinary upload preset allows unsigned uploads</li>
              <li>Check that your Firebase project ID matches the configuration</li>
              <li>Cloudinary unsigned uploads work without API keys but are less secure</li>
            </ul>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-4 mt-6">
        <button
          onClick={checkFirebaseConnection}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Database className="h-4 w-4" />
          <span>Test Firebase</span>
        </button>
        <button
          onClick={checkCloudinaryConnection}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
        >
          <Cloud className="h-4 w-4" />
          <span>Test Cloudinary</span>
        </button>
        <button
          onClick={() => setCloudinaryConfig(getCloudinaryConfig())}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
        >
          <Info className="h-4 w-4" />
          <span>Refresh Config</span>
        </button>
      </div>
    </div>
  );
};

export default FirebaseConfigChecker;
