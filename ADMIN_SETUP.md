# Manga Reader Admin Panel Setup Guide

## 🚀 Overview

This guide will help you set up the admin panel for your manga reader website with Cloudinary integration for image storage and management.

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Cloudinary account
- Basic knowledge of React and JavaScript

## 🛠️ Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Cloudinary Setup

#### Step 1: Create a Cloudinary Account
1. Go to [Cloudinary](https://cloudinary.com/) and sign up for a free account
2. Verify your email address

#### Step 2: Get Your Credentials
1. Log in to your Cloudinary dashboard
2. Go to **Settings** → **Access Keys**
3. Copy your:
   - Cloud Name
   - API Key
   - API Secret

#### Step 3: Create Upload Preset
1. Go to **Settings** → **Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Set the following:
   - **Preset name**: `manga_reader`
   - **Signing Mode**: `Unsigned`
   - **Folder**: `manga-covers` (for covers) and `manga-pages` (for pages)
5. Save the preset

#### Step 4: Configure Cloudinary in Your App
Edit `src/utils/cloudinary.js`:

```javascript
export const CLOUDINARY_CONFIG = {
  cloudName: 'your_actual_cloud_name', // Replace with your cloud name
  uploadPreset: 'manga_reader', // Your upload preset name
  apiKey: 'your_api_key', // Your API key
  apiSecret: 'your_api_secret' // Your API secret
};
```

## 🔐 Admin Panel Access

### Default Login Credentials
- **Email**: `admin@manga.com`
- **Password**: `admin123`

### Change Default Credentials
Edit `src/pages/Admin/AdminLogin.js` and update the authentication logic:

```javascript
// Replace this mock authentication with your actual backend
if (formData.email === 'your_admin_email' && formData.password === 'your_admin_password') {
  // Authentication logic
}
```

## 📁 Admin Panel Features

### 1. Dashboard
- Overview statistics (total manga, users, views, chapters)
- Popular manga charts
- Recent activity feed
- Quick action buttons

### 2. Manga Management
- View all manga in a data table
- Search and filter manga by status
- Edit manga details
- Delete manga (with confirmation)
- View manga statistics

### 3. Upload Manga
- Drag & drop cover image upload
- Form validation
- Cloudinary integration
- Progress tracking
- Genre selection
- Status management

### 4. User Management (Coming Soon)
- View all users
- Manage user roles
- User statistics
- Ban/unban users

### 5. Analytics (Coming Soon)
- Traffic analytics
- Popular content
- User engagement
- Revenue tracking

## 🖼️ Image Upload Features

### Supported Formats
- **Cover Images**: JPG, PNG, WEBP (max 5MB)
- **Manga Pages**: JPG, PNG, WEBP (max 10MB per page)

### Cloudinary Transformations
The system automatically optimizes images for different screen sizes:

```javascript
// Thumbnail (300x400)
getThumbnailUrl(imageUrl, 300)

// Responsive images
getResponsiveImageUrls(imageUrl)
// Returns: { small, medium, large, original }
```

## 🔧 Customization

### 1. Add New Admin Routes
Edit `src/App.js`:

```javascript
<Route path="/admin" element={<AdminLayout />}>
  <Route path="your-new-route" element={<YourNewComponent />} />
</Route>
```

### 2. Customize Admin Layout
Edit `src/components/Admin/AdminLayout.js`:

```javascript
const navigation = [
  // Add your new navigation items
  { name: 'Your Feature', href: '/admin/your-feature', icon: YourIcon },
];
```

### 3. Add New Form Fields
Edit `src/pages/Admin/UploadManga.js`:

```javascript
// Add new form fields
<input
  type="text"
  {...register('yourField', { required: 'Field is required' })}
  className="form-input"
  placeholder="Your field"
/>
```

## 🚀 Deployment

### 1. Environment Variables
Create a `.env` file:

```env
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=manga_reader
REACT_APP_CLOUDINARY_API_KEY=your_api_key
```

### 2. Build for Production
```bash
npm run build
```

### 3. Deploy
- **Netlify**: Drag and drop the `build` folder
- **Vercel**: Connect your GitHub repository
- **AWS S3**: Upload the `build` folder to an S3 bucket

## 🔒 Security Considerations

### 1. Admin Authentication
- Implement proper JWT authentication
- Use secure password hashing
- Add rate limiting for login attempts
- Implement session management

### 2. Cloudinary Security
- Use signed uploads for sensitive content
- Implement server-side signature generation
- Set up proper CORS policies
- Use environment variables for credentials

### 3. API Security
- Implement proper CORS headers
- Add request validation
- Use HTTPS in production
- Implement API rate limiting

## 🐛 Troubleshooting

### Common Issues

#### 1. Cloudinary Upload Fails
- Check your cloud name and upload preset
- Verify your upload preset is set to "Unsigned"
- Check browser console for CORS errors

#### 2. Admin Login Not Working
- Verify the credentials in `AdminLogin.js`
- Check browser console for errors
- Ensure localStorage is enabled

#### 3. Images Not Loading
- Check Cloudinary URLs in browser network tab
- Verify image URLs are correct
- Check Cloudinary account status

### Debug Mode
Enable debug logging in `src/utils/cloudinary.js`:

```javascript
const DEBUG = true;

if (DEBUG) {
  console.log('Upload response:', data);
}
```

## 📞 Support

If you encounter any issues:

1. Check the browser console for errors
2. Verify your Cloudinary configuration
3. Ensure all dependencies are installed
4. Check the network tab for failed requests

## 🔄 Updates

To update the admin panel:

1. Pull the latest changes
2. Run `npm install` to update dependencies
3. Test the admin panel functionality
4. Deploy the updated version

## 📝 License

This admin panel is part of the Manga Reader project. Please refer to the main project license for usage terms.
