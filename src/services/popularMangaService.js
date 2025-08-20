// Service for managing popular manga data
export const getPopularManga = () => {
  try {
    const savedPopular = localStorage.getItem('popularManga');
    if (savedPopular) {
      const popularManga = JSON.parse(savedPopular);
      // Validate that we have valid data
      if (Array.isArray(popularManga) && popularManga.length > 0) {
        // Remove duplicates based on ID and sort by popularOrder
        const uniqueManga = popularManga.filter((manga, index, self) => 
          index === self.findIndex(m => m.id === manga.id)
        );
        return uniqueManga.sort((a, b) => a.popularOrder - b.popularOrder);
      }
    }
  } catch (error) {
    console.error('Error loading popular manga:', error);
  }
  return [];
};

export const savePopularManga = (popularManga) => {
  try {
    localStorage.setItem('popularManga', JSON.stringify(popularManga));
    return true;
  } catch (error) {
    console.error('Error saving popular manga:', error);
    return false;
  }
};

export const getDefaultPopularManga = (allManga) => {
  return allManga.slice(0, 10).map((manga, index) => ({
    ...manga,
    popularOrder: index + 1
  }));
};

export const addToPopular = (manga, currentPopular) => {
  // Check if manga is already in popular list
  if (currentPopular.some(pm => pm.id === manga.id)) {
    return currentPopular; // Don't add duplicates
  }
  
  const newPopularManga = {
    ...manga,
    popularOrder: currentPopular.length + 1
  };
  return [...currentPopular, newPopularManga];
};

export const removeFromPopular = (mangaId, currentPopular) => {
  const updatedPopular = currentPopular
    .filter(manga => manga.id !== mangaId)
    .map((manga, index) => ({
      ...manga,
      popularOrder: index + 1
    }));
  return updatedPopular;
};

export const movePopularManga = (fromIndex, toIndex, currentPopular) => {
  if (fromIndex === toIndex) return currentPopular;
  
  const updatedPopular = [...currentPopular];
  const [movedItem] = updatedPopular.splice(fromIndex, 1);
  updatedPopular.splice(toIndex, 0, movedItem);
  
  // Update order numbers
  updatedPopular.forEach((manga, idx) => {
    manga.popularOrder = idx + 1;
  });
  
  return updatedPopular;
};
