# 🚨 URGENT: Fix Firebase Connection Error

## **❌ Current Problem**
You're getting a **400 Bad Request** error when trying to connect to Firebase. This means your Firebase configuration has placeholder values.

## **🔧 Quick Fix (5 minutes)**

### **Step 1: Get Your Firebase Config**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: **manga-data-12b1b**
3. Click **⚙️ Settings** (gear icon) → **Project settings**
4. Scroll to **Your apps** section

### **Step 2: Add Web App (if none exists)**
1. Click **Add app** → **Web** (</>)
2. Enter nickname: `manga-web`
3. Click **Register app**
4. **Copy the config object**

### **Step 3: Update Your Code**
Replace the placeholder values in `src/utils/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...", // ✅ Your actual API key
  authDomain: "manga-data-12b1b.firebaseapp.com", // ✅ Already correct
  projectId: "manga-data-12b1b", // ✅ Already correct
  storageBucket: "manga-data-12b1b.appspot.com", // ✅ Already correct
  messagingSenderId: "123456789012", // ✅ Your actual sender ID
  appId: "1:123456789012:web:abcdef..." // ✅ Your actual app ID
};
```

## **🔍 What to Look For**

Your config should look like this:
```javascript
// ❌ DON'T USE THESE (placeholders):
apiKey: "YOUR_ACTUAL_API_KEY_HERE"
messagingSenderId: "YOUR_ACTUAL_SENDER_ID_HERE"
appId: "YOUR_ACTUAL_APP_ID_HERE"

// ✅ USE THESE (real values from Firebase):
apiKey: "AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz"
messagingSenderId: "123456789012"
appId: "1:123456789012:web:abcdefghijklmnopqrstuvwxyz"
```

## **🧪 Test After Update**

1. **Save the file**
2. **Go to `/config`** in your app
3. **Click "Test Firebase"** button
4. **Check console** for connection status

## **❌ Common Issues**

### **Issue: "400 Bad Request"**
- **Cause**: Invalid API key or configuration
- **Fix**: Replace placeholder values with real Firebase config

### **Issue: "Project not found"**
- **Cause**: Wrong project ID
- **Fix**: Verify project ID matches your Firebase project

### **Issue: "Permission denied"**
- **Cause**: Firestore security rules too restrictive
- **Fix**: Set rules to allow read/write (for development)

## **🔒 Firestore Security Rules**

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

## **✅ Success Checklist**

- [ ] Firebase config updated with real values
- [ ] Firestore Database enabled
- [ ] Security rules set to allow read/write
- [ ] `/config` page shows "Connected" status
- [ ] Admin panel works without errors

## **🚀 After Fix**

Once Firebase is connected:
1. **Admin panel** will work properly
2. **Manga uploads** will save to Firebase
3. **Chapter management** will store data
4. **Home page** will fetch real data

## **📞 Need Help?**

If you still get errors after updating the config:
1. Check browser console for specific error messages
2. Verify all config values are copied correctly
3. Ensure Firestore is enabled in your Firebase project
4. Check that security rules allow read/write operations

**Your admin panel is 99% ready - just need the real Firebase config!** 🎯
