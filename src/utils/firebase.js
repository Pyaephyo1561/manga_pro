import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, getDocs, getDoc, doc, query, orderBy, limit, where, serverTimestamp, setDoc } from 'firebase/firestore';

// Firebase configuration (prefer env, fallback to current values)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDFYOtnvlVFS8YOaJo-n6rgMphUIaqSEeQ",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "manga-data-12b1b.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "manga-data-12b1b",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "manga-data-12b1b.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "498429715127",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:498429715127:web:d22cdb37010b37f567a332"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'YOUR_API_KEY') {
  // eslint-disable-next-line no-console
  console.warn('Firebase apiKey is missing/placeholder. Set REACT_APP_FIREBASE_API_KEY.');
}

// Test Firestore connection
export const testFirestoreConnection = async () => {
  try {
    console.log('🧪 Testing Firebase connection...');
    console.log('📋 Project ID:', firebaseConfig.projectId);
    console.log('🔑 API Key:', firebaseConfig.apiKey.substring(0, 10) + '...');
    
    // Test basic connection
    const testQuery = query(collection(db, 'test'), limit(1));
    await getDocs(testQuery);
    console.log('✅ Firebase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
    
    // Provide specific troubleshooting based on error
    if (error.code === 'permission-denied') {
      console.error('🔒 Permission denied - Check Firestore security rules');
      console.error('💡 Go to Firebase Console → Firestore → Rules and set to allow read/write');
    } else if (error.code === 'unavailable') {
      console.error('🌐 Service unavailable - Check if Firestore is enabled');
      console.error('💡 Go to Firebase Console → Firestore Database → Create Database');
    } else if (error.code === 'not-found') {
      console.error('🔍 Project not found - Check project ID and configuration');
    } else if (error.message.includes('400')) {
      console.error('🚫 Bad Request - This usually means Firestore is not enabled');
      console.error('💡 Go to Firebase Console → Firestore Database → Create Database');
    } else if (error.message.includes('403')) {
      console.error('🚫 Forbidden - Check if Firestore is enabled and rules allow access');
    }
    
    return false;
  }
};

// Firestore operations
export const addMangaToFirestore = async (mangaData) => {
  try {
    const docRef = await addDoc(collection(db, 'manga'), {
      ...mangaData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, ...mangaData };
  } catch (error) {
    console.error('Error adding manga to Firestore:', error);
    throw error;
  }
};

export const updateMangaInFirestore = async (id, updateData) => {
  try {
    const mangaRef = doc(db, 'manga', id);
    await updateDoc(mangaRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    return { id, ...updateData };
  } catch (error) {
    console.error('Error updating manga in Firestore:', error);
    throw error;
  }
};

export const deleteMangaFromFirestore = async (id) => {
  try {
    const mangaRef = doc(db, 'manga', id);
    await deleteDoc(mangaRef);
    return true;
  } catch (error) {
    console.error('Error deleting manga from Firestore:', error);
    throw error;
  }
};

export const getAllMangaFromFirestore = async () => {
  try {
    console.log('🔍 Fetching all manga from Firestore...');
    
    // First try with ordering (requires index on createdAt)
    try {
      const q = query(collection(db, 'manga'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const manga = [];
      querySnapshot.forEach((doc) => {
        manga.push({ id: doc.id, ...doc.data() });
      });
      
      console.log(`✅ Found ${manga.length} manga with ordering`);
      return manga;
    } catch (indexError) {
      console.warn('⚠️ Index error, trying without ordering:', indexError.message);
      
      // Fallback: get manga without ordering
      const q = query(collection(db, 'manga'));
      const querySnapshot = await getDocs(q);
      const manga = [];
      querySnapshot.forEach((doc) => {
        manga.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort manually by createdAt if available
      manga.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return dateB - dateA; // Descending order
      });
      
      console.log(`✅ Found ${manga.length} manga without ordering (manual sort)`);
      return manga;
    }
  } catch (error) {
    console.error('❌ Error getting manga from Firestore:', error);
    
    // Provide helpful error message for index issues
    if (error.message.includes('requires an index')) {
      console.error('💡 This query requires a composite index. Please create it using the link in the error message.');
      console.error('🔗 Index creation link:', error.message.match(/https:\/\/console\.firebase\.google\.com[^\s]+/)?.[0] || 'Check Firebase Console');
    }
    
    // Return empty array as fallback
    return [];
  }
};

export const getMangaByIdFromFirestore = async (id) => {
  try {
    const mangaRef = doc(db, 'manga', id);
    const mangaSnap = await getDoc(mangaRef);
    if (mangaSnap.exists()) {
      return { id: mangaSnap.id, ...mangaSnap.data() };
    } else {
      console.log(`Manga with ID ${id} not found in Firestore`);
      return null;
    }
  } catch (error) {
    console.error('Error getting manga from Firestore:', error);
    return null;
  }
};

export const searchMangaInFirestore = async (searchTerm) => {
  try {
    const q = query(
      collection(db, 'manga'),
      where('title', '>=', searchTerm),
      where('title', '<=', searchTerm + '\uf8ff')
    );
    const querySnapshot = await getDocs(q);
    const manga = [];
    querySnapshot.forEach((doc) => {
      manga.push({ id: doc.id, ...doc.data() });
    });
    return manga;
  } catch (error) {
    console.error('Error searching manga in Firestore:', error);
    return [];
  }
};

export const getMangaByCategoryFromFirestore = async (category) => {
  try {
    const q = query(
      collection(db, 'manga'),
      where('genres', 'array-contains', category)
    );
    const querySnapshot = await getDocs(q);
    const manga = [];
    querySnapshot.forEach((doc) => {
      manga.push({ id: doc.id, ...doc.data() });
    });
    return manga;
  } catch (error) {
    console.error('Error getting manga by category from Firestore:', error);
    return [];
  }
};

// Chapter operations
export const addChapterToFirestore = async (chapterData) => {
  try {
    const docRef = await addDoc(collection(db, 'chapters'), {
      ...chapterData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, ...chapterData };
  } catch (error) {
    console.error('Error adding chapter to Firestore:', error);
    throw error;
  }
};

export const updateChapterInFirestore = async (id, updateData) => {
  try {
    const chapterRef = doc(db, 'chapters', id);
    await updateDoc(chapterRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    return { id, ...updateData };
  } catch (error) {
    console.error('Error updating chapter in Firestore:', error);
    throw error;
  }
};

export const deleteChapterFromFirestore = async (id) => {
  try {
    const chapterRef = doc(db, 'chapters', id);
    await deleteDoc(chapterRef);
    return true;
  } catch (error) {
    console.error('Error deleting chapter from Firestore:', error);
    throw error;
  }
};

export const getChaptersByMangaIdFromFirestore = async (mangaId) => {
  try {
    console.log('🔍 Fetching chapters for manga:', mangaId);
    
    // First try with ordering (requires composite index)
    try {
      const q = query(
        collection(db, 'chapters'),
        where('mangaId', '==', mangaId),
        orderBy('chapterNumber', 'asc')
      );
      const querySnapshot = await getDocs(q);
      const chapters = [];
      querySnapshot.forEach((doc) => {
        chapters.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort manually as fallback if orderBy fails
      chapters.sort((a, b) => (a.chapterNumber || 0) - (b.chapterNumber || 0));
      
      console.log(`✅ Found ${chapters.length} chapters for manga ${mangaId}`);
      return chapters;
    } catch (indexError) {
      console.warn('⚠️ Index error, trying without ordering:', indexError.message);
      
      // Fallback: get chapters without ordering and sort manually
      const q = query(
        collection(db, 'chapters'),
        where('mangaId', '==', mangaId)
      );
      const querySnapshot = await getDocs(q);
      const chapters = [];
      querySnapshot.forEach((doc) => {
        chapters.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort manually
      chapters.sort((a, b) => (a.chapterNumber || 0) - (b.chapterNumber || 0));
      
      console.log(`✅ Found ${chapters.length} chapters for manga ${mangaId} (manual sort)`);
      return chapters;
    }
  } catch (error) {
    console.error('❌ Error getting chapters from Firestore:', error);
    
    // Provide helpful error message for index issues
    if (error.message.includes('requires an index')) {
      console.error('💡 This query requires a composite index. Please create it using the link in the error message.');
      console.error('🔗 Index creation link:', error.message.match(/https:\/\/console\.firebase\.google\.com[^\s]+/)?.[0] || 'Check Firebase Console');
    }
    
    // Return empty array as fallback
    return [];
  }
};

export const getChapterByIdFromFirestore = async (id) => {
  try {
    const chapterRef = doc(db, 'chapters', id);
    const chapterSnap = await getDoc(chapterRef);
    if (chapterSnap.exists()) {
      return { id: chapterSnap.id, ...chapterSnap.data() };
    } else {
      console.log(`Chapter with ID ${id} not found in Firestore`);
      return null;
    }
  } catch (error) {
    console.error('Error getting chapter from Firestore:', error);
    return null;
  }
};

// Stats
export const getMangaStatsFromFirestore = async () => {
  try {
    const mangaQuery = query(collection(db, 'manga'));
    const chaptersQuery = query(collection(db, 'chapters'));
    
    const [mangaSnapshot, chaptersSnapshot] = await Promise.all([
      getDocs(mangaQuery),
      getDocs(chaptersQuery)
    ]);
    
    const totalManga = mangaSnapshot.size;
    const totalChapters = chaptersSnapshot.size;
    
    let totalViews = 0;
    let totalRating = 0;
    let totalRatings = 0;
    
    mangaSnapshot.forEach((doc) => {
      const data = doc.data();
      totalViews += data.views || 0;
      totalRating += (data.rating || 0) * (data.totalRatings || 0);
      totalRatings += data.totalRatings || 0;
    });
    
    const averageRating = totalRatings > 0 ? totalRating / totalRatings : 0;
    
    return {
      totalManga,
      totalChapters,
      totalViews,
      averageRating
    };
  } catch (error) {
    console.error('Error getting manga stats from Firestore:', error);
    throw error;
  }
};

// ===============================
// User favorites and history
// ===============================

// Favorites
export const isMangaFavoritedByUser = async (userId, mangaId) => {
  try {
    if (!userId || !mangaId) return false;
    const favRef = doc(db, 'users', userId, 'favorites', mangaId);
    const favSnap = await getDoc(favRef);
    return favSnap.exists();
  } catch (error) {
    console.error('Error checking favorite:', error);
    return false;
  }
};

export const addMangaToUserFavorites = async (userId, mangaId) => {
  try {
    const favRef = doc(db, 'users', userId, 'favorites', mangaId);
    await setDoc(favRef, {
      mangaId,
      addedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error adding favorite:', error);
    throw error;
  }
};

export const removeMangaFromUserFavorites = async (userId, mangaId) => {
  try {
    const favRef = doc(db, 'users', userId, 'favorites', mangaId);
    await deleteDoc(favRef);
    return true;
  } catch (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
};

export const getUserFavoritesFromFirestore = async (userId) => {
  try {
    if (!userId) return [];
    const favsQuery = query(collection(db, 'users', userId, 'favorites'));
    const favsSnapshot = await getDocs(favsQuery);
    const favorites = [];
    for (const docSnap of favsSnapshot.docs) {
      const fav = docSnap.data();
      const manga = await getMangaByIdFromFirestore(fav.mangaId);
      if (manga) {
        favorites.push({ ...manga, addedDate: fav.addedAt?.toDate?.() || null });
      }
    }
    return favorites;
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    return [];
  }
};

// Reading history
export const recordReadingHistoryForUser = async (userId, mangaId, chapterId, chapterNumber) => {
  try {
    if (!userId || !mangaId) return false;
    const historyRef = doc(db, 'users', userId, 'history', mangaId);
    await setDoc(historyRef, {
      mangaId,
      lastChapterId: chapterId || null,
      lastChapterNumber: chapterNumber || null,
      lastReadAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error recording reading history:', error);
    return false;
  }
};

export const getUserReadingHistoryFromFirestore = async (userId) => {
  try {
    if (!userId) return [];
    const historyQuery = query(collection(db, 'users', userId, 'history'));
    const historySnapshot = await getDocs(historyQuery);
    const history = [];
    for (const docSnap of historySnapshot.docs) {
      const h = docSnap.data();
      const manga = await getMangaByIdFromFirestore(h.mangaId);
      if (manga) {
        history.push({
          ...manga,
          lastRead: h.lastReadAt?.toDate?.() || null,
          currentChapter: h.lastChapterNumber || null,
          lastChapterId: h.lastChapterId || null
        });
      }
    }
    // Sort by lastRead desc
    history.sort((a, b) => (b.lastRead?.getTime?.() || 0) - (a.lastRead?.getTime?.() || 0));
    return history;
  } catch (error) {
    console.error('Error fetching reading history:', error);
    return [];
  }
};

// ===============================
// Recommendations
// ===============================
export const getRelatedMangaFromFirestore = async (mangaId, maxResults = 8) => {
  try {
    const source = await getMangaByIdFromFirestore(mangaId);
    if (!source) return [];

    const sourceGenres = Array.isArray(source.genres) ? source.genres.slice(0, 10) : [];
    if (sourceGenres.length === 0) {
      // Fallback: return most recent manga excluding self
      const qRecent = query(collection(db, 'manga'), orderBy('createdAt', 'desc'), limit(maxResults + 1));
      const snap = await getDocs(qRecent);
      const items = [];
      snap.forEach((d) => {
        if (d.id !== mangaId) items.push({ id: d.id, ...d.data() });
      });
      return items.slice(0, maxResults);
    }

    // Query by overlapping genres (array-contains-any supports up to 10 values)
    const qRelated = query(
      collection(db, 'manga'),
      where('genres', 'array-contains-any', sourceGenres)
    );
    const relatedSnap = await getDocs(qRelated);
    const candidates = [];
    relatedSnap.forEach((d) => {
      if (d.id === mangaId) return;
      const data = d.data();
      const genres = Array.isArray(data.genres) ? data.genres : [];
      const overlap = genres.filter((g) => sourceGenres.includes(g)).length;
      const views = data.totalViews || data.views || 0;
      const rating = data.rating || 0;
      const score = overlap * 10 + rating * 2 + Math.min(views / 10000, 10);
      candidates.push({ id: d.id, ...data, _score: score, _overlap: overlap });
    });

    candidates.sort((a, b) => b._score - a._score);
    return candidates.slice(0, maxResults).map(({ _score, _overlap, ...rest }) => rest);
  } catch (error) {
    console.error('Error getting related manga:', error);
    return [];
  }
};

export const deleteUserHistoryEntryFromFirestore = async (userId, mangaId) => {
  try {
    if (!userId || !mangaId) return false;
    const historyRef = doc(db, 'users', userId, 'history', mangaId);
    await deleteDoc(historyRef);
    return true;
  } catch (error) {
    console.error('Error deleting history entry:', error);
    return false;
  }
};

export const clearUserReadingHistoryFromFirestore = async (userId) => {
  try {
    if (!userId) return false;
    const historyQuery = query(collection(db, 'users', userId, 'history'));
    const snapshot = await getDocs(historyQuery);
    const deletions = snapshot.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deletions);
    return true;
  } catch (error) {
    console.error('Error clearing reading history:', error);
    return false;
  }
};
