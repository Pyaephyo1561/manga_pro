// Cloudinary service for image uploads
import { 
  addMangaToFirestore, 
  updateMangaInFirestore, 
  deleteMangaFromFirestore,
  addChapterToFirestore,
  updateChapterInFirestore,
  deleteChapterFromFirestore,
  getAllMangaFromFirestore,
  getMangaByIdFromFirestore,
  searchMangaInFirestore,
  getMangaByCategoryFromFirestore,
  getChaptersByMangaIdFromFirestore,
  getMangaStatsFromFirestore
} from '../utils/firebase';

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'duhguprsm'; // Your cloud name
const CLOUDINARY_UPLOAD_PRESET = 'manga_reader'; // Your upload preset

// For signed uploads (more secure, optional)
const CLOUDINARY_API_KEY = '264647281823911'; // Add your API key here if using signed uploads
const CLOUDINARY_API_SECRET = 'Gd_n3JosyWbRBi8NHwyXr_vVFAY'; // Add your API secret here if using signed uploads

// Upload images to Cloudinary
export const uploadToCloudinary = async (files) => {
  try {
    console.log('🚀 Starting Cloudinary upload...');
    console.log('📁 Files to upload:', files.length);
    console.log('☁️ Cloud Name:', CLOUDINARY_CLOUD_NAME);
    console.log('📝 Upload Preset:', CLOUDINARY_UPLOAD_PRESET);
    
    // Normalize files to a proper Array<File>
    let fileArray;
    if (Array.isArray(files)) {
      fileArray = files;
    } else if (files && typeof files === 'object' && 'length' in files && typeof files.item === 'function') {
      // Likely a FileList
      fileArray = Array.from(files);
    } else if (files) {
      fileArray = [files];
    } else {
      fileArray = [];
    }
    const uploadPromises = fileArray.map((file, index) => {
      return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);
        
        // Remove problematic parameters that might cause 400 errors
        // formData.append('folder', 'manga-reader');
        // formData.append('transformation', 'f_auto,q_auto');

        console.log(`📤 Uploading file ${index + 1}/${fileArray.length}:`, file.name);
        console.log(`📋 Form data:`, {
          file: file.name,
          upload_preset: CLOUDINARY_UPLOAD_PRESET,
          cloud_name: CLOUDINARY_CLOUD_NAME
        });

        fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: formData,
        })
        .then(response => {
          console.log(`📡 Response status: ${response.status} ${response.statusText}`);
          if (!response.ok) {
            return response.text().then(text => {
              console.error(`❌ Upload failed for file ${index + 1}:`, text);
              throw new Error(`HTTP ${response.status}: ${response.statusText} - ${text}`);
            });
          }
          return response.json();
        })
        .then(data => {
          if (data.secure_url) {
            console.log(`✅ File ${index + 1} uploaded successfully:`, data.secure_url);
            resolve(data.secure_url);
          } else {
            console.error(`❌ Upload failed for file ${index + 1}:`, data);
            reject(new Error('Upload failed - no URL returned'));
          }
        })
        .catch(error => {
          console.error(`❌ Error uploading file ${index + 1}:`, error);
          reject(error);
        });
      });
    });

    const uploadedUrls = await Promise.all(uploadPromises);
    console.log('🎉 All files uploaded successfully!');
    console.log('📋 Uploaded URLs:', uploadedUrls);
    
    return uploadedUrls;
  } catch (error) {
    console.error('❌ Cloudinary upload failed:', error);
    throw error; // Don't fallback to mock data, let the error propagate
  }
};

// Test Cloudinary connection
export const testCloudinaryConnection = async () => {
  try {
    console.log('🧪 Testing Cloudinary connection...');
    console.log('☁️ Cloud Name:', CLOUDINARY_CLOUD_NAME);
    console.log('📝 Upload Preset:', CLOUDINARY_UPLOAD_PRESET);
    
    // Test basic API access
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/ping`);
    
    if (response.ok) {
      console.log('✅ Cloudinary API accessible');
      
      // Test upload preset specifically
      try {
        const testResponse = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload_presets`);
        
        if (testResponse.ok) {
          const presets = await testResponse.json();
          console.log('✅ Cloudinary upload presets accessible');
          console.log('📋 Available presets:', presets);
          
          // Check if our preset exists
          const presetExists = presets.presets && presets.presets.some(preset => preset.name === CLOUDINARY_UPLOAD_PRESET);
          if (presetExists) {
            console.log('✅ Upload preset found:', CLOUDINARY_UPLOAD_PRESET);
            return true;
          } else {
            console.log('❌ Upload preset not found:', CLOUDINARY_UPLOAD_PRESET);
            console.log('💡 Available presets:', presets.presets?.map(p => p.name) || []);
            return false;
          }
        } else {
          console.log('⚠️ Upload presets not accessible:', testResponse.status, testResponse.statusText);
          return false;
        }
      } catch (presetError) {
        console.log('⚠️ Error checking upload presets:', presetError);
        return false;
      }
    } else {
      console.log('❌ Cloudinary API not accessible:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ Cloudinary connection test failed:', error);
    return false;
  }
};

