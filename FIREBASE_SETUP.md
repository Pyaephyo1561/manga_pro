# Firebase & Cloudinary Setup Guide

## 🔥 Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project" or select existing project
3. Enter project name: `manga-data-12b1b`
4. Follow the setup wizard

### 2. Enable Firestore Database
1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click **Create Database**
3. Choose **Start in test mode** (for development)
4. Select a location close to your users

### 3. Get Firebase Config
1. Go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click **Add app** → **Web**
4. Register app with nickname (e.g., "manga-web")
5. Copy the config object

### 4. Update Firebase Config
Replace the placeholder config in `src/utils/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "manga-data-12b1b.firebaseapp.com",
  projectId: "manga-data-12b1b",
  storageBucket: "manga-data-12b1b.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 5. Set Firestore Security Rules
In Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // For development only
    }
  }
}
```

## ☁️ Cloudinary Setup

### 1. Create Cloudinary Account
1. Go to [Cloudinary](https://cloudinary.com)
2. Sign up for free account
3. Get your **Cloud Name** from dashboard

### 2. Create Upload Preset
1. Go to **Settings** → **Upload**
2. Scroll to **Upload presets**
3. Click **Add upload preset**
4. Set **Signing Mode** to **Unsigned**
5. Save the preset name

### 3. Update Cloudinary Config
Update `src/services/cloudinaryService.js`:

```javascript
const CLOUDINARY_CLOUD_NAME = 'YOUR_CLOUD_NAME';
const CLOUDINARY_UPLOAD_PRESET = 'YOUR_PRESET_NAME';
```

## 🚀 Test Your Setup

### 1. Check Service Status
1. Go to `/config` in your app
2. Check Firebase and Cloudinary connection status
3. Use the test buttons to verify connections

### 2. Test Admin Panel
1. Go to `/admin` and login
2. Try uploading a manga with cover image
3. Check if data appears in Firebase Console
4. Verify images are uploaded to Cloudinary

## 🔧 Troubleshooting

### Firebase Issues
- **"CONFIGURATION_NOT_FOUND"**: Check project ID in config
- **"Permission denied"**: Update Firestore security rules
- **"Firestore not enabled"**: Enable Firestore in Firebase Console

### Cloudinary Issues
- **"Upload failed"**: Check cloud name and upload preset
- **"CORS error"**: Verify upload preset allows unsigned uploads
- **"Invalid preset"**: Ensure preset name matches exactly

### General Issues
- **Admin panel not working**: Check browser console for errors
- **Images not loading**: Verify Cloudinary URLs are accessible
- **Data not saving**: Check Firebase connection and rules

## 📱 Current Configuration

Your app is currently configured with:
- **Firebase Project**: `manga-data-12b1b`
- **Cloudinary Cloud**: `duhguprsm`
- **Upload Preset**: `ml_default`

## 🎯 Next Steps

1. **Update Firebase config** with your actual credentials
2. **Update Cloudinary config** with your cloud name and preset
3. **Test connections** using the `/config` page
4. **Upload your first manga** through the admin panel
5. **Verify data** appears in Firebase Console and Cloudinary

## 📞 Need Help?

If you encounter issues:
1. Check the browser console for error messages
2. Verify your Firebase and Cloudinary credentials
3. Ensure all services are properly enabled
4. Check the `/config` page for connection status

The admin panel will work once both Firebase and Cloudinary are properly configured!
