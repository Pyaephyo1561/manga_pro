// Simple mock service - no external dependencies
import { mockMangaData, mockChapters } from '../utils/firebase';

// Manga operations
export const addManga = async (mangaData) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const newManga = {
    id: Date.now().toString(),
    ...mangaData,
    createdAt: new Date().toISOString()
  };
  mockMangaData.push(newManga);
  return newManga;
};

export const updateManga = async (mangaId, updateData) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const index = mockMangaData.findIndex(manga => manga.id === mangaId);
  if (index !== -1) {
    mockMangaData[index] = { ...mockMangaData[index], ...updateData };
    return mockMangaData[index];
  }
  throw new Error('Manga not found');
};

export const deleteManga = async (mangaId) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const index = mockMangaData.findIndex(manga => manga.id === mangaId);
  if (index !== -1) {
    mockMangaData.splice(index, 1);
    return true;
  }
  throw new Error('Manga not found');
};

export const getAllManga = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockMangaData;
};

export const getMangaById = async (mangaId) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockMangaData.find(manga => manga.id === mangaId);
};

export const searchManga = async (searchTerm) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const term = searchTerm.toLowerCase();
  return mockMangaData.filter(manga => 
    manga.title.toLowerCase().includes(term) ||
    manga.author.toLowerCase().includes(term) ||
    manga.genres.some(genre => genre.toLowerCase().includes(term))
  );
};

export const getMangaByCategory = async (category) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockMangaData.filter(manga => 
    manga.genres.some(genre => 
      genre.toLowerCase() === category.toLowerCase()
    )
  );
};

// Chapter operations
export const addChapter = async (chapterData) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const newChapter = {
    id: Date.now().toString(),
    ...chapterData,
    createdAt: new Date().toISOString()
  };
  mockChapters.push(newChapter);
  return newChapter;
};

export const updateChapter = async (chapterId, updateData) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const index = mockChapters.findIndex(chapter => chapter.id === chapterId);
  if (index !== -1) {
    mockChapters[index] = { ...mockChapters[index], ...updateData };
    return mockChapters[index];
  }
  throw new Error('Chapter not found');
};

export const deleteChapter = async (chapterId, mangaId) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const index = mockChapters.findIndex(chapter => chapter.id === chapterId);
  if (index !== -1) {
    mockChapters.splice(index, 1);
    return true;
  }
  throw new Error('Chapter not found');
};

export const getChaptersByMangaId = async (mangaId) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockChapters.filter(chapter => chapter.mangaId === mangaId);
};

export const getChapterById = async (chapterId) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockChapters.find(chapter => chapter.id === chapterId);
};

// Stats
export const getMangaStats = async () => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return {
    totalManga: mockMangaData.length,
    totalChapters: mockChapters.length,
    totalViews: mockMangaData.reduce((sum, manga) => sum + manga.views, 0),
    averageRating: mockMangaData.reduce((sum, manga) => sum + manga.rating, 0) / mockMangaData.length
  };
};