// Get Cloudinary configuration for debugging
export const getCloudinaryConfig = () => {
  return {
    cloudName: CLOUDINARY_CLOUD_NAME,
    uploadPreset: CLOUDINARY_UPLOAD_PRESET,
    apiKey: CLOUDINARY_API_KEY,
    hasApiSecret: !!CLOUDINARY_API_SECRET
  };
};

// Re-export Firebase functions for unified service API
export const addManga = async (mangaData) => {
  try {
    return await addMangaToFirestore(mangaData);
  } catch (error) {
    console.error('Error adding manga:', error);
    throw error;
  }
};

export const updateManga = async (id, updateData) => {
  try {
    return await updateMangaInFirestore(id, updateData);
  } catch (error) {
    console.error('Error updating manga:', error);
    throw error;
  }
};

export const deleteManga = async (id) => {
  try {
    return await deleteMangaFromFirestore(id);
  } catch (error) {
    console.error('Error deleting manga:', error);
    throw error;
  }
};

export const getAllManga = async () => {
  try {
    const manga = await getAllMangaFromFirestore();
    return manga || [];
  } catch (error) {
    console.error('Error getting all manga:', error);
    return [];
  }
};

export const getMangaById = async (id) => {
  try {
    const manga = await getMangaByIdFromFirestore(id);
    if (!manga) {
      console.log(`Manga with ID ${id} not found`);
      return null;
    }
    return manga;
  } catch (error) {
    console.error('Error getting manga by ID:', error);
    return null;
  }
};

export const searchManga = async (searchTerm) => {
  try {
    const manga = await searchMangaInFirestore(searchTerm);
    return manga || [];
  } catch (error) {
    console.error('Error searching manga:', error);
    return [];
  }
};

export const getMangaByCategory = async (category) => {
  try {
    const manga = await getMangaByCategoryFromFirestore(category);
    return manga || [];
  } catch (error) {
    console.error('Error getting manga by category:', error);
    return [];
  }
};

export const addChapter = async (chapterData) => {
  try {
    return await addChapterToFirestore(chapterData);
  } catch (error) {
    console.error('Error adding chapter:', error);
    throw error;
  }
};

export const updateChapter = async (id, updateData) => {
  try {
    return await updateChapterInFirestore(id, updateData);
  } catch (error) {
    console.error('Error updating chapter:', error);
    throw error;
  }
};

export const deleteChapter = async (id) => {
  try {
    return await deleteChapterFromFirestore(id);
  } catch (error) {
    console.error('Error deleting chapter:', error);
    throw error;
  }
};

export const getChaptersByMangaId = async (mangaId) => {
  try {
    const chapters = await getChaptersByMangaIdFromFirestore(mangaId);
    return chapters || [];
  } catch (error) {
    console.error('Error getting chapters by manga ID:', error);
    return [];
  }
};

export const getMangaStats = async () => {
  try {
    return await getMangaStatsFromFirestore();
  } catch (error) {
    console.error('Error getting manga stats:', error);
    throw error;
  }
};

// Favorites and history - re-export helpers
export { 
  isMangaFavoritedByUser,
  addMangaToUserFavorites,
  removeMangaFromUserFavorites,
  getUserFavoritesFromFirestore,
  recordReadingHistoryForUser,
  getUserReadingHistoryFromFirestore
} from '../utils/firebase';

export {
  deleteUserHistoryEntryFromFirestore,
  clearUserReadingHistoryFromFirestore
} from '../utils/firebase';

export { getRelatedMangaFromFirestore as getRelatedManga } from '../utils/firebase';
